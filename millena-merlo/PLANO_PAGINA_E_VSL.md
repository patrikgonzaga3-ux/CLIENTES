# Millena Merlo · Desafio Magra Pro Max · gargalos, ruminações, página nova e VSL (16/11/2026)

Fontes: respostas do quiz (planilha de leads, 01–16/11, 5.290 registros / 4.591 pessoas),
Stract aba MILLENA (conta "CA 03 | MILLENA MILLION"), quiz https://quiz.desafiomagrapromax.com.br
e a página de referência https://efeitolipo.com.br/c (estrutura Maxxima).

## 1. Contas e acessos
| O quê | Valor |
|---|---|
| Quiz | quiz.desafiomagrapromax.com.br (funil "Desafio da Milena", id cmupsir0900s5hmrk6s487e4a) |
| Pixel do Meta | **1332309708403614** (o mesmo do quiz e da página nova) |
| Checkout | https://payfast.greenn.com.br/redirect/286218 → oferta WUdgLV, com 4 order bumps |
| Vendedora na Greenn | MILLENA BENEVIDES MERLO |
| VSL atual (vturb) | player 6a1d7c05f819e44f4c81322b (conta 9406f62d-bd68-44a6-971a-c0a91bdff3c8) |
| Hostinger | usuário u343853767 · desafiomagrapromax.com.br (WordPress) e millenamerloo.com.br |
| Contas de anúncio | CA 03 \| MILLENA MILLION (Stract); CA 02 (Ativa) 226596429878144 (ainda não liberada no conector do Meta) |

## 2. Gargalos (do maior para o menor)
1. **Capa do quiz:** 78% saem sem clicar "EU QUERO" (só 21,8% clicam). iPhone 18% × outros celulares 28%; à noite 16% × manhã 25%.
2. **Dentro do checkout (corrigido em 16/11):** o link chega rápido (redirect em ~1,7 s) e o checkout da Greenn manda
   PageView, ViewContent e **AddToCart ao abrir**; o InitiateCheckout só sai depois que ela preenche os dados.
   AddToCart no Meta = 507 ≈ 471 cliques no botão → quase todas chegam ao checkout. A perda é lá dentro:
   só ~1/3 preenche os dados (165) e metade dessas paga (87). Ver as 4 order bumps, o preço à vista e recuperar quem preencheu e não pagou.
3. **Checkout → compra:** 18,5% dos cliques no botão viram venda (16,5% desde 07/11).
4. **Página de oferta do quiz:** 39% chegam e saem sem clicar. Faltam: o que ela recebe, quem é a Millena, perguntas e respostas, preço à vista.
5. **Textos que não batem:** "75% de desconto" (o real é ~85%); garantia 30 dias no título × 21 dias no bloco; capa "4 semanas" × quiz "21 dias".
6. **Dinheiro:** custo por venda R$ 30,50 com ticket ~R$ 29,60 (retorno 0,93). Desde 07/11: R$ 33,65 (retorno 0,83).
- O quiz em si funciona bem: cerca de 1% de perda por pergunta.

## 3. Ruminações (pensamentos da cliente, tirados das respostas)
| Pensamento usado na página | De onde veio |
|---|---|
| "De roupa eu até pareço magra… mas sem roupa, cadê o corpo?" | 55% marcaram "Sou falsa magra" |
| "Faço abdominal todo dia e a barriga continua aqui." | 38% "Não vejo definição neles" + 51% querem "barriga mais sequinha" |
| "Eu engordo rápido e demoro uma eternidade pra perder." | 55% "Ganho peso rápido e perco lentamente" |
| "Treino e não vejo definição nenhuma. Será que o problema sou eu?" | capa "Se você treina e continua sem resultado" + PG-INFO1 "Você não está sozinha" |
| "Biquíni? Esse verão de novo não." | 41% querem estrear "aquele biquíni cavado" |
| "Como as outras conseguem e eu não?" | 48% querem "autoconfiança total" |

Outros dados úteis: 54% têm de 17 a 28 anos e 40% de 29 a 39; 51% têm 30 a 40 min por dia; 43% querem "comida de verdade e saborosa";
54% "já quero suar"; 37% sonham com "barriga chapada" e 34% com "cintura fina".

## 4. Página nova (estrutura Maxxima, igual à efeitolipo.com.br/c)
- Arquivo: `millena-merlo/pagina-desafio/index.html` + `img/`. Endereço previsto: **desafiomagrapromax.com.br/oferta/** (pasta livre; /desafio/ já cai numa página do WordPress).
- `noindex`, pixel 1332309708403614 (PageView + CliqueComprar 1x por visita), utm/fbclid seguem para o checkout.
- Ordem: topo (etiqueta de dor, promessa, pílulas, 12.000 transformações, VSL, "para quem é") → antes e depois (8 fotos + print do grupo)
  → 6 ruminações → "a culpa não é sua, é o método" → benefícios → o que recebe → para quem é → oferta → garantia → duas opções
  → quem é a Millena → perguntas → rodapé + botão fixo.
- Todo texto vem do quiz/oferta dela. O que não existe ficou marcado em amarelo `(CONFIRMAR …)` / `(ESCREVER AQUI …)`:
  preço à vista, prazo e regra da garantia (21 ou 30 dias), o que mais entra no desafio (app, Comunidade VIP MZB, bônus),
  tempo de acesso, duração dos treinos, como recebe, se é pagamento único, formação e história da Millena.
- **Ainda não subiu para a Hostinger** (a subida precisa do OK do Patrik).

## 5. Roteiro da VSL nova (3 a 4 min, Millena falando para a câmera, vertical)
1. **Gancho (0–15 s):** "Se de roupa você até parece magra, mas sem roupa não vê o corpo que queria… fica até o final, porque eu vou te mostrar por que isso acontece."
2. **Ruminações (15–45 s):** "Você faz abdominal todo dia e a barriga continua ali. Engorda rápido e demora uma eternidade pra perder. Olha pras outras e pensa: como elas conseguem e eu não?"
3. **Culpa não é sua (45 s–1 min 30):** muito cardio e pouca comida destroem a massa magra e deixam o metabolismo lento; o corpo segura a gordura na barriga; abdominal tradicional pode estufar a cintura.
4. **O método (1 min 30–2 min 15):** treino com estratégia e progressão para o corpo feminino; 10 min de hipopressivo que substituem 1.000 abdominais; alimentação saborosa, sem dieta restritiva; academia ou em casa. *(Millena: mostrar 1 hipopressivo na hora.)*
5. **Prova (2 min 15–2 min 45):** fotos de alunas na tela + 1 ou 2 falas de alunas reais (com autorização).
6. **História dela (2 min 45–3 min 15):** *(a Millena conta a própria história: onde estava, o que mudou)*.
7. **Oferta (3 min 15–3 min 45):** o que recebe, preço (de R$ 197 por 12x de R$ 3,08 ou *(à vista)*), garantia *(prazo confirmado)*, acesso imediato.
8. **Chamada final:** "Clica no botão aqui embaixo e começa hoje o seu Desafio Magra Pro Max."

## 6. O que pedir para a Millena gravar e mandar
1. A VSL nova acima (vertical, boa luz, som limpo, sem música).
2. Versão curta de 30–45 s (gancho + método + chamada) para o topo da página e para anúncio.
3. Um hipopressivo de 10 a 20 s, mostrando a barriga "entrando".
4. Tour de 30 s da área de membros/app (o que a aluna vê ao entrar).
5. A história dela em áudio ou texto (formação, antes, virada, resultado).
6. 3 a 5 depoimentos em vídeo de alunas do Desafio Magra Pro Max (com autorização de uso de imagem).
7. Mais fotos de antes e depois do próprio desafio e prints do grupo, com autorização.
8. Respostas: preço à vista, garantia (21 ou 30 dias e regra), tempo de acesso, se é pagamento único, o que entra (app, grupo, bônus), duração dos treinos, como a aluna recebe.

## 7. Pendências
- [ ] OK do Patrik para subir a página em desafiomagrapromax.com.br/oferta/ (Hostinger, u343853767).
- [ ] Preencher os campos amarelos com as respostas da Millena e tirar a classe `.pendente`.
- [x] Link do checkout testado (16/11): chega em ~1,7 s; a perda é dentro do checkout, não no link.
- [ ] Revisão (16/11): a página nova NÃO deve substituir o quiz. O quiz leva 10,3% das visitas ao checkout e a oferta dele já tem 61% de clique.
      Ordem combinada: 1) testar capas do quiz; 2) checkout (bumps, preço à vista, recuperar abandono); 3) levar o conteúdo da página
      nova para a oferta do quiz (versão curta); 4) página nova só como teste A/B com parte pequena da verba.
- [ ] Corrigir na oferta do quiz: "75%" e garantia 21 × 30 dias.
- [ ] Liberar a conta CA 02 no conector do Meta para ver custo por anúncio.
