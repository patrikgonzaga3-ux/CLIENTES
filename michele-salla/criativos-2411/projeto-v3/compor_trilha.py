"""Compõe 3 trilhas instrumentais originais (sem direito autoral) para fundo de criativo.
Uso: python3 compor_trilha.py PASTA_SAIDA"""
import numpy as np, sys, os, subprocess
from scipy.signal import butter, sosfilt, fftconvolve

SR = 44100
rng = np.random.default_rng(7)
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)

def midi(n): return 440.0 * 2 ** ((n - 69) / 12)
def env_adsr(n, a, d, s, r, sr=SR):
    a, d, r = int(a * sr), int(d * sr), int(r * sr)
    e = np.full(n, s, float)
    a = min(a, n); e[:a] = np.linspace(0, 1, a, endpoint=False)
    dd = min(d, n - a); e[a:a + dd] = np.linspace(1, s, dd, endpoint=False)
    if r > 0 and n > r: e[-r:] *= np.linspace(1, 0, r)
    return e
def lp(x, f, order=2): return sosfilt(butter(order, f, "low", fs=SR, output="sos"), x)
def hp(x, f, order=2): return sosfilt(butter(order, f, "high", fs=SR, output="sos"), x)
def bp(x, lo, hi): return sosfilt(butter(2, [lo, hi], "band", fs=SR, output="sos"), x)

def saw(f, n, harm=14):
    t = np.arange(n) / SR; y = np.zeros(n)
    for k in range(1, harm + 1):
        if f * k > SR / 2.2: break
        y += np.sin(2 * np.pi * f * k * t + rng.uniform(0, 6.28)) / k
    return y
def pad_note(f, dur):
    n = int(dur * SR)
    y = sum(saw(f * d, n, 10) for d in (0.997, 1.0, 1.004))
    return lp(y, 1400) * env_adsr(n, 0.35, 0.3, 0.75, 0.6) * 0.12
def piano(f, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    y = sum(np.sin(2 * np.pi * f * k * t) * np.exp(-t * (2.2 + 1.6 * k)) / k ** 1.3 for k in range(1, 7))
    return y * env_adsr(n, 0.004, 0.05, 1, 0.08) * 0.5
def pluck(f, dur):  # Karplus-Strong
    n = int(dur * SR); p = max(2, int(SR / f)); buf = rng.uniform(-1, 1, p); y = np.zeros(n)
    for i in range(n):
        y[i] = buf[i % p]; buf[i % p] = 0.5 * (buf[i % p] + buf[(i + 1) % p]) * 0.996
    return lp(y, 5000) * 0.45
def marimba(f, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    y = np.sin(2 * np.pi * f * t) * np.exp(-t * 6) + 0.35 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 18)
    return y * env_adsr(n, 0.003, 0.02, 1, 0.05) * 0.55
def bass(f, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    y = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t) + 0.1 * saw(f, n, 6)
    return lp(y, 600) * env_adsr(n, 0.01, 0.15, 0.6, 0.08) * 0.38
def kick():
    n = int(0.32 * SR); t = np.arange(n) / SR
    f = 45 + 85 * np.exp(-t * 28); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 11) * 0.9
def clap():
    n = int(0.22 * SR); t = np.arange(n) / SR
    return bp(rng.normal(0, 1, n), 900, 3500) * np.exp(-t * 22) * 0.35
def hat(open_=False):
    n = int((0.18 if open_ else 0.05) * SR); t = np.arange(n) / SR
    return hp(rng.normal(0, 1, n), 7000) * np.exp(-t * (14 if open_ else 70)) * 0.13
def shaker():
    n = int(0.09 * SR); t = np.arange(n) / SR
    return bp(rng.normal(0, 1, n), 4000, 9000) * np.sin(np.pi * t / t[-1]) * 0.08

def reverb_ir(sec=1.6):
    n = int(sec * SR); t = np.arange(n) / SR
    return np.stack([lp(rng.normal(0, 1, n), 6000) * np.exp(-t * 3.2) for _ in range(2)]) * 0.06

def add(track, sig, start, pan=0.0):
    i = int(start * SR); j = min(track.shape[1], i + len(sig))
    if j <= i: return
    l, r = np.sqrt((1 - pan) / 2), np.sqrt((1 + pan) / 2)
    track[0, i:j] += sig[:j - i] * l; track[1, i:j] += sig[:j - i] * r

def compor(nome, bpm, chords, lead, lead_pat, total=50.0, swing=0.0, four_floor=True):
    beat = 60 / bpm; bar = 4 * beat; n = int(total * SR)
    dry = np.zeros((2, n)); wet = np.zeros((2, n)); drums = np.zeros((2, n))
    nbars = int(total / bar) + 1
    for b in range(nbars):
        t0 = b * bar; ch = chords[b % len(chords)]
        intro = b < 2
        for k, note in enumerate(ch[1:]):  # pad
            add(wet, pad_note(midi(note), bar + 0.4), t0, pan=(-0.4, 0, 0.4)[k % 3])
        # baixo: tempo 1, "e" do 2, tempo 3
        if not intro:
            for pos in (0, 1.5, 2, 3.5):
                add(dry, bass(midi(ch[0]), beat * (0.9 if pos in (0, 2) else 0.45)), t0 + pos * beat)
        # melodia/arpejo
        for step, (idx, oct_) in enumerate(lead_pat):
            if idx is None: continue
            pos = step * 0.5 + (swing if step % 2 else 0)
            f = midi(ch[1 + idx % (len(ch) - 1)] + 12 * oct_)
            s = lead(f, beat * 1.2)
            if intro: s = s * 0.6
            add(wet, s, t0 + pos * beat, pan=0.3 if step % 2 else -0.3)
        # bateria
        if b >= 1:
            for q in range(4):
                if four_floor or q in (0, 2): add(drums, kick() * (0.75 if intro else 1), t0 + q * beat)
                if not intro and q in (1, 3): add(drums, clap(), t0 + q * beat, pan=0.1)
            for e in range(8):
                add(drums, hat(open_=(e % 4 == 2)) if not intro else shaker(), t0 + (e * 0.5 + (swing if e % 2 else 0)) * beat,
                    pan=0.35 if e % 2 else -0.2)
            if not intro:
                for s16 in range(16): add(drums, shaker() * 0.7, t0 + s16 * 0.25 * beat, pan=-0.5)
    ir = reverb_ir()
    rv = np.stack([fftconvolve(wet[c], ir[c])[:n] for c in range(2)])
    mix = dry + wet * 0.85 + rv * 0.9 + drums * 0.8
    # "sidechain" leve no pad/arpejo a cada tempo (pulsação)
    t = np.arange(n) / SR; pump = 1 - 0.18 * np.exp(-((t % beat) / beat) * 6)
    mix = dry + (wet * 0.85 + rv * 0.9) * pump + drums * 0.8
    mix = hp(mix, 35)
    mix = np.tanh(mix * 1.4) / 1.4
    fade = int(1.5 * SR); mix[:, :int(0.3 * SR)] *= np.linspace(0, 1, int(0.3 * SR)); mix[:, -fade:] *= np.linspace(1, 0, fade)
    mix /= np.max(np.abs(mix)) * 1.12
    wav = f"{OUT}/{nome}.wav"
    import wave
    with wave.open(wav, "w") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((mix.T * 32767).astype(np.int16).tobytes())
    mp3 = f"{OUT}/{nome}.mp3"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", wav, "-af", "loudnorm=I=-16:TP=-1.5", "-b:a", "256k", mp3], check=True)
    os.remove(wav); print(nome, "ok")

# acordes: [baixo, notas do pad...] em MIDI
C, G, Am, F = [36, 60, 64, 67], [43, 59, 62, 67], [45, 60, 64, 69], [41, 60, 65, 69]
Dm, Bb, Em = [38, 62, 65, 69], [34, 58, 62, 65], [40, 59, 64, 67]
D, A, Bm, Gd = [38, 62, 66, 69], [45, 61, 64, 69], [47, 62, 66, 71], [43, 62, 67, 71]
ARP1 = [(0, 1), (1, 1), (2, 1), (1, 1), (0, 2), (2, 1), (1, 1), (2, 1)]
ARP2 = [(0, 1), None and (0, 0) or (2, 1), (1, 1), (None, 0), (2, 1), (0, 2), (1, 1), (None, 0)]
ARP3 = [(0, 2), (2, 1), (1, 2), (2, 1), (0, 2), (1, 1), (2, 2), (1, 1)]
compor("trilha_A_leve_pop", 104, [C, G, Am, F], piano, ARP1)
compor("trilha_B_emocional", 96, [Am, F, C, G], pluck, ARP2, four_floor=False)
compor("trilha_C_energia", 112, [D, A, Bm, Gd], marimba, ARP3, swing=0.06)
