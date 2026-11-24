import sys, subprocess, numpy as np
sys.argv=["x","/tmp/claude-0/-home-user/fbba6ad6-aab8-561f-9a8c-15030ee9ecd5/scratchpad/lixo"]
import montar_v3 as m
cache={}
def audio(n):
    if n not in cache:
        raw=subprocess.run(["ffmpeg","-v","error","-i",f"{m.VID}/AD{n}.mp4","-ac","1","-ar","16000","-f","s16le","-"],capture_output=True).stdout
        cache[n]=np.frombuffer(raw,np.int16).astype(np.float32)/32768
    return cache[n]
def db(x,a,b):
    s=x[int(a*16000):int(b*16000)]; return 20*np.log10(np.sqrt(np.mean(s**2))+1e-9) if len(s) else -99
ruins=0
for fid in m.F:
    n,tr=m.trechos(fid); x=audio(n)
    for j,(ini,fim,g) in enumerate(tr):
        e_ini=db(x,ini-0.04,ini+0.01); e_fim=db(x,fim-0.01,fim+0.04)
        flag=[]
        if e_ini>-38: flag.append(f"INÍCIO com som ({e_ini:.0f} dB)")
        if e_fim>-38: flag.append(f"FIM com som ({e_fim:.0f} dB)")
        if flag:
            ruins+=1; print(f"{fid} AD{n} trecho {j}: {ini:.2f}-{fim:.2f} '{' '.join(w[0] for w in g)[:50]}' -> {'; '.join(flag)}")
print("cortes com som:",ruins)
