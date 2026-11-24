"""Criativos da Michele, versão final (v3): montagem frase por frase dos 15 trechos.
Cortes de pausa, leve aceleração, cor, zoom alternado, imagens de apoio, títulos, legenda com destaque,
trilha original com ducking, efeitos sonoros e CTA. Uso: python3 montar_v3.py SAIDA [01 02 ...]"""
import json, subprocess, sys, os, unicodedata
import numpy as np
import montar_michele as base  # PAL (palavras) e corrigir()

SP = os.path.dirname(os.path.abspath(__file__))
VID = f"{SP}/videos_drive"
OUT = sys.argv[1]; TMP = f"{SP}/tmp_v3"
os.makedirs(OUT, exist_ok=True); os.makedirs(TMP, exist_ok=True)
VEL = 1.07                     # aceleração leve (natural)
A = "/home/user/CLIENTES/michele-salla/desafio-7em7/assets"
FOTO = {
    "canetinha": f"{A}/src/cartoes/c3e-canetinha.jpg", "calca": f"{A}/src/cartoes/c2-calca-nao-fecha.jpg",
    "roupa": f"{A}/src/cartoes/c1-roupa-marcando.jpg", "tempo": f"{A}/src/cartoes/c4-pouco-tempo.jpg",
    "prato": f"{A}/src/cartoes/c5-sem-dieta-radical.jpg", "docinho": f"{A}/src/cartoes/c6-mente-sabota.jpg",
    "respira": f"{A}/src/cartoes/c6e-mente-e-corpo.jpg", "espelho": f"{A}/img/foto-espelho.webp",
    "praia": f"{SP}/canva/p1.png", "cinta": f"{SP}/canva/p2.png", "celular": f"{SP}/canva/p3.png",
}
TRILHA = {"A": (f"{SP}/musica/trilha_A_leve_pop.mp3", 104), "B": (f"{SP}/musica/trilha_B_emocional.mp3", 96),
          "C": (f"{SP}/musica/trilha_C_energia.mp3", 112)}

# Frases: id -> (trecho, início, fim no bruto, texto de referência, deixas)
# deixas: (palavra, ação) ação = ("img", foto) | ("tag", texto, cor) | ("num", n) | ("cta",) | ("nome",)
F = {
 "h11": (11, 0.5, 7.5, "Uma caixa de canetinha passa de R$ 500 por mês. Todo mês.",
         [("canetinha", ("img", "canetinha")), ("r$", ("tag", "R$ 500 POR MÊS", "red"))]),
 "h12": (12, 12.4, 19.0, "A calça fecha de manhã, mas aperta de noite. Isso tem explicação.",
         [("explicacao", ("tag", "TEM EXPLICAÇÃO", "pink"))]),
 "h13": (13, 0.5, 10.0, "Existe um músculo que segura sua barriga por dentro, como se fosse uma cinta. E depois dos 35 ele pode simplesmente desligar.",
         [("cinta", ("img", "cinta")), ("desligar", ("tag", "ELE PODE DESLIGAR", "red"))]),
 "h14": (14, 0.2, 7.5, "O verão está chegando, e dieta radical de última hora é o que vai fazer a sua barriga voltar.",
         [("verao", ("img", "praia")), ("dieta", ("tag", "DIETA RADICAL", "red"))]),
 "h15": (15, 2.2, 9.0, "Depois dos 35, abdominal nenhum resolve a barriga. E tem um motivo.",
         [("abdominal", ("tag", "ABDOMINAL NÃO RESOLVE", "red")), ("motivo", ("tag", "TEM UM MOTIVO", "pink"))]),
 "s6a": (6, 22.5, 27.5, "A canetinha precisa de receita, cobra todo mês e não ensina o hábito.",
         [("canetinha", ("img", "canetinha")), ("habito", ("tag", "NÃO ENSINA O HÁBITO", "red"))]),
 "s6b": (6, 27.6, 34.5, "O que eu ensino é diferente: 15 minutos por dia, em casa, sem academia e sem dieta radical.",
         [("15", ("img", "tempo")), ("academia", ("tag", "SEM ACADEMIA · SEM DIETA RADICAL", "pink"))]),
 "s6b1": (6, 7.1, 12.9, "O que eu ensino é diferente: 15 minutos por dia, em casa, sem academia, sem dieta radical.",
          [("15", ("img", "tempo")), ("academia", ("tag", "SEM ACADEMIA · SEM DIETA RADICAL", "pink"))]),
 "s6c": (6, 34.6, 39.5, "Você cuida do músculo, da sua barriga e da sua cabeça, junto.",
         [("musculo", ("tag", "MÚSCULO + BARRIGA + CABEÇA", "pink"))]),
 "s7a": (7, 46.5, 51.3, "Eu sou a Michele Salla, educadora física e mentora de emagrecimento comportamental.",
         [("michele", ("nome",))]),
 "s7b": (7, 51.3, 58.5, "Escrevi o livro Vida Diva e há mais de 20 anos eu ajudo mulheres a perder a barriga sem viver de dieta.",
         [("livro", ("tag", "AUTORA DO LIVRO VIDA DIVA", "pink")), ("20", ("tag", "+20 ANOS", "pink"))]),
 "s7c2": (7, 60.4, 66.8, "Primeiro, a gente trabalha a mentalidade, para depois o seu resultado aparecer no corpo.",
          [("mentalidade", ("img", "respira")), ("corpo", ("tag", "MENTE → CORPO", "pink"))]),
 "s8a": (8, 0.5, 8.3, "A calça que não fecha, a roupa escolhida pra esconder a barriga, a foto em que a gente se esconde atrás de alguém,",
         [("calca", ("img", "calca")), ("foto", ("img", "espelho"))]),
 "s8b": (8, 8.4, 13.5, "muita gente diz que é idade, que depois dos filhos é assim mesmo.",
         [("idade", ("tag", "\"É A IDADE\"", "dark"))]),
 "s8c": (8, 13.7, 18.6, "Mas não é normal. Não é falta de força de vontade.", [("normal", ("tag", "NÃO É NORMAL", "red"))]),
 "s8c2": (8, 14.3, 18.6, "Não é normal. Não é falta de força de vontade.", [("vontade", ("tag", "NÃO É FALTA DE FORÇA DE VONTADE", "red"))]),
 "s9a": (9, 31.7, 35.9, "Depois dos 35, três coisas atacam a sua barriga.", [("3", ("tag", "3 COISAS", "red"))]),
 "s9b": (9, 36.0, 39.5, "Um: um músculo que segura a barriga simplesmente desliga.", [("um:", ("num", "1")), ("musculo", ("img", "cinta"))]),
 "s9c": (9, 39.5, 43.8, "Dois: a dieta radical corta tudo e volta tudo.", [("dois:", ("num", "2")), ("dieta", ("img", "prato"))]),
 "s9c2": (9, 40.4, 43.8, "A dieta radical corta tudo e volta tudo.", [("dieta", ("img", "prato"))]),
 "s9d": (9, 43.8, 49.4, "Três: o estresse, o docinho à noite. Um alimenta o outro.", [("tres:", ("num", "3")), ("estresse", ("img", "docinho"))]),
 "s9d2": (9, 44.6, 49.4, "O estresse, o docinho à noite. Um alimenta o outro.", [("estresse", ("img", "docinho"))]),
 "s10a": (10, 24.1, 29.22, "A barriga tem uma cinta natural lá por dentro, que é um músculo, o transverso do abdômen.",
          [("cinta", ("img", "cinta")), ("transverso", ("tag", "TRANSVERSO DO ABDÔMEN", "pink"))]),
 "s10b": (10, 29.22, 34.05, "Quando ele enfraquece, a barriga vai pra frente e abdominal nenhum resolve o problema.",
          [("abdominal", ("tag", "ABDOMINAL NÃO RESOLVE", "red"))]),
 "s10c": (10, 33.75, 43.4, "É por isso que eu criei um método, Cinturão Diva: respiração e hipopressivo, 15 minutinhos por dia, em casa.",
          [("cinturao", ("tag", "MÉTODO CINTURÃO DIVA", "pink")), ("respiracao", ("img", "respira")),
           ("15", ("tag", "15 MIN POR DIA · EM CASA", "pink"))]),
 "c1": (1, 11.5, 18.7, "São 15 minutos por dia em casa. Toca no botão Saiba Mais e vê o plano para a sua rotina.",
        [("15", ("img", "tempo")), ("toca", ("cta",))]),
 "c2": (2, 0.0, 5.3, "O verão não vai esperar. Toca em Saiba Mais e faz o teste hoje.",
        [("verao", ("tag", "O VERÃO NÃO VAI ESPERAR", "red")), ("toca", ("cta",)), ("teste", ("img", "celular"))]),
 "c3": (3, 0.2, 8.4, "O teste é grátis e sem cadastro. No final, você vê o seu plano. Toca em Saiba Mais.",
        [("gratis", ("tag", "TESTE GRÁTIS · SEM CADASTRO", "pink")), ("plano", ("img", "celular")), ("toca", ("cta",))]),
 "c4": (4, 0.2, 9.6, "Cada mulher é única: o corpo, a rotina, a idade. Por isso eu preparei um teste muito rápido. Toca em Saiba Mais e vem comigo.",
        [("unica", ("tag", "CADA MULHER É ÚNICA", "pink")), ("teste", ("img", "celular")), ("toca", ("cta",))]),
 "c5": (5, 0.5, 6.85, "Toca em Saiba Mais, faz o teste: em 3 minutinhos você descobre por onde começar.",
        [("toca", ("cta",)), ("teste", ("img", "celular"))]),
}

CRIATIVOS = {
 "01": ("O custo da canetinha", ["h11", "s6a", "s6b", "s6c", "c3"], "A"),
 "02": ("A calça que aperta à noite", ["h12", "s9a", "s9b", "s9c", "s9d", "c5"], "C"),
 "03": ("Abdominal não resolve", ["h15", "s10a", "s10b", "s10c", "c4"], "B"),
 "04": ("O espelho (identificação)", ["s8a", "s8b", "s8c", "c4"], "B"),
 "05": ("O verão está chegando", ["h14", "s9c2", "s6b1", "c2"], "C"),
 "06": ("Mente e corpo", ["s9d2", "s7c2", "c1"], "A"),
 "07": ("O músculo que desliga", ["h13", "s10b", "s10c", "c3"], "C"),
 "08": ("Quem é a Michele", ["s7a", "s7b", "s6b", "c5"], "A"),
 "09": ("Canetinha × método", ["s6a", "s10a", "s10c", "c5"], "B"),
 "10": ("Não é falta de força de vontade", ["s8c2", "s10a", "s10b", "c1"], "C"),
}

DESTAQUE = {"canetinha", "r$", "500", "habito.", "15", "gratis", "barriga", "barriga.", "barriga,", "musculo", "musculo,",
            "normal,", "normal.", "vontade.", "teste", "teste,", "plano", "plano,", "explicacao.", "motivo.", "desliga.", "desligar.",
            "cinta", "cinta,", "cinturao", "hipopressivo,", "verao", "dieta", "dieta.", "radical.", "mentalidade", "mentalidade,",
            "corpo.", "unica,", "saiba", "mais", "mais.", "mais,", "minutinhos", "3", "35,", "estresse,", "docinho", "voltar.",
            "transverso", "abdominal", "michele", "salla,", "idade,", "noite.", "noite,", "receita,"}
INICIO_MIN = {"s10c": 34.2}   # o fim de "problema" (AD10 33,79 s) fica fora do "É por isso"

def chave(w): return unicodedata.normalize("NFKD", w.lower()).encode("ascii", "ignore").decode().split(" ")[0] if w.strip() else ""

JANELA_PAL = {"s9b": (36.0, 39.1), "s9c": (39.1, 43.8), "s10b": (29.1, 33.75)}  # a transcrição erra o tempo destas palavras
def palavras(fid):
    n, a, b, *_ = F[fid]
    a, b = JANELA_PAL.get(fid, (a, b))
    ws = [list(x) for x in base.PAL[str(n)] if a <= x[1] < b]
    ws = base.corrigir(n, ws)
    if fid == "s8c2" and ws and chave(ws[0][0]) == "mas": ws = ws[1:]
    return n, ws

_AUD = {}
def _audio(n):
    if n not in _AUD:
        raw = subprocess.run(["ffmpeg", "-v", "error", "-i", f"{VID}/AD{n}.mp4", "-ac", "1", "-ar", "16000", "-f", "s16le", "-"],
                             capture_output=True).stdout
        x = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
        fr = 160  # 10 ms
        _AUD[n] = np.array([20 * np.log10(np.sqrt(np.mean(x[i:i + fr] ** 2)) + 1e-9) for i in range(0, len(x) - fr, fr)])
    return _AUD[n]

LIMIAR = -38.0     # dB: abaixo disso é silêncio
JUNTA = 0.20       # pausas menores que isso ficam (fala natural)
def trechos(fid):
    """Corta pelo SOM real: acha os trechos com voz dentro da frase e remove só as pausas >= 0,20 s.
    As palavras da transcrição só servem para a legenda."""
    n, ws = palavras(fid); a, b = F[fid][1], F[fid][2]
    e = _audio(n); i0, i1 = int(a * 100), min(int(b * 100), len(e))
    som = e[i0:i1] > LIMIAR
    runs = []; k = 0
    while k < len(som):
        if som[k]:
            j = k
            while j < len(som) and som[j]: j += 1
            runs.append([(i0 + k) / 100, (i0 + j) / 100]); k = j
        else: k += 1
    # bordas suaves (s, r, f no começo/fim da palavra): estende enquanto houver som acima de -50 dB
    for r in runs:
        k = int(r[0] * 100) - 1; lim = int((r[0] - 0.15) * 100)
        while k > max(i0, lim) and e[k] > -50: k -= 1
        r[0] = (k + 1) / 100
        k = int(r[1] * 100); lim = int((r[1] + 0.25) * 100)
        while k < min(i1, lim) and e[k] > -50: k += 1
        r[1] = k / 100
    juntos = []
    for r in runs:
        if juntos and r[0] - juntos[-1][1] < JUNTA: juntos[-1][1] = max(juntos[-1][1], r[1])
        else: juntos.append(list(r))
    juntos = [r for r in juntos if r[1] - r[0] >= 0.05]      # descarta estalos
    if fid in INICIO_MIN: juntos = [r for r in juntos if r[1] > INICIO_MIN[fid]]
    out = []
    for r in juntos:
        ini = max(a, r[0] - 0.05); fim = min(b, r[1] + 0.08)
        if out and ini < out[-1][1]: ini = out[-1][1]
        out.append([ini, fim, []])
    for w in ws:   # cada palavra vai para o trecho de som mais próximo
        c = (w[1] + w[2]) / 2
        best = min(out, key=lambda o: 0 if o[0] <= c <= o[1] else min(abs(c - o[0]), abs(c - o[1])))
        best[2].append(w)
    # trecho de som sem palavra: gruda no vizinho se estiver perto (a transcrição errou o tempo); senão sai
    k = 0
    while k < len(out):
        if not out[k][2]:
            ant = out[k - 1] if k > 0 else None; prox = out[k + 1] if k + 1 < len(out) else None
            ga = out[k][0] - ant[1] if ant else 9; gp = prox[0] - out[k][1] if prox else 9
            if min(ga, gp) <= 0.40:
                if ga <= gp: ant[1] = out[k][1]
                else: prox[0] = out[k][0]
            out.pop(k); continue
        out[k][2].sort(key=lambda w: w[1]); k += 1
    out = [tuple(o) for o in out if o[2]]
    return n, out

def ts(t):
    t = max(0.0, t); return f"{int(t // 3600)}:{int(t % 3600 // 60):02d}:{t % 60:05.2f}"

AMARELO = "&H004DE1FF&"
ASS = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: L,Inter Display Black,84,&H00FFFFFF,&H00FFFFFF,&H00111111,&H96000000,1,0,0,0,100,100,0,0,1,7,4,2,80,80,680,1
Style: pink,Inter Display Black,72,&H00FFFFFF,&H00FFFFFF,&H007818E9,&H00000000,1,0,0,0,100,100,0,0,3,24,0,8,80,80,285,1
Style: red,Inter Display Black,72,&H00FFFFFF,&H00FFFFFF,&H003539E5,&H00000000,1,0,0,0,100,100,0,0,3,24,0,8,80,80,285,1
Style: dark,Inter Display Black,72,&H00FFFFFF,&H00FFFFFF,&H00201A1A,&H00000000,1,0,0,0,100,100,0,0,3,24,0,8,80,80,285,1
Style: num,Inter Display Black,300,&H00FFFFFF,&H00FFFFFF,&H007818E9,&H64000000,1,0,0,0,100,100,0,0,1,14,6,8,0,0,270,1
Style: cta,Inter Display Black,74,&H00201A1A,&H00FFFFFF,&H004DE1FF,&H00000000,1,0,0,0,100,100,0,0,3,26,0,2,80,80,810,1
Style: nome,Inter Display Black,64,&H00FFFFFF,&H00FFFFFF,&H007818E9,&H00000000,1,0,0,0,100,100,0,0,3,20,0,7,80,80,285,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
POP = r"{\fad(70,140)\fscx60\fscy60\t(0,120,\fscx106\fscy106)\t(120,200,\fscx100\fscy100)}"

def sfx():
    d = f"{TMP}/sfx"; os.makedirs(d, exist_ok=True)
    defs = {"whoosh": "anoisesrc=d=0.45:c=pink:a=0.5,highpass=f=600,lowpass=f=6500,afade=t=in:d=0.25:curve=exp,afade=t=out:st=0.25:d=0.2",
            "pop": "sine=f=920:d=0.08,afade=t=out:st=0.015:d=0.065",
            "ding": "sine=f=1568:d=0.6,volume=0.6,afade=t=out:st=0.04:d=0.56",
            "tum": "sine=f=72:d=0.3,volume=1.2,afade=t=out:st=0.04:d=0.26"}
    for k, f in defs.items():
        p = f"{d}/{k}.wav"
        if not os.path.exists(p):
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", f, "-ar", "48000", "-ac", "2", p], check=True)

def broll(nome, dur):
    p = f"{TMP}/br_{nome}_{dur:.2f}.mov"
    if os.path.exists(p): return p
    n = int(round(dur * 30)) + 2
    fc = ("[0]split[a][b];"
          "[a]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=28:2,eq=brightness=-0.20:saturation=0.9[bg];"
          f"[b]scale=900:-2,zoompan=z='1.0+0.0012*on':d={n}:s=900x675:fps=30:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)',"
          "pad=916:691:8:8:color=white[fg];"
          "[bg][fg]overlay=(W-w)/2:'420+40*exp(-t*14)',format=yuva420p")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-loop", "1", "-framerate", "30", "-t", f"{dur:.3f}", "-i", FOTO[nome],
                    "-filter_complex", fc, "-t", f"{dur:.3f}", "-c:v", "qtrle", p], check=True)
    return p

def montar(num):
    titulo, frases, trilha = CRIATIVOS[num]; nome = f"Criativo_{num}"
    sfx()
    partes, legs, deixas = [], [], []
    t = 0.0; k = 0
    for fi, fid in enumerate(frases):
        n, tr = trechos(fid); usadas = set()
        for j, (ini, fim, g) in enumerate(tr):
            dur = fim - ini
            z = (1.04 if fi % 2 == 0 else 1.15) + (0.035 if j % 2 else 0)   # alterna por frase; micro-zoom nos cortes internos
            vf = (f"crop=iw/{z}:ih/{z}:(iw-iw/{z})/2:(ih-ih/{z})*0.28,scale=1080:1920:flags=lanczos,setsar=1,"
                  f"eq=contrast=1.06:saturation=1.10:brightness=0.012,colorbalance=rs=0.025:bs=-0.02,unsharp=5:5:0.4,"
                  f"fps=30,setpts=(PTS-STARTPTS)/{VEL}")
            af = (f"afade=t=in:d=0.015,afade=t=out:st={dur - 0.035:.3f}:d=0.035,atempo={VEL},"
                  "highpass=f=80,equalizer=f=3000:t=q:w=1:g=2,aresample=48000")
            p = f"{TMP}/{nome}_{k:02d}.mov"
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{ini:.3f}", "-t", f"{dur:.3f}", "-i", f"{VID}/AD{n}.mp4",
                            "-vf", vf, "-af", af, "-c:v", "libx264", "-preset", "fast", "-crf", "16", "-pix_fmt", "yuv420p",
                            "-c:a", "pcm_s16le", "-ac", "2", p], check=True)
            real = float(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a", "-show_entries", "stream=duration",
                                         "-of", "csv=p=0", p], capture_output=True, text=True).stdout)
            T = lambda x: t + (x - ini) / VEL
            for w in g:
                cw = chave(w[0])
                for kw, acao in F[fid][4]:
                    if kw not in usadas and (cw == kw or cw.rstrip(",.:!?") == kw.rstrip(":") and (kw.endswith(":") == cw.endswith(":"))
                                             or (len(kw) >= 4 and cw.startswith(kw))):
                        usadas.add(kw); deixas.append((T(w[1]), acao))
            bloco = []
            def fecha(bl):
                if not bl: return
                txt = " ".join((f"{{\\c{AMARELO}}}{x[0].upper()}{{\\c&H00FFFFFF&}}" if chave(x[0]) in DESTAQUE or
                                chave(x[0]).rstrip(",.:") in DESTAQUE else x[0].upper()) for x in bl)
                legs.append([max(t, T(bl[0][1]) - 0.03), min(t + real, T(bl[-1][2]) + 0.05), txt])
            for w in g:
                if bloco and len(" ".join(x[0] for x in bloco + [w])) > 18: fecha(bloco); bloco = []
                bloco.append(w)
                if len(bloco) == 3 or w[0][-1] in ",.:?!": fecha(bloco); bloco = []
            fecha(bloco)
            partes.append(p); t += real; k += 1
    total = t + 0.45                      # respiro final com a trilha
    for i in range(len(legs) - 1):
        if legs[i + 1][0] - legs[i][1] < 0.45: legs[i][1] = legs[i + 1][0]
    legs[-1][1] = min(total, legs[-1][1] + 0.3)
    ass = [ASS]; imgs = []; sons = [(0.0, "tum")]; tag_fim = 0.0; img_fim = -9.0; cta_t = None; usadas_img = set()
    for a, b, txt in legs:
        ass.append(f"Dialogue: 1,{ts(a)},{ts(b)},L,,0,0,0,,{{\\fscx88\\fscy88\\t(0,70,\\fscx100\\fscy100)}}{txt}")
    for tt, acao in sorted(deixas, key=lambda x: x[0]):
        tipo = acao[0]
        if tipo == "img":
            tt = max(tt, 1.5)   # o primeiro segundo e meio é sempre a Michele
            if tt - img_fim < 2.2 or acao[1] in usadas_img: continue
            usadas_img.add(acao[1])
            d = min(1.6, total - tt - 0.6)
            if d < 0.9: continue
            imgs.append((tt, d, broll(acao[1], d))); sons.append((tt, "whoosh")); img_fim = tt + d
        elif tipo == "tag":
            ini = max(tt, tag_fim + 0.1); fim = min(ini + 1.8, total)
            if ini > total - 0.8: continue
            txt = acao[1]
            if len(txt) > 20:
                if " · " in txt: txt = txt.replace(" · ", "\\N")
                else:
                    pal = txt.split(" "); meio = len(pal) // 2
                    txt = " ".join(pal[:meio]) + "\\N" + " ".join(pal[meio:])
            fs = "" if max(len(l) for l in txt.split("\\N")) <= 20 else "{\\fs62}"
            ass.append(f"Dialogue: 2,{ts(ini)},{ts(fim)},{acao[2]},,0,0,0,,{POP}{fs}{txt}"); tag_fim = fim; sons.append((ini, "pop"))
        elif tipo == "num":
            ass.append(f"Dialogue: 3,{ts(tt)},{ts(tt + 1.0)},num,,0,0,0,,{POP}{acao[1]}"); sons.append((tt, "tum")); tag_fim = max(tag_fim, tt + 1.0)
        elif tipo == "cta" and cta_t is None:
            cta_t = tt
            ass.append(f"Dialogue: 4,{ts(tt)},{ts(total)},cta,,0,0,0,,{{\\fad(120,0)\\fscx70\\fscy70\\t(0,160,\\fscx104\\fscy104)\\t(160,260,\\fscx100\\fscy100)"
                       f"\\t(900,1100,\\fscx106\\fscy106)\\t(1100,1300,\\fscx100\\fscy100)}}TOQUE EM SAIBA MAIS  ↓")
            sons.append((tt, "ding"))
        elif tipo == "nome":
            ass.append(f"Dialogue: 2,{ts(tt)},{ts(tt + 2.8)},nome,,0,0,0,,{{\\fad(120,160)\\move(-450,285,100,285,0,240)\\an7}}MICHELE SALLA\\N{{\\fs42}}Educadora física e mentora"); sons.append((tt, "whoosh"))
    assert cta_t is not None, f"{nome} sem CTA"
    open(f"{TMP}/{nome}.ass", "w").write("\n".join(ass) + "\n")
    # base (fala) contínua
    lst = f"{TMP}/{nome}.txt"; open(lst, "w").write("".join(f"file '{p}'\n" for p in partes))
    base_mov = f"{TMP}/{nome}_base.mov"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst,
                    "-vf", f"tpad=stop_mode=clone:stop_duration=0.6", "-af", "apad=pad_dur=0.6,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120,loudnorm=I=-14:TP=-1.5:LRA=9",
                    "-c:v", "libx264", "-preset", "fast", "-crf", "16", "-pix_fmt", "yuv420p", "-c:a", "pcm_s16le", "-ar", "48000", base_mov], check=True)
    mus, bpm = TRILHA[trilha]; off = 2 * 4 * 60 / bpm
    cmd = ["ffmpeg", "-v", "error", "-y", "-i", base_mov]
    for _, _, p in imgs: cmd += ["-i", p]
    for _, s in sons: cmd += ["-i", f"{TMP}/sfx/{s}.wav"]
    cmd += ["-ss", f"{off:.3f}", "-i", mus]
    fc = []; v = "[0:v]"
    for i, (tt, d, _) in enumerate(imgs, start=1):
        fc.append(f"[{i}:v]fade=t=in:d=0.12:alpha=1,fade=t=out:st={d - 0.14:.2f}:d=0.14:alpha=1,setpts=PTS-STARTPTS+{tt:.3f}/TB[b{i}]")
        fc.append(f"{v}[b{i}]overlay=0:0:eof_action=pass:enable='between(t,{tt:.3f},{tt + d:.3f})'[v{i}]"); v = f"[v{i}]"
    fc.append(f"{v}ass={TMP}/{nome}.ass,drawbox=x=0:y=0:w='iw*min(t/{total:.3f},1)':h=12:color=0xE91878:t=fill,format=yuv420p[vout]")
    o = 1 + len(imgs); mix = []
    for j, (tt, s) in enumerate(sons):
        vol = {"whoosh": 0.28, "pop": 0.35, "ding": 0.35, "tum": 0.55}[s]
        fc.append(f"[{o + j}:a]volume={vol},adelay={int(tt * 1000)}:all=1[s{j}]"); mix.append(f"[s{j}]")
    mi = o + len(sons)
    fc.append("[0:a]asplit=2[voz][chave]")
    fc.append(f"[{mi}:a]aresample=48000,atrim=0:{total:.3f},volume=0.22,afade=t=in:d=0.2,afade=t=out:st={total - 0.9:.3f}:d=0.9[m0]")
    fc.append("[m0][chave]sidechaincompress=threshold=0.03:ratio=4:attack=20:release=400:makeup=1[mus]")
    fc.append(f"[voz][mus]{''.join(mix)}amix=inputs={2 + len(mix)}:normalize=0:duration=first,alimiter=limit=0.84,"
              f"apad,atrim=0:{total:.3f}[aout]")
    final = f"{OUT}/{nome}.mp4"
    cmd += ["-filter_complex", ";".join(fc), "-map", "[vout]", "-map", "[aout]", "-t", f"{total:.3f}",
            "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-profile:v", "high", "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", final]
    subprocess.run(cmd, check=True)
    json.dump({"titulo": titulo, "frases": frases, "trilha": trilha, "total": total, "legendas": legs,
               "imagens": [(round(a, 2), round(d, 2), os.path.basename(p)) for a, d, p in imgs]},
              open(f"{TMP}/{nome}.json", "w"), ensure_ascii=False, indent=1)
    print(f"{nome} ({titulo}): {total:.1f}s · {len(partes)} cortes · {len(imgs)} imagens · trilha {trilha}", flush=True)

if __name__ == "__main__":
    for num in (sys.argv[2:] or list(CRIATIVOS)):
        montar(num)
