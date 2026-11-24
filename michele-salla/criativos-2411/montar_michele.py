"""Monta os 5 criativos da Michele (gancho + corpo + CTA) a partir dos brutos do Drive.
Corta pausas > 0,45 s, alterna zoom a cada corte, legenda queimada e volume -14 LUFS."""
import json, subprocess, sys, os

SP = os.path.dirname(os.path.abspath(__file__))
VID = f"{SP}/videos_drive"
OUT = sys.argv[1] if len(sys.argv) > 1 else f"{SP}/saida"
TMP = f"{SP}/tmp_montagem"
os.makedirs(OUT, exist_ok=True); os.makedirs(TMP, exist_ok=True)
PAL = json.load(open(f"{SP}/palavras.json"))

# (vídeo, início, fim) da tomada escolhida, em segundos do bruto
TOMADAS = {
    11: (0.5, 6.9), 12: (12.4, 18.6), 13: (0.5, 9.8), 14: (0.2, 7.3), 15: (2.2, 8.5),
    6: (22.4, 39.4), 7: (46.4, 66.7), 8: (0.4, 18.6), 9: (31.6, 49.2), 10: (24.0, 43.4),
    1: (11.5, 18.6), 2: (0.0, 5.2), 3: (0.2, 7.9), 4: (0.1, 9.6), 5: (0.4, 6.5),
}
CRIATIVOS = [
    ("C1-canetinha", [11, 6, 3]),
    ("C2-calca", [12, 8, 4]),
    ("C3-abdominal", [15, 9, 1]),
    ("C4-cinta", [13, 10, 5]),
    ("C5-verao", [14, 7, 2]),
]

def corrigir(n, ws):
    """Corrige erros do Whisper sem mudar o que ela falou."""
    out = []; i = 0
    while i < len(ws):
        w, s, e = ws[i]
        if w == "S" and i + 1 < len(ws) and ws[i + 1][0].startswith("."):
            j = i
            while j + 1 < len(ws) and ws[j + 1][0].startswith("."): j += 1
            out.append(["Saiba Mais,", s, ws[j][2]]); i = j + 1; continue
        if w == "a" and i + 1 < len(ws) and ws[i + 1][0] == "bidominal": i += 1; continue
        rep = {"Michelle": "Michele", "Sala,": "Salla,", "arrotina": "a rotina,", "toquem,": "toca em", "toquem": "toca em",
               "bidominal": "abdominal", "abdômenal": "abdominal", "cinturão": "Cinturão", "diva,": "Diva:",
               "ataca": "atacam", "aparecendo": "aparecer", "500": "R$ 500", "fecha,": "fecha,"}.get(w, w)
        if w == "reais": i += 1; continue
        if n == 9 and w == "uma" and i + 1 < len(ws) and ws[i + 1][0] == "sua": rep = "a"
        if n == 9 and w == "1." and i + 1 < len(ws) and ws[i + 1][0] == "Alimenta": rep = "Um"; ws[i + 1][0] = "alimenta"
        if n == 9 and w in ("2.", "3."): rep = {"2.": "Dois:", "3.": "Três:"}[w]
        if n == 9 and w == "1." and rep == "1.": rep = "Um:"
        if n == 9 and w == "Um" and out and out[-1][0] == "Um:": rep = "um"
        if n == 7 and w == "à": rep = "a"
        if n == 4 and w == "corpo": rep = "corpo,"
        if n == 12 and w == "calça" and not out: rep = "A calça"
        out.append([rep, s, e]); i += 1
    return out

def frases(n):
    a, b = TOMADAS[n]
    ws = [list(x) for x in PAL[str(n)] if x[1] >= a and x[1] < b]
    ws = corrigir(n, ws)
    grupos = [[ws[0]]]
    for w in ws[1:]:
        (grupos[-1].append(w) if w[1] - grupos[-1][-1][2] <= 0.45 else grupos.append([w]))
    res = []
    for g in grupos:
        ini = max(a, g[0][1] - 0.12); fim = min(b, g[-1][2] + 0.22)
        res.append((ini, fim, g))
    return res

def ts(t):
    h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return f"{h}:{m:02d}:{s:05.2f}"

def legenda(eventos, path):
    cab = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: L,Inter Display Black,84,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,1,0,0,0,100,100,0,0,1,7,2,2,80,80,620,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    with open(path, "w") as f:
        f.write(cab)
        for s, e, txt in eventos:
            f.write(f"Dialogue: 0,{ts(s)},{ts(e)},L,,0,0,0,,{txt}\n")

def montar(nome, ids):
    partes = []; eventos = []; t = 0.0; k = 0
    for n in ids:
        for ini, fim, g in frases(n):
            dur = fim - ini
            z = 1.0 if k % 2 == 0 else 1.13
            vf = (f"crop=iw/{z}:ih/{z}:(iw-iw/{z})/2:(ih-ih/{z})*0.25,scale=1080:1920,setsar=1,fps=30" if z > 1
                  else "scale=1080:1920,setsar=1,fps=30")
            p = f"{TMP}/{nome}_{k:02d}.mp4"
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{ini:.3f}", "-t", f"{dur:.3f}", "-i", f"{VID}/AD{n}.mp4",
                            "-vf", vf, "-af", f"afade=t=in:d=0.03,afade=t=out:st={dur-0.05:.3f}:d=0.05,aresample=48000",
                            "-c:v", "libx264", "-preset", "fast", "-crf", "18", "-c:a", "aac", "-b:a", "192k", "-ac", "2", p], check=True)
            real = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p],
                                        capture_output=True, text=True).stdout)
            # legenda: blocos de até 3 palavras, quebra na pontuação
            bloco = []
            def fecha(bl):
                if not bl: return
                s = t + bl[0][1] - ini; e = t + bl[-1][2] - ini + 0.05
                eventos.append([max(t, s), min(t + real, e), " ".join(x[0] for x in bl).upper()])
            for w in g:
                if bloco and len(" ".join(x[0] for x in bloco + [w])) > 18: fecha(bloco); bloco = []
                bloco.append(w)
                if len(bloco) == 3 or w[0][-1] in ",.:?!": fecha(bloco); bloco = []
            fecha(bloco)
            partes.append(p); t += real; k += 1
    # cada legenda fica até a próxima começar (sem piscar)
    for i in range(len(eventos) - 1):
        if eventos[i + 1][0] - eventos[i][1] < 0.4: eventos[i][1] = eventos[i + 1][0]
    lista = f"{TMP}/{nome}.txt"
    open(lista, "w").write("".join(f"file '{p}'\n" for p in partes))
    ass = f"{TMP}/{nome}.ass"; legenda(eventos, ass)
    final = f"{OUT}/{nome}.mp4"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lista,
                    "-vf", f"ass={ass}", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11",
                    "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p",
                    "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", final], check=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", "0.8", "-i", final, "-frames:v", "1", f"{OUT}/{nome}-capa.jpg"], check=True)
    print(f"{nome}: {t:.1f}s, {len(partes)} cortes, {len(eventos)} legendas")
    return eventos

if __name__ == "__main__":
    so = sys.argv[2:] if len(sys.argv) > 2 else None
    for nome, ids in CRIATIVOS:
        if so and nome not in so: continue
        ev = montar(nome, ids)
        json.dump(ev, open(f"{TMP}/{nome}_legendas.json", "w"), ensure_ascii=False)
