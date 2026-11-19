/* Quiz da Michele Salla · PROTOCOLO CORPO DIVA (17/11/2026, pedido do Patrik). Motor em ../quiz/motor.js (o mesmo dos outros quizzes).
   É o Desafio 7 em 7 com outro nome (Patrik, 17/11: "é o Desafio com outro nome, mantém o checkout"): mesmas aulas, bônus, preço e link.
   Base: o quiz Diva do Desafio (michele-salla/quiz/quiz.js) + o quiz do Dr. Márcio Martins (inlead.digital/dr-marcio-teste-capa, 23 telas:
   VSL na capa, corpo hoje, corpo dos sonhos, como o peso afeta a vida, já tentou e voltou, canetinha, quilos a eliminar, "sua meta é
   possível", "se nada mudar", compromisso, antes e depois, VSL antes da oferta) + o quiz do pilates (IMC, nome, dois caminhos, oferta v3).
   17/11: Patrik deu OK para subir e mandou manter os 18 kg; a página final virou a v4 (mais agressiva).
   Promessas (Patrik): capa 1 = "Perca de uma vez por todas a barriga indesejada até o verão" + "plano personalizado para perder até 18 kg
   nos próximos 30 dias" (quase a do Dr. Márcio, que usa 10 kg em 20 dias); capa 2 = "Emagreça e fique com o corpo durinho antes do verão chegar".
   Teste da VSL: ?v=i vídeo na capa (como o Dr. Márcio) · ?v=o vídeo no topo da oferta · sem ?v= sorteia 50/50 e guarda no aparelho.
   Painel: slug corpodiva-p1i, corpodiva-p1o, corpodiva-p2i, corpodiva-p2o (promessa + variante da VSL); o sck do checkout é o mesmo.
   Roteiro da VSL para a Michele gravar: michele-salla/quiz-corpo-diva/VSL_CORPO_DIVA.md. Tudo entre [[ ]] ainda falta e aparece em amarelo. */

const IMG = '../desafio-7em7/assets/img/'
const AD = 'img/' // antes e depois de alunas do Desafio 7 em 7 (pasta "Antes e depois" da Michele, sem rosto, nome nem kg)
const CHECKOUT = 'https://payfast.greenn.com.br/199167/offer/E1YMM7' // Desafio 7 em 7, R$ 47 (aprovado em 27/10). Mantido pelo Patrik em 17/11.

const PROMESSAS = {
  1: {
    nome: 'Barriga até o verão · 18 kg em 30 dias',
    etiqueta: 'Quiz gratuito',
    titulo: 'Perca de uma vez por todas a <mark>barriga indesejada</mark> até o verão',
    sub: 'Receba um plano personalizado para perder até 18 kg de gordura em até 30 dias.',
  },
  2: {
    nome: 'Corpo durinho antes do verão',
    etiqueta: 'Quiz gratuito',
    titulo: 'Emagreça e fique com o <mark>corpo durinho</mark> antes do verão chegar',
    sub: 'Responda e receba o seu plano personalizado, montado a partir do seu corpo e da sua rotina.',
  },
}

const TELAS = [
  { id: 'capa', tipo: 'capa' }, // promessa + (variante início) VSL + idade: o primeiro clique já é a resposta da idade
  { id: 'michele', tipo: 'michele' },
  { id: 'corpo-hoje', tipo: 'uma', titulo: 'Como você descreveria o seu corpo hoje?', sub: 'Seja sincera, ninguém vai ver.',
    op: [['magra-barriga', 'Magra, mas com barriga', 'O resto até vai, a barriga não sai'], ['media', 'Média', 'Uns quilinhos a mais'],
         ['grande', 'Grande', 'Me sinto pesada'], ['acima', 'Bem acima do peso', 'Preciso de uma mudança de verdade']] },
  { id: 'objetivo', tipo: 'varias', titulo: 'Qual é o seu objetivo?', sub: 'Pode marcar mais de um.',
    op: [['perder', 'Perder peso de uma vez por todas'], ['barriga', 'Secar a barriga e afinar a cintura'], ['desinchar', 'Desinchar e me sentir mais leve'],
         ['manter', 'Emagrecer e não engordar de volta'], ['saude', 'Emagrecer e melhorar a minha saúde']] },
  { id: 'corpo-sonho', tipo: 'uma', cols: 2, titulo: 'Qual é o seu “corpo dos sonhos”?', sub: 'Escolha o que mais combina com você.',
    op: [['durinho', 'Durinho', 'Firme e definido'], ['magra', 'Mais magra', 'Leve e sem barriga'], ['curvas', 'Com curvas', 'Cintura marcada'], ['saudavel', 'Saudável', 'Disposta e sem dor']] },
  { id: 'impacto', tipo: 'varias', titulo: 'Como o seu peso tem afetado a sua vida?', sub: 'Pode marcar mais de um.',
    op: [['autoestima', 'Minha autoestima está lá embaixo'], ['roupas', 'Evito roupas justas, biquíni e fotos'], ['cansaco', 'Me sinto cansada, sem energia'],
         ['saude', 'Já está aparecendo nos exames', 'Pressão, glicose, colesterol'], ['atraente', 'Não me sinto atraente'], ['nenhum', 'Nada disso']] },
  { id: 'tentou', tipo: 'uma', titulo: 'Você já tentou emagrecer e não conseguiu o resultado que queria?', sub: 'A maioria das mulheres que chegam até mim já tentou.',
    op: [['voltou', 'Perdi peso, mas voltou tudo'], ['barriga', 'Fiz dieta, mas a barriga não saiu'], ['abdominal', 'Fiz muito abdominal e nada mudou'],
         ['canetinha', 'Usei canetinha e voltei a engordar'], ['comecando', 'Ainda nem comecei']] },
  { id: 'canetinha', tipo: 'uma', titulo: 'Você já usou ou pensa em usar canetinha para emagrecer?', sub: 'Ozempic, Mounjaro, Wegovy…',
    op: [['usei', 'Já usei'], ['uso', 'Uso hoje'], ['penso', 'Estou pensando em usar'], ['nunca', 'Nunca usei e não quero']],
    dica: '💡 Uma caixa de canetinha passa de R$ 500 por mês. O Protocolo Corpo Diva custa menos de 1/10 disso, uma vez só.' },
  { id: 'prova', tipo: 'prova' },
  { id: 'barriga-dia', tipo: 'uma', titulo: 'Como a sua barriga fica ao longo do dia?', sub: 'Observe o seu dia de hoje.',
    op: [['estufa-noite', 'Acordo com ela lisinha e à noite está estufada'], ['sempre', 'Fica grande o dia inteiro'],
         ['flacida', 'Sinto a barriga flácida, sem firmeza', 'Depois de gestação ou com o tempo'], ['nao-sei', 'Nunca prestei atenção']] },
  { id: 'altura', tipo: 'numero', titulo: 'Qual é a sua altura?', sub: 'Em centímetros. Usamos só para montar o seu plano.', unidade: 'cm', min: 130, max: 200, padrao: 160 },
  { id: 'peso', tipo: 'numero', titulo: 'Qual é o seu peso hoje?', sub: 'Em quilos. Fica só no seu celular.', unidade: 'kg', min: 35, max: 200, padrao: 75 },
  { id: 'peso-meta', tipo: 'numero', titulo: 'E qual peso você quer ter no verão?', sub: 'Em quilos. Não existe resposta certa.', unidade: 'kg', min: 35, max: 200, padrao: r => (Number(r.peso) || 75) - 8 },
  { id: 'meta-possivel', tipo: 'texto', rot: '✓ Meta registrada', titulo: '{nome}a sua meta de {meta} é possível, e você não precisa fazer isso sozinha.',
    textos: ['Muitas mulheres chegam até mim depois de tentar de tudo: dieta, abdominal, canetinha. O que faltava não era força de vontade. Era o método certo. Foi para isso que eu criei o Método Cinturão Diva: 15 minutos por dia que atacam, ao mesmo tempo, os 3 sabotadores da barriga.',
      'Nas próximas perguntas, eu vejo a sua rotina e o que mais te tira do caminho, para montar o seu plano.'],
    img: { src: AD + 'ad-1.webp', alt: 'Antes e depois de aluna do Desafio 7 em 7 da Michele', w: 682, h: 900 },
    aviso: 'Aluna do Desafio 7 em 7 da Michele. Os resultados variam de pessoa para pessoa.', botao: 'Continuar o meu plano' },
  { id: 'rotina', tipo: 'uma', titulo: 'Como é a sua rotina hoje?', sub: 'O plano precisa caber na vida real.',
    op: [['corrida', 'Corrida, mal sobra tempo para mim', 'Trabalho, casa, filhos…'], ['todos', 'Cuido de todo mundo, menos de mim', 'Todo mundo virou prioridade'],
         ['equilibrada', 'Equilibrada, mas sem sobra', 'Consigo me organizar'], ['tempo', 'Tenho tempo para me dedicar', 'Posso investir em mim']] },
  { id: 'tempo-dia', tipo: 'uma', titulo: 'Quanto tempo por dia você consegue para você?', sub: 'Até o menor tempo serve para começar.',
    op: [['5', '5 minutinhos'], ['15', 'Uns 15 minutos'], ['30', 'Até 30 minutos'], ['30+', 'Mais de 30 minutos']] },
  { id: 'fase', tipo: 'uma', titulo: 'Você está em alguma destas fases?', sub: 'O corpo muda em cada fase, e o cuidado também.',
    op: [['pos-parto', 'Tive bebê nos últimos 2 anos'], ['maes', 'Já sou mãe há mais tempo'], ['menopausa', 'Pré-menopausa ou menopausa'], ['nenhuma', 'Nenhuma delas']] },
  { id: 'carregando-1', tipo: 'carregando', titulo: 'Analisando suas respostas…', linhas: ['Calculando o seu ponto de partida…', 'Vendo como a sua barriga se comporta…', 'Vendo o que mais te faz parar…'] },
  { id: 'sabotador', tipo: 'uma', titulo: 'O que mais te tira do caminho?', sub: 'Todo mundo tem um. Saber o seu é o primeiro passo.',
    op: [['ansiedade', 'Ansiedade e estresse', '“Quando estresso, desconto na comida”'], ['doce', 'Doce e besteira', '“Não resisto a um docinho”'], ['noite', 'Belisco à noite', '“Depois do jantar não paro mais”'],
         ['cansaco', 'Cansaço', '“Chego exausta e não tenho energia”'], ['tempo', 'Falta de tempo', '“O dia acaba antes de eu lembrar de mim”']] },
  { id: 'recomecos', tipo: 'uma', cols: 2, titulo: 'Quantas vezes você já recomeçou?', sub: 'Seja sincera. Isso mostra o que te faz parar.',
    op: [['1-2', 'Uma ou duas vezes'], ['varias', 'Várias vezes'], ['perdi-conta', 'Já perdi a conta'], ['comecando', 'Ainda vou começar']] },
  { id: 'se-nada-mudar', tipo: 'uma', titulo: 'Se nada mudar, como vai ser o seu próximo verão?', sub: 'Imagine por 3 segundos.',
    op: [['esconder', 'De novo escondendo a barriga com roupa larga'], ['fotos', 'Fugindo das fotos e da praia'], ['pior', 'Com mais peso e menos disposição que hoje']] },
  { id: 'compromisso', tipo: 'uma', titulo: 'Você está disposta a se dar 15 minutos por dia para mudar isso?', sub: 'É o tempo da aula do Protocolo.',
    op: [['sim', 'Sim, eu preciso mudar!'], ['tentar', 'Estou disposta a pelo menos tentar']],
    dica: '✅ As aulas do Método Cinturão Diva são de 15 minutos, em casa, e nos dias corridos tem uma rotina express de 5 minutos.' },
  { id: 'medo', tipo: 'uma', titulo: 'Qual é o seu maior medo agora?', sub: 'Seus medos são válidos. Vou responder no final.',
    op: [['fracasso', 'Não conseguir de novo', 'Já tentei tanto que perdi a confiança'], ['tempo', 'Não ter tempo', 'Minha rotina não deixa espaço'], ['dinheiro', 'Gastar e não ter resultado', 'Já investi em coisas que não funcionaram'],
         ['dor', 'Sentir dor ou me machucar', 'Tenho medo de exercício com impacto'], ['rebote', 'Voltar tudo depois', 'Melhoro e depois volto ao mesmo']] },
  { id: 'nome', tipo: 'nome', titulo: 'Falta pouco! Qual é o seu primeiro nome?', sub: 'Para o seu plano sair no seu nome.', placeholder: 'Seu primeiro nome',
    privacidade: '🔒 Não pedimos e-mail nem telefone. O nome serve só para personalizar o seu plano.', botao: 'Ver o meu plano' },
  { id: 'carregando-2', tipo: 'carregando', titulo: 'Montando o seu plano do Método Cinturão Diva…', linhas: ['Separando o seu primeiro passo…', 'Encaixando no tempo que você tem…', 'Escolhendo por onde você começa…'] },
  { id: 'resultado', tipo: 'resultado' },
  { id: 'oferta', tipo: 'oferta' },
]

// Perfis (os mesmos do quiz Diva, com a regra adaptada): confere de cima para baixo e para no primeiro que bater.
const PERFIS = {
  'nova-fase': {
    nome: 'A Diva da Nova Fase',
    retrato: 'O seu corpo mudou: gestação, os anos ou a menopausa. O que funcionava antes parou de funcionar, e a barriga não responde como antes.',
    trava: 'Não é falta de esforço. O seu corpo pede outro cuidado: fortalecer o abdômen profundo, de dentro para fora, com postura e respiração, e cuidar dos pensamentos e hábitos que fazem você desistir de si mesma.',
    comeca: 'Você começa pela aula “Conheça Sua Barriga: Avaliação Inicial” e segue para as aulas de 15 minutos do Método Cinturão Diva, com respiração e hipopressivos.',
  },
  'estufada': {
    nome: 'A Diva da Barriga Estufada',
    retrato: 'A sua barriga muda ao longo do dia: de manhã está melhor e à noite está estufada. Isso mexe com a roupa, com o humor e com a autoestima.',
    trava: 'Fazer cada vez mais abdominais não resolve. É preciso trabalhar o seu cinturão natural com postura e respiração e cuidar dos hábitos que fazem você desistir de si mesma.',
    comeca: 'Você começa pelas aulas do Método Cinturão Diva (“15 Minutos por Dia: Barriga e Cintura em Ação”), com respiração e hipopressivos, e pelo Cardápio de Emergência Diva.',
  },
  'efeito-sanfona': {
    nome: 'A Diva do Efeito Sanfona',
    retrato: 'Você já emagreceu antes, com dieta, academia ou canetinha. Mas o peso voltou, e a barriga voltou junto.',
    trava: 'O que faz o peso voltar não é falta de força: é parar tudo de uma vez e voltar aos velhos hábitos. O corpo segura o resultado quando a cabeça muda junto.',
    comeca: 'Você começa pelo áudio “Ative Sua Mente Magra e Diva” e pelo Planner Diva, junto com as aulas de 15 minutos do Método Cinturão Diva, para o resultado ficar.',
  },
  'recomeco': {
    nome: 'A Diva que Recomeça Toda Segunda',
    retrato: 'Você começa com tudo, a semana aperta, um deslize vira “já estraguei” e a segunda-feira vira a data do recomeço.',
    trava: 'O que te tira do caminho não é preguiça, é a cabeça: ansiedade, cansaço e o “tudo ou nada”. O corpo responde quando a mente para de desistir de si mesma.',
    comeca: 'Você começa pelo áudio “Ative Sua Mente Magra e Diva” e pelo “Planner Diva”, para saber o que fazer em cada dia, junto com as aulas do Método Cinturão Diva.',
  },
  'depois': {
    nome: 'A Diva que se Deixou pra Depois',
    retrato: 'Rotina corrida, casa, filhos, trabalho. Todo mundo virou prioridade, menos você. E um dia você se olhou e não se reconheceu.',
    trava: 'Você não precisa de horas livres. Precisa de 15 minutos por dia que sejam só seus, para o corpo e para a cabeça.',
    comeca: 'Você começa pelo “Comece Aqui: Sua Jornada Começa Agora” e encaixa os primeiros 15 minutos do Método Cinturão Diva no seu dia, sem esperar segunda-feira.',
  },
}

function perfilDe(r) {
  if (['pos-parto', 'menopausa'].includes(r.fase)) return 'nova-fase'
  if (['voltou', 'canetinha'].includes(r.tentou)) return 'efeito-sanfona'
  if (r['barriga-dia'] === 'estufa-noite' || (r.objetivo || []).includes('desinchar')) return 'estufada'
  if (['varias', 'perdi-conta'].includes(r.recomecos) || ['ansiedade', 'noite', 'doce'].includes(r.sabotador)) return 'recomeco'
  return 'depois'
}

const MEDO = {
  fracasso: 'um passo a passo diário, com o Planner Diva, para você saber exatamente o que fazer em cada dia.',
  tempo: 'as aulas do Método Cinturão Diva têm 15 minutos, em casa, e tem uma rotina express de 5 minutos para os dias corridos.',
  dinheiro: 'o Protocolo custa R$ 47, uma vez só (menos de 1/10 de um mês de canetinha), e tem garantia de 7 dias: se não fizer sentido para você, pede o reembolso.',
  dor: 'os hipopressivos são feitos com respiração e postura, sem impacto. Se você teve bebê há pouco tempo ou tem hérnia, precisa de liberação médica antes de começar.',
  rebote: 'o áudio Mente Magra e Diva e o Planner ajudam a transformar o Protocolo em hábito, para o resultado ficar.',
}

const EXEMPLO = {
  'nova-fase': { fase: 'menopausa', tentou: 'barriga', objetivo: ['barriga'], impacto: ['autoestima'], medo: 'dor', altura: 162, peso: 78, 'peso-meta': 68 },
  'efeito-sanfona': { fase: 'nenhuma', tentou: 'canetinha', canetinha: 'usei', 'se-nada-mudar': 'esconder', rotina: 'todos', objetivo: ['perder', 'manter'], impacto: ['roupas'], medo: 'rebote', altura: 160, peso: 84, 'peso-meta': 70 },
  'estufada': { fase: 'nenhuma', tentou: 'abdominal', 'barriga-dia': 'estufa-noite', objetivo: ['desinchar'], impacto: ['roupas'], medo: 'tempo', altura: 165, peso: 70, 'peso-meta': 63 },
  'recomeco': { fase: 'maes', tentou: 'barriga', 'barriga-dia': 'sempre', recomecos: 'perdi-conta', sabotador: 'ansiedade', objetivo: ['perder'], medo: 'fracasso', altura: 158, peso: 80, 'peso-meta': 66 },
  'depois': { fase: 'maes', tentou: 'comecando', 'barriga-dia': 'sempre', recomecos: '1-2', sabotador: 'tempo', objetivo: ['barriga'], medo: 'dinheiro', altura: 163, peso: 74, 'peso-meta': 66 },
}

const resultadoFoto = n => ({ src: IMG + 'resultado-' + n + '.webp', alt: 'Antes e depois de aluna do Desafio 7 em 7', w: 800, h: 800 })
const adFoto = (n, w, h) => ({ src: AD + 'ad-' + n + '.webp', alt: 'Antes e depois de aluna da Michele', w, h })
// 19/11 (Patrik mandou pela pasta do Drive): antes e depois novos de alunas da Michele, rosto e foto de perfil desfocados.
// ad-n1 ("2020/2024", resultado de anos) fica fora até o Patrik decidir, para não ficar ao lado de "em até 30 dias".
const adNovo = (n, w, h) => ({ src: AD + 'ad-n' + n + '.webp', alt: 'Antes e depois de aluna da Michele', w, h })
const QUIZ = {
  slug: 'corpodiva-p', // painel: corpodiva-p1i, -p1o, -p2i, -p2o (aba Corpo Diva)
  mostraPct: true,
  subNaCapa: true, // o subtítulo é metade da promessa ("até 18 kg nos próximos 30 dias")
  vsl: {
    teste: ['inicio', 'oferta'], // 50/50 sem ?v=
    // Um vídeo, dois finais (VSL_CORPO_DIVA.md): na capa vai o final A (convida para o quiz), na oferta o final B (preço e garantia).
    // 19/11 · VSLs editadas (gravação de 19/11, ordem do Ladeira) no VTurb do Patrik. Capa termina em "escolha a sua idade";
    // oferta termina em "toque no botão". Promessa 2 sem os 18 kg. Nomes no VTurb: VSL CAPA 1/2, VSL OFERTA 1/2.
    vturbConta: '9406f62d-bd68-44a6-971a-c0a91bdff3c8',
    get src() { return P === 2
      ? { inicio: 'vturb:6aff3a871750c92b3ebec505', oferta: 'vturb:6aff3a96d6afab099c30069a' }
      : { inicio: 'vturb:6aff3a8e607bd33518f1f5a6', oferta: 'vturb:6aff3a9b4e411c851d8689bf' } },
    poster: { inicio: '', oferta: '' },
    vazio: { inicio: 'VSL da Michele · ~75 s · versão capa', oferta: 'VSL da Michele · ~2 min 30 · versão oferta' },
    pendencia: 'Vídeo ainda não gravado (roteiro pronto em VSL_CORPO_DIVA.md)',
  },
  capaV2: {
    foto: adNovo(4, 800, 644), // 19/11: era a ilustração de IA (hero-antes-depois-avatar.webp); agora foto real de aluna
    semFotoComVsl: true, // na variante "VSL no início" o vídeo fica no lugar da foto
    marca: 'Protocolo Corpo Diva',
    faixa: 'Para mulheres a partir dos 35, em casa, 15 minutos por dia',
    selos: [],
    final: 'No final, você recebe o seu plano grátis. Sem cadastro.',
  },
  assinatura: 'Por Michele Salla, educadora física e especialista em emagrecimento comportamental',
  logo: { src: IMG + 'logo-desafio-7em7-escura.png', alt: 'Michele Salla' },
  capa: { src: IMG + 'hero-antes-depois-avatar.webp', alt: 'Antes e depois', w: 1080, h: 1200 },
  idadeNaCapa: {
    pergunta: 'Escolha a sua idade para começar:',
    texto: true, tempo: 'Leva cerca de 3 minutos',
    op: [['35-44', '35 a 44'], ['45-54', '45 a 54'], ['55-64', '55 a 64'], ['65+', '65 ou mais']],
    outra: ['-35', 'Tenho menos de 35 anos'],
  },
  bio: [
    'Educadora Física desde 2005, especialista em emagrecimento comportamental, licenciada na técnica da Barriga Negativa e autora do livro Vida Diva (2025).',
    'Há mais de 20 anos eu ajudo mulheres a perderem a barriga sem viver de dietas: primeiro a mente, depois o corpo.',
    'Nas próximas perguntas, vou entender o seu corpo, a sua rotina e a sua meta para montar o seu plano do Método Cinturão Diva.',
  ],
  prova: { titulo: 'Alunas que já começaram comigo', fotos: [1, 2, 3, 4].map(resultadoFoto) },
  insight: { ciclo: [], destaque: '', texto: '' },
  resultado: {
    v2: true,
    mente: 'É aí que entra a Mente Magra e Diva: sair do “tudo ou nada” e fazer escolhas que sustentem a sua transformação.',
    diaADia: 'Quinze minutinhos para cuidar do corpo. Uma tarefa por dia para transformar a forma como você se cuida. 💜',
    botao: 'Ver o meu Protocolo Corpo Diva',
    imc: {
      textos: {
        abaixo: 'O foco do seu plano é firmar a barriga e a cintura, com postura e respiração, sem dieta radical.',
        normal: 'Bom ponto de partida. O foco do seu plano é secar a barriga, afinar a cintura e deixar o corpo mais durinho.',
        sobrepeso: 'O seu plano começa pelo que mais pesa: a barriga, os hábitos e a cabeça. 15 minutos por dia, em casa, sem dieta radical.',
        obesidade: 'O seu plano começa pelo que mais pesa: a barriga, os hábitos e a cabeça, sem impacto. Se você tem alguma condição de saúde, converse com o seu médico antes de começar.',
      },
      aviso: 'O IMC (peso ÷ altura²) é uma referência geral da OMS. Não é diagnóstico.',
    },
    caminhos: {
      adiar: 'O verão chega, a barriga continua no mesmo lugar e a roupa larga volta para a mala. E a segunda-feira vira, de novo, a data do recomeço.',
      comecar: 'O Método Cinturão Diva, 15 minutos por dia em casa: religa o seu cinturão natural, sem dieta radical, e a Mente Magra e Diva para não desistir no meio.',
      eixo: 'Constância até o verão',
      aviso: 'Gráfico ilustrativo de hábito. Não é previsão nem garantia de resultado; os resultados variam de pessoa para pessoa.',
    },
  },
  oferta: {
    produto: 'Protocolo Corpo Diva', valor: '47', checkout: CHECKOUT,
    titulo: 'O seu caminho começa no <mark>Protocolo Corpo Diva</mark>',
    intro: '', modulos: [], bonus: [],
    parcela: 'à vista · ou 12x de R$ 4,83',
    botao: 'Quero o meu Protocolo Corpo Diva',
    v2: {
      botao: 'Quero perder a barriga até o verão',
      garantia: { titulo: 'Garantia de 7 dias', texto: 'Comece hoje. Se em 7 dias você sentir que não é para você, pede o reembolso pela própria plataforma, sem precisar explicar.' },
      faq: [
        ['Preciso de academia ou equipamento?', 'Não. As aulas são em casa, com o peso do próprio corpo, em 15 minutos por dia.'],
        ['Tenho mais de 50. Serve para mim?', 'Sim. Os hipopressivos são feitos com respiração e postura, sem impacto, no seu ritmo.'],
        ['Tive bebê ou tenho hérnia. Posso fazer?', 'Você precisa de liberação médica antes de começar. A aula “Conheça Sua Barriga” ensina a observar sinais como a diástase.'],
        ['É mensalidade?', 'Não. É pagamento único de R$ 47 (ou 12x de R$ 4,83).'],
        ['Como funciona a garantia?', 'Você tem 7 dias. Se não fizer sentido para você, pede o reembolso pela própria plataforma.'],
      ],
    },
    // 17/11 (Patrik: "na última tela não gostei, tá ruim, pode ser mais agressivo"): página final v4. A v3 abaixo fica guardada
    // (desligar a v4: v4: null volta para a v3). Mesmo preço e mesmo link. Só fatos do produto e a âncora da canetinha (dado do Patrik).
    v4: {
      titulo: 'Perca a <b>barriga indesejada</b> e até <b>18 kg de gordura</b> em até 30 dias com o Método Cinturão Diva',
      heroAD: adNovo(4, 800, 644),
      adTitulo: 'Elas começaram. Agora é a sua vez.',
      adLegenda: 'Alunas da Michele. Os resultados variam de pessoa para pessoa.',
      antesDepois: [adNovo(2, 800, 809), adNovo(5, 800, 628), adNovo('3g', 800, 630), adFoto(4, 900, 764), adFoto(1, 682, 900), adFoto(3, 720, 720)],
      ancora: 'Menos de 1/10 de <s>1 mês de canetinha (R$ 500+)</s>',
      vez: 'à vista · ou 12x de R$ 4,83 · pagamento único, sem mensalidade',
      vezCurta: 'pagamento único',
      naoTitulo: 'Para perder a barriga até o verão, você NÃO precisa de:',
      nao: ['<b>Academia</b> nem equipamento', '<b>Dieta radical</b> nem passar fome', '<b>Canetinha</b> de R$ 500 por mês', '<b>Mil abdominais</b> que não tiram a barriga', '<b>Horas</b> livres no dia'],
      so: 'Só do Método Cinturão Diva: 15 minutos por dia, em casa.',
      dorTitulo: 'Seja sincera com você',
      dorFecho: 'O verão vai chegar de qualquer jeito. A diferença é como você vai estar quando ele chegar.',
      compTitulo: 'Faça as contas',
      comp: [
        { nome: 'Canetinha', preco: 'R$ 500+ por mês', itens: ['Paga <b>todo mês</b>', 'Precisa de receita', 'Não ensina o hábito'] },
        { nome: 'Protocolo Corpo Diva', preco: 'R$ 47 uma vez', itens: ['Paga <b>uma vez só</b>', 'Em casa, 15 min por dia', 'Cuida do corpo <b>e da cabeça</b>'] },
      ],
      conta: 'Nos seus 30 dias, sai a <b>R$ 1,57 por dia</b>. Menos que um cafezinho.',
      sabTitulo: 'Os 3 sabotadores da sua barriga, e como o Método Cinturão Diva ataca cada um',
      sab: [
        ['Cinturão desligado', 'O músculo que segura a barriga por dentro, como uma cinta, enfraquece e a barriga vai pra frente. Abdominal nenhum resolve.', '→ Religa o cinturão: 15 minutos de respiração e hipopressivos (o vácuo abdominal).'],
        ['Dieta radical', 'Você corta tudo, perde uns quilinhos e volta tudo.', '→ Fim da dieta radical, com o Cardápio de Emergência Diva.'],
        ['A cabeça', 'Estresse, docinho, beliscar à noite, “já estraguei, começo segunda”.', '→ Desliga a sabotagem: áudio Mente Magra e Diva e o Planner Diva.'],
      ],
      feitoTitulo: 'Montado a partir do que você respondeu',
      tem: r => ({ canetinha: ['usei', 'uso', 'penso'].includes(r.canetinha), sanfona: ['voltou', 'canetinha'].includes(r.tentou),
        abdominal: r.tentou === 'abdominal', estufada: r['barriga-dia'] === 'estufa-noite', fase: ['pos-parto', 'menopausa'].includes(r.fase),
        pouco: ['5', '15'].includes(r['tempo-dia']) || ['corrida', 'todos'].includes(r.rotina), cabeca: ['ansiedade', 'doce', 'noite'].includes(r.sabotador) }),
      feitoLista: [
        ['canetinha', 'Você marcou a <b>canetinha</b>: aqui o trabalho é com <b>hábito, postura e respiração</b>, sem gastar R$ 500 por mês.'],
        ['sanfona', 'O peso <b>já voltou</b> antes: o áudio <b>Mente Magra e Diva</b> e o <b>Planner</b> cuidam da cabeça para o resultado ficar.'],
        ['abdominal', 'Você fez <b>muito abdominal</b> sem resultado: aqui é a <b>técnica certa</b>, com hipopressivos.'],
        ['estufada', 'Sua barriga <b>estufa à noite</b>: as aulas trabalham o seu cinturão natural, e tem o <b>Cardápio de Emergência Diva</b>.'],
        ['fase', 'Você marcou <b>menopausa ou pós-parto</b>: começa pela <b>Avaliação Inicial</b> da barriga.'],
        ['pouco', 'Você tem <b>pouco tempo</b>: aulas de <b>15 minutos</b> e uma rotina express de <b>5 minutos</b>.'],
        ['cabeca', 'O que te tira do caminho é a <b>cabeça</b>: a Mente Magra e Diva ajuda a sair do “tudo ou nada”.'],
      ],
      recebeTitulo: 'Tudo o que você recebe hoje',
      mockupImg: { src: IMG + 'mockup-kit.webp', alt: 'Aulas, áudio, planner e bônus do Protocolo Corpo Diva', w: 1200, h: 851 },
      recebe: [
        '<b>Método Cinturão Diva</b>: aulas de 15 minutos por dia, com respiração e hipopressivos',
        '<b>Conheça Sua Barriga</b>: avaliação inicial, fotos e medidas',
        '<b>Ative Sua Mente Magra e Diva</b>: áudio para a cabeça não sabotar o corpo',
        '<b>Planner Diva</b>: o que fazer em cada dia',
        '<b>Comece Aqui</b>: como funciona e por onde começar',
        'Bônus: <b>Cardápio de Emergência Diva</b>',
        'Bônus: <b>Projeto Minha Calça Favorita</b>',
        'Bônus: <b>Cintura Ativa</b>, rotina express de 5 minutos para os dias corridos',
      ],
      professora: {
        titulo: 'Michele Salla',
        foto: { src: IMG + 'michele-recorte.webp', alt: 'Michele Salla', w: 802, h: 1292 },
        textos: ['Educadora física <b>desde 2005</b>, especialista em emagrecimento comportamental, licenciada na técnica da <b>Barriga Negativa</b> e autora do livro <b>Vida Diva</b>.',
          'Há mais de 20 anos ela ajuda mulheres a perderem a barriga sem viver de dietas: <b>primeiro a mente, depois o corpo</b>.'],
      },
      garantia: { titulo: 'Risco zero: 7 dias de garantia', texto: 'Entre hoje, faça as aulas e ouça o áudio. Se em 7 dias você achar que não é pra você, pede o reembolso e recebe <b>100% do valor de volta</b>, sem precisar explicar.' },
      faq: [
        ['Preciso de academia ou equipamento?', 'Não. As aulas são em casa, com o peso do próprio corpo, em 15 minutos por dia.'],
        ['Tenho mais de 50. Serve para mim?', 'Sim. Os hipopressivos são feitos com respiração e postura, sem impacto, no seu ritmo.'],
        ['Tive bebê ou tenho hérnia. Posso fazer?', 'Você precisa de liberação médica antes de começar. A aula “Conheça Sua Barriga” ensina a observar sinais como a diástase.'],
        ['É mensalidade?', 'Não. É pagamento único de R$ 47 (ou 12x de R$ 4,83).'],
        ['Com que nome chega o acesso?', 'O Protocolo Corpo Diva usa as aulas do Desafio 7 em 7 da Michele: o acesso chega por e-mail com o nome Desafio 7 em 7. É o mesmo material.'],
        ['Como funciona a garantia?', 'Você tem 7 dias. Se não fizer sentido para você, pede o reembolso pela própria plataforma.'],
      ],
      duas: { titulo: 'Agora você tem duas opções',
        a: ['Fechar esta página', 'E chegar no verão do mesmo jeito: a roupa larga, a barriga escondida na foto e a segunda-feira como data do recomeço.'],
        d: ['Começar hoje, por R$ 47', 'Seguir o Método Cinturão Diva 15 minutos por dia e, em até 30 dias, perder até <b>18 kg de gordura</b> e chegar no verão <b>sem a barriga indesejada</b>.'] },
    },
    v3: {
      selo: 'Seu plano está pronto · acesso imediato',
      precoSub: 'pagamento único',
      precoVez: 'à vista · ou 12x de R$ 4,83',
      garantiaCurta: 'Garantia de 7 dias: se não for pra você, pede o reembolso.',
      titulo: 'Perca a barriga indesejada até o verão com <b>15 minutos por dia</b>, em casa',
      sub: 'O Protocolo Corpo Diva junta aulas de 15 minutos de respiração e hipopressivos com a Mente Magra e Diva, para o corpo e a cabeça mudarem juntos.',
      foto: { src: IMG + 'hero-antes-depois-avatar.webp', alt: 'Antes e depois (ilustração)', w: 1080, h: 1200 },
      heroAD: adFoto(2, 715, 900),
      adTitulo: 'Resultados de alunas da Michele',
      adLegenda: 'Alunas do Desafio 7 em 7 da Michele. Os resultados variam de pessoa para pessoa.',
      antesDepois: [adFoto(1, 682, 900), adFoto(3, 720, 720), adFoto(4, 900, 764)],
      feitoTitulo: 'Feito a partir do que você respondeu',
      tem: r => ({ canetinha: ['usei', 'uso', 'penso'].includes(r.canetinha), sanfona: ['voltou', 'canetinha'].includes(r.tentou),
        abdominal: r.tentou === 'abdominal', estufada: r['barriga-dia'] === 'estufa-noite', fase: ['pos-parto', 'menopausa'].includes(r.fase),
        pouco: ['5', '15'].includes(r['tempo-dia']) || ['corrida', 'todos'].includes(r.rotina), cabeca: ['ansiedade', 'doce', 'noite'].includes(r.sabotador) }),
      feitoLista: [
        ['canetinha', 'Você marcou a <b>canetinha</b>: aqui o trabalho é com <b>hábito, postura e respiração</b>, sem gastar R$ 500 por mês.'],
        ['sanfona', 'O peso <b>já voltou</b> antes: o áudio <b>Mente Magra e Diva</b> e o <b>Planner</b> cuidam da cabeça para o resultado ficar.'],
        ['abdominal', 'Você fez <b>muito abdominal</b> sem resultado: aqui é a <b>técnica certa</b>, com hipopressivos.'],
        ['estufada', 'Sua barriga <b>estufa à noite</b>: as aulas trabalham o seu cinturão natural, e tem o <b>Cardápio de Emergência Diva</b>.'],
        ['fase', 'Você marcou <b>menopausa ou pós-parto</b>: começa pela <b>Avaliação Inicial</b> da barriga.'],
        ['pouco', 'Você tem <b>pouco tempo</b>: aulas de <b>15 minutos</b> e uma rotina express de <b>5 minutos</b>.'],
        ['cabeca', 'O que te tira do caminho é a <b>cabeça</b>: a Mente Magra e Diva ajuda a sair do “tudo ou nada”.'],
      ],
      feito: { perfil: '' },
      depoTitulo: 'O que as alunas dizem',
      depoimentos: [], // (ESCREVER AQUI: 3 depoimentos reais de alunas do Desafio, a Michele manda)
      recebeTitulo: 'Veja tudo que você vai receber',
      mockupImg: { src: IMG + 'mockup-kit.webp', alt: 'Aulas, áudio, planner e bônus do Protocolo Corpo Diva', w: 1200, h: 851 },
      recebe: [
        '<b>Comece Aqui</b>: como funciona e o que fazer em cada dia',
        '<b>Conheça Sua Barriga</b>: avaliação inicial, fotos e medidas',
        '<b>15 Minutos por Dia</b>: barriga e cintura em ação, com respiração e hipopressivos',
        '<b>Ative Sua Mente Magra e Diva</b>: áudio para a cabeça não sabotar o corpo',
        '<b>Planner Diva</b>: o roteiro de cada dia',
        'Bônus: <b>Projeto Minha Calça Favorita</b>, <b>Cardápio de Emergência Diva</b> e <b>Cintura Ativa</b> (rotina express de 5 minutos)',
      ],
      praQuem: {
        titulo: 'O Protocolo Corpo Diva é pra quem…',
        itens: [['sanfona', 'Já emagreceu e o peso voltou'], ['canetinha', 'Pensa em canetinha, mas não quer gastar R$ 500 por mês'],
          ['abdominal', 'Faz abdominal e a barriga não sai'], ['estufada', 'Acorda com a barriga lisinha e à noite está estufada'],
          ['pouco', 'Tem pouco tempo e cuida de todo mundo, menos de si'], ['fase', 'Está na menopausa ou teve bebê'], ['cabeca', 'Desconta na comida quando estressa']],
        nota: 'Teve bebê há pouco tempo, tem hérnia ou outra condição de saúde? Converse com o seu médico antes de começar.',
      },
      professora: {
        titulo: 'Quem vai te guiar',
        foto: { src: IMG + 'michele-recorte.webp', alt: 'Michele Salla', w: 802, h: 1292 },
        textos: [
          'Eu sou a <b>Michele Salla</b>, educadora física <b>desde 2005</b>, especialista em emagrecimento comportamental e licenciada na técnica da <b>Barriga Negativa</b>.',
          'Autora do livro <b>Vida Diva</b> (2025). Há mais de 20 anos eu ajudo mulheres a perderem a barriga sem viver de dietas: <b>primeiro a mente, depois o corpo</b>.',
        ],
      },
      faq: [0, 1, 3, 4],
    },
    rodape: 'O Protocolo Corpo Diva é o conteúdo do Desafio 7 em 7 da Michele Salla e não é tratamento médico. Os resultados variam de pessoa para pessoa e a compra deste material não garante nenhum resultado específico. Este site não é afiliado ao Facebook.',
  },
}
