"""Revisão técnica de cada criativo: formato, duração, telas pretas, fala x roteiro, volumes e quadros."""
import subprocess, sys, json, difflib, re, unicodedata, numpy as np
sys_argv = sys.argv[1:]
sys.argv = ["x", "/tmp/claude-0/-home-user/fbba6ad6-aab8-561f-9a8c-15030ee9ecd5/scratchpad/lixo"]
import montar_v3 as m
from faster_whisper import WhisperModel
E = "/home/user/CLIENTES/michele-salla/criativos-2411/entrega"
W = WhisperModel("small", device="cpu", compute_type="int8")
def norm(s):
    s = unicodedata.normalize("NFKD", s.lower()).encode("ascii", "ignore").decode()
    s = s.replace("r$ 500", "500").replace("quinhentos reais", "500")
    return re.findall(r"[a-z0-9]+", s)
rel = {}
for num in sys_argv:
    f = f"{E}/Criativos_finais/Criativo_{num}_Final.mp4"
    pr = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_entries",
        "stream=codec_name,profile,width,height,pix_fmt,r_frame_rate,duration,sample_rate,bit_rate:format=duration,size",
        "-of", "json", f], capture_output=True, text=True).stdout)
    v = [s for s in pr["streams"] if s.get("width")][0]; a = [s for s in pr["streams"] if s.get("sample_rate")][0]
    bl = subprocess.run(["ffmpeg", "-hide_banner", "-i", f, "-vf", "blackdetect=d=0.1:pix_th=0.08", "-an", "-f", "null", "-"],
                        capture_output=True, text=True).stderr
    pretas = sum("black_start" in l for l in bl.splitlines())
    fz = subprocess.run(["ffmpeg", "-hide_banner", "-i", f, "-vf", "freezedetect=n=0.001:d=1.5", "-an", "-f", "null", "-"],
                        capture_output=True, text=True).stderr
    congel = [l.split("freeze_start: ")[1] for l in fz.splitlines() if "freeze_start" in l]
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", f, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True).stdout
    x = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
    win = 1600  # 0,1 s
    rms = np.array([20 * np.log10(np.sqrt(np.mean(x[i:i + win] ** 2)) + 1e-9) for i in range(0, len(x) - win, win)])
    segs, _ = W.transcribe(x, language="pt", word_timestamps=True)
    segs = list(segs); txt = " ".join(s.text.strip() for s in segs)
    ref = " ".join(m.F[fid][3] for fid in m.CRIATIVOS[num][1])
    sim = difflib.SequenceMatcher(None, norm(ref), norm(txt)).ratio()
    # trilha: volume nos intervalos sem fala (fora das palavras do Whisper)
    fala = np.zeros(len(rms), bool)
    for s in segs:
        for w in s.words: fala[int(w.start * 10):int(w.end * 10) + 1] = True
    so_trilha = rms[~fala & (np.arange(len(rms)) > 3)]
    com_fala = rms[fala]
    lo = subprocess.run(["ffmpeg", "-hide_banner", "-i", f, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    I = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", lo)[-1]); TP = float(re.findall(r"Peak:\s+(-?[\d.]+) dBFS", lo)[-1])
    S = [float(y) for y in re.findall(r"S:\s*(-?[\d.]+)", lo)]
    S = [y for y in S if y > -70][30:]  # ignora o 1o segundo
    salto = max(abs(S[i + 1] - S[i]) for i in range(len(S) - 1)) if len(S) > 2 else 0
    ultimo = norm(txt)[-3:]
    rel[num] = dict(formato=f"{v['codec_name']} {v.get('profile')} {v['width']}x{v['height']} {v['pix_fmt']} {v['r_frame_rate']} · {a['codec_name']} {a['sample_rate']} Hz",
                    video=float(v["duration"]), audio=float(a["duration"]), mb=int(pr["format"]["size"]) / 1e6, pretas=pretas,
                    congelado=congel, sim=round(sim, 3), I=I, TP=TP, salto_S=round(salto, 1),
                    voz_db=round(float(np.median(com_fala)), 1), trilha_db=round(float(np.median(so_trilha)), 1) if len(so_trilha) else None,
                    fala=txt, fim=" ".join(ultimo))
    r = rel[num]
    print(f"== {num} · {m.CRIATIVOS[num][0]}\n   {r['formato']} · vídeo {r['video']:.2f}s / áudio {r['audio']:.2f}s · {r['mb']:.0f} MB"
          f"\n   telas pretas {pretas} · congelado {congel} · fala x roteiro {sim:.0%} · {I} LUFS · pico {TP} dBTP · maior salto de volume (3s) {salto:.1f} LU"
          f"\n   voz {r['voz_db']} dB · trilha sozinha {r['trilha_db']} dB · termina em: \"{r['fim']}\"\n   FALA: {txt}", flush=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f, "-vf", "fps=1.5,scale=170:-1,tile=12x4", "-frames:v", "1", f"qa_{num}.jpg"])
json.dump(rel, open("qa_relatorio.json", "a"), ensure_ascii=False); open("qa_relatorio.json", "a").write("\n")
