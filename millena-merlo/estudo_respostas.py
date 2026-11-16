import csv,sys,collections,itertools,math
rows=list(csv.DictReader(open(sys.argv[1],encoding='utf-8')))
def fb(r):
    for p in r['Logs'].split(';'):
        if p.startswith('fbclid='): return p
    return r['guest_id']
best={}
for r in rows:
    k=fb(r); s=sum(1 for v in list(r.values())[2:21] if v)
    if k not in best or s>best[k][0]: best[k]=(s,r)
P=[r for s,r in best.values()]
Q=['quiz1','quiz2','quiz3','quiz5','quiz6','quiz7','quiz8','quiz9','quiz10','QUIZ11','quiz12','quiz13','quiz14','quiz15']
NOME={'quiz1':'Idade','quiz2':'Espelho','quiz3':'Onde quer definição','quiz5':'Peso varia','quiz6':'Trocar esteira por','quiz7':'Tempo/dia','quiz8':'Alimentação ideal','quiz9':'Abdominais','quiz10':'Intensidade','QUIZ11':'Corpo em 21 dias','quiz12':'Prazo','quiz13':'Roupa','quiz14':'Mulher poderosa','quiz15':'Pronta?'}
F=[r for r in P if r['quiz15']]
ck=lambda r: ('COME' in r['PG-AQUECIMENTO'] or 'RECEBER' in r['PG-AQUECIMENTO'])
base=sum(ck(r) for r in F)/len(F)
print(f'Terminaram o quiz: {len(F)} | clicaram no checkout: {sum(ck(r) for r in F)} ({100*base:.1f}%)')
def cl(v): return v.strip().rstrip(';').rstrip('.')
# 1. clique no checkout por resposta (todas as perguntas)
print('\n=== 1. Clique no checkout por resposta (quem viu a oferta) | n | taxa | diferença vs média ===')
for q in Q:
    g=collections.defaultdict(list)
    for r in F: g[cl(r[q])].append(ck(r))
    print(f'\n{NOME[q]}')
    for k,v in sorted(g.items(),key=lambda x:-len(x[1])):
        t=sum(v)/len(v); se=math.sqrt(base*(1-base)/len(v)); z=(t-base)/se
        print(f'  {k[:45]:45s} {len(v):4d} {100*t:5.1f}% {100*(t-base):+5.1f}pp {"*" if abs(z)>=1.96 else ""}')
# 2. Abandono no meio do quiz por resposta anterior
print('\n=== 2. Quem respondeu a idade e NÃO terminou o quiz, por resposta ===')
S=[r for r in P if r['quiz1']]
for q in ['quiz1','quiz2','quiz3','quiz5']:
    g=collections.defaultdict(list)
    for r in S:
        if r[q]: g[cl(r[q])].append(bool(r['quiz15']))
    print(NOME[q], ' | '.join(f'{k[:28]} {len(v)} → {100*sum(v)/len(v):.0f}% terminam' for k,v in g.items()))
# 3. cruzamentos principais
def cross(a,b):
    print(f'\n=== {NOME[a]} × {NOME[b]} (% da linha, n) ===')
    g=collections.defaultdict(collections.Counter)
    for r in F: g[cl(r[a])][cl(r[b])]+=1
    cols=[k for k,_ in collections.Counter(cl(r[b]) for r in F).most_common()]
    print(' '*32+' | '.join(c[:16] for c in cols))
    for k,c in sorted(g.items(),key=lambda x:-sum(x[1].values())):
        n=sum(c.values()); print(f'{k[:30]:30s} {n:4d} '+' | '.join(f'{100*c[x]/n:14.0f}%' for x in cols))
for a,b in [('quiz2','quiz1'),('quiz2','quiz3'),('quiz2','quiz5'),('quiz2','QUIZ11'),('quiz2','quiz9'),('quiz2','quiz7'),('quiz1','quiz3'),('quiz1','QUIZ11'),('quiz3','QUIZ11'),('quiz2','quiz13'),('quiz2','quiz14')]:
    cross(a,b)
# 4. perfis (combinação espelho + área + biotipo)
print('\n=== 4. Perfis: espelho + onde quer definição + peso (top 12) | n | % | clique ===')
g=collections.defaultdict(list)
for r in F: g[(cl(r['quiz2']),cl(r['quiz3']),cl(r['quiz5']))].append(ck(r))
for k,v in sorted(g.items(),key=lambda x:-len(x[1]))[:12]:
    print(f'{len(v):4d} {100*len(v)/len(F):4.1f}%  clique {100*sum(v)/len(v):4.0f}%  {k}')
# 5. perfis espelho + idade
print('\n=== 5. Espelho + idade | n | clique ===')
g=collections.defaultdict(list)
for r in F: g[(cl(r['quiz2']),cl(r['quiz1']))].append(ck(r))
for k,v in sorted(g.items(),key=lambda x:-len(x[1]))[:10]:
    print(f'{len(v):4d} clique {100*sum(v)/len(v):4.0f}%  {k}')
