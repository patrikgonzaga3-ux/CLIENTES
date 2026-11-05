/* Quiz da Michele Salla · DESAFIO 7 EM 7 (fase 2 do teste, depois do Pilates). Motor em motor.js. Modelado no quiz "De Volta ao Eixo" da Laura (26 telas, perfil por regra, oferta única).
   Tudo o que a pessoa lê está aqui. Fontes dos textos: posts e anúncios da Michele (Gerenciador de Anúncios),
   página do Desafio 7 em 7 no ar e a reunião de 03/11/2026. Itens entre [[ ]] são pendências para a Michele preencher.
   Endereço: ?p=1..5 escolhe a capa (promessa). Para o painel: ?tela=<id>&p=<n>&perfil=<id> abre uma tela direto. */

const IMG = '../desafio-7em7/assets/img/'
const CHECKOUT = 'https://payfast.greenn.com.br/199167/offer/E1YMM7' // Desafio 7 em 7, R$ 47 (oferta aprovada em 27/10)

const PROMESSAS = {
  1: {
    nome: 'A rotina da Michele',
    etiqueta: 'Quiz gratuito',
    titulo: 'Descubra a rotina de <mark>5 minutos por dia</mark> que eu faço para manter a barriga lisa aos 45 anos',
    sub: 'Responda e veja qual é o seu perfil e por onde você começa.',
    botao: 'Quero descobrir meu perfil',
  },
  2: {
    nome: 'Barriga estufada à noite',
    etiqueta: 'Quiz gratuito',
    titulo: 'Você acorda com a barriga lisinha e <mark>à noite ela está estufada?</mark>',
    sub: 'Descubra o que a sua barriga está te dizendo e o que fazer em 5 minutos por dia.',
    botao: 'Quero entender a minha barriga',
  },
  3: {
    nome: 'Sem mil abdominais',
    etiqueta: 'Quiz gratuito',
    titulo: 'Você não precisa de mil abdominais. <mark>Precisa da técnica certa.</mark>',
    sub: 'Descubra o seu perfil e o exercício de 5 minutos que afina a cintura sem impacto.',
    botao: 'Quero descobrir a técnica certa para mim',
  },
  4: {
    nome: 'Depois dos 40',
    etiqueta: 'Para mulheres a partir dos 35',
    titulo: 'Depois dos 40 a barriga parou de responder? <mark>Não é falta de esforço.</mark>',
    sub: 'É falta da técnica certa. Descubra o seu perfil e por onde começar.',
    botao: 'Quero saber o meu perfil',
  },
  5: {
    nome: 'Você se deixou pra depois',
    etiqueta: 'Quiz gratuito',
    titulo: 'Até quando você vai <mark>se deixar pra depois?</mark>',
    sub: 'Descubra o seu perfil e por onde recomeçar hoje, sem esperar segunda-feira.',
    botao: 'Quero recomeçar por mim',
  },
}

const TELAS = [
  { id: 'capa', tipo: 'capa' },
  { id: 'idade', tipo: 'uma', cols: 2, titulo: 'Qual a sua faixa de idade?', sub: 'Cada fase da vida pede um cuidado diferente com a barriga.',
    op: [['-35', 'Menos de 35'], ['35-44', '35 a 44 anos'], ['45-54', '45 a 54 anos'], ['55+', '55 ou mais']] },
  { id: 'michele', tipo: 'michele' },
  { id: 'objetivo', tipo: 'uma', titulo: 'O que você mais quer agora?', sub: 'É a resposta que mais pesa no seu resultado.',
    op: [['barriga', 'Diminuir a barriga', 'Parar de esconder a barriga com roupa larga'], ['cintura', 'Afinar a cintura', 'Ver a cintura marcada de novo'],
         ['postura', 'Melhorar a postura', 'E aliviar as dores nas costas'], ['autoestima', 'Recuperar a autoestima', 'Me olhar no espelho e gostar do que vejo'], ['tudo', 'Tudo isso', 'Quero a transformação completa']] },
  { id: 'barriga-dia', tipo: 'uma', titulo: 'Como a sua barriga fica ao longo do dia?', sub: 'Observe o seu dia de hoje.',
    op: [['estufa-noite', 'Acordo com ela lisinha e à noite está estufada', 'Ela muda muito do dia para a noite'], ['sempre', 'Fica grande o dia inteiro', 'Não muda muito do dia para a noite'],
         ['flacida', 'Sinto a barriga mais flácida, sem firmeza', 'Principalmente depois de gestação ou com o tempo'], ['nao-sei', 'Nunca prestei atenção', 'Vou começar a reparar']] },
  { id: 'recomecos', tipo: 'uma', cols: 2, titulo: 'Quantas vezes você já recomeçou?', sub: 'Seja sincera. Isso mostra o que te faz parar.',
    op: [['1-2', 'Uma ou duas vezes'], ['varias', 'Várias vezes'], ['perdi-conta', 'Já perdi a conta'], ['comecando', 'Ainda vou começar']] },
  { id: 'abdominal', tipo: 'uma', titulo: 'E o abdominal tradicional?', sub: 'Aquele deitada, subindo o tronco.',
    op: [['muito', 'Faço bastante e a barriga não muda', 'Às vezes parece até mais estufada'], ['parei', 'Já fiz e parei', 'Cansei de não ver resultado'],
         ['dor', 'Sinto dor no pescoço ou nas costas', 'Por isso evito'], ['nunca', 'Nunca fiz', 'Não é a minha praia']] },
  { id: 'hipopressivo', tipo: 'uma', titulo: 'Você já ouviu falar de hipopressivo (o vácuo abdominal)?', sub: 'É a técnica de respiração e postura que eu uso todos os dias.',
    op: [['nunca', 'Nunca ouvi falar'], ['ouvi', 'Já ouvi, mas não sei fazer'], ['sozinha', 'Já tentei sozinha e não sei se faço certo'], ['faco', 'Faço de vez em quando']] },
  { id: 'prova', tipo: 'prova' },
  { id: 'rotina', tipo: 'uma', titulo: 'Como é a sua rotina hoje?', sub: 'O Desafio foi pensado para a rotina real.',
    op: [['corrida', 'Corrida, mal sobra tempo para mim', 'Trabalho, casa, filhos…'], ['todos', 'Cuido de todo mundo, menos de mim', 'Todo mundo virou prioridade'],
         ['equilibrada', 'Equilibrada, mas sem sobra', 'Consigo me organizar'], ['tempo', 'Tenho tempo para me dedicar', 'Posso investir em mim']] },
  { id: 'sinais', tipo: 'varias', titulo: 'Você percebe algum destes sinais?', sub: 'Pode marcar mais de um. Não é diagnóstico, só ajuda a montar o seu perfil.',
    op: [['estufada', 'Barriga estufada'], ['costas', 'Dor nas costas'], ['escapes', 'Escapes de xixi ao tossir, rir ou pular'], ['intestino', 'Intestino preso'],
         ['ansiedade', 'Ansiedade'], ['cansaco', 'Cansaço e pouca energia'], ['nenhum', 'Nenhum destes']] },
  { id: 'fase', tipo: 'uma', titulo: 'Você está em alguma destas fases?', sub: 'O corpo muda em cada fase, e o cuidado com a barriga também.',
    op: [['pos-parto', 'Tive bebê nos últimos 2 anos'], ['maes', 'Já sou mãe há mais tempo'], ['menopausa', 'Pré-menopausa ou menopausa'], ['nenhuma', 'Nenhuma delas']] },
  { id: 'insight', tipo: 'insight' },
  { id: 'carregando-1', tipo: 'carregando', titulo: 'Analisando suas respostas…', linhas: ['Juntando suas respostas…', 'Vendo como a sua barriga se comporta…', 'Vendo o que mais te faz parar…'] },
  { id: 'sabotador', tipo: 'uma', titulo: 'O que mais te tira do caminho?', sub: 'Todo mundo tem um. Saber o seu é o primeiro passo.',
    op: [['ansiedade', 'Ansiedade e estresse', '“Quando estresso, desconto na comida”'], ['doce', 'Doce e besteira', '“Não resisto a um docinho”'], ['noite', 'Belisco à noite', '“Depois do jantar não paro mais”'],
         ['cansaco', 'Cansaço', '“Chego exausta e não tenho energia”'], ['tempo', 'Falta de tempo', '“O dia acaba antes de eu lembrar de mim”']] },
  { id: 'medo', tipo: 'uma', titulo: 'Qual é o seu maior medo agora?', sub: 'Seus medos são válidos. Vou responder cada um no final.',
    op: [['fracasso', 'Não conseguir de novo', 'Já tentei tanto que perdi a confiança'], ['tempo', 'Não ter tempo', 'Minha rotina não deixa espaço'], ['dinheiro', 'Gastar e não ter resultado', 'Já investi em coisas que não funcionaram'],
         ['dor', 'Sentir dor ou me machucar', 'Tenho medo de exercício com impacto'], ['rebote', 'Voltar tudo depois', 'Melhoro e depois volto ao mesmo']] },
  { id: 'sonho', tipo: 'uma', titulo: 'Se você acordasse amanhã com a barriga lisa e a cintura fina, qual seria o seu primeiro pensamento?', sub: 'Feche os olhos por 3 segundos e imagine.',
    op: [['vestido', '“Vou usar aquele vestido que está guardado”'], ['espelho', '“Finalmente gosto do que vejo no espelho”'], ['foto', '“Vou querer tirar foto em todo lugar”'],
         ['diva', '“Voltei a me sentir Diva”'], ['consegui', '“Consegui. Eu sabia que era capaz”']] },
  { id: 'tempo-dia', tipo: 'uma', titulo: 'Quanto tempo por dia você consegue para você?', sub: 'Até o menor tempo serve para começar.',
    op: [['5', '5 minutinhos', 'Meu tempo é curtíssimo'], ['10-15', '10 a 15 minutos', 'Consigo separar um tempinho'], ['15-30', '15 a 30 minutos', 'Tenho essa janela'], ['30+', 'Mais de 30 minutos', 'Posso me dedicar bem']] },
  { id: 'motivo', tipo: 'varias', titulo: 'O que te trouxe até aqui hoje?', sub: 'Pode marcar mais de um.',
    op: [['autoestima', 'Voltar a gostar de mim'], ['roupas', 'Usar as roupas que eu amo'], ['saude', 'Mais saúde e menos dor'], ['fotos', 'Parar de me esconder nas fotos'], ['provar', 'Provar para mim que consigo']] },
  { id: 'carregando-2', tipo: 'carregando', titulo: 'Montando o seu caminho de 7 dias…', linhas: ['Separando o seu primeiro passo…', 'Encaixando no tempo que você tem…', 'Escolhendo por onde você começa no Desafio…'] },
  { id: 'resultado', tipo: 'resultado' },
  { id: 'oferta', tipo: 'oferta' },
]

// Perfis: a regra confere de cima para baixo e para no primeiro que bater (como a T25 da Laura).
const PERFIS = {
  'nova-fase': {
    nome: 'A Diva da Nova Fase',
    retrato: 'O seu corpo mudou: gestação, os anos ou a menopausa. O que funcionava antes parou de funcionar, e a barriga não responde como antes.',
    trava: 'Não é falta de esforço. O seu corpo pede outro cuidado: fortalecer o abdômen profundo, de dentro para fora, com postura e respiração, e cuidar dos pensamentos e hábitos que fazem você desistir de si mesma.',
    comeca: 'Você começa pela aula “Conheça Sua Barriga: Avaliação Inicial”: aprende a observar o seu abdômen, a reconhecer sinais como a diástase e a saber quando buscar avaliação profissional.',
  },
  'estufada': {
    nome: 'A Diva da Barriga Estufada',
    retrato: 'A sua barriga muda ao longo do dia: de manhã está melhor e à noite está estufada. Isso mexe com a roupa, com o humor e com a autoestima.',
    trava: 'Fazer cada vez mais abdominais não resolve tudo. É preciso trabalhar o seu cinturão natural com postura, respiração e cuidar dos pensamentos e hábitos que fazem você desistir de si mesma.',
    comeca: 'Você começa pelas aulas “15 Minutos por Dia: Barriga e Cintura em Ação”, com respiração e hipopressivos.',
  },
  'esforcada': {
    nome: 'A Diva Esforçada sem Técnica',
    retrato: 'Você não fica parada: já fez abdominal, dieta, treino. Mesmo assim, a barriga não sai e a cintura não aparece.',
    trava: 'Não é falta de esforço, é falta da técnica certa. Você não precisa de mil abdominais: precisa trabalhar o seu cinturão natural com postura e respiração, e cuidar dos pensamentos e hábitos que fazem você desistir de si mesma.',
    comeca: 'Você começa aprendendo a técnica do jeito certo, nas aulas “15 Minutos por Dia”, para o esforço finalmente virar resultado.',
  },
  'recomeco': {
    nome: 'A Diva que Recomeça Toda Segunda',
    retrato: 'Você começa com tudo, a semana aperta, um deslize vira “já estraguei” e a segunda-feira vira a data do recomeço.',
    trava: 'O que te tira do caminho não é preguiça, é a cabeça: ansiedade, cansaço e o “tudo ou nada”. O corpo responde quando a mente para de desistir de si mesma.',
    comeca: 'Você começa pelo áudio “Ative Sua Mente Magra e Diva” e pelo “Planner Diva”, para saber o que fazer em cada um dos 7 dias.',
  },
  'depois': {
    nome: 'A Diva que se Deixou pra Depois',
    retrato: 'Rotina corrida, casa, filhos, trabalho. Todo mundo virou prioridade, menos você. E um dia você se olhou e não se reconheceu.',
    trava: 'Você não precisa de horas livres. Precisa de poucos minutos por dia que sejam só seus, para o corpo e para a cabeça, e de largar os hábitos que fazem você desistir de si mesma.',
    comeca: 'Você começa pelo “Comece Aqui: Sua Jornada Começa Agora” e encaixa os primeiros minutos do dia em você, sem esperar segunda-feira.',
  },
}

function perfilDe(r) {
  const s = r.sinais || []
  if (['pos-parto', 'menopausa'].includes(r.fase) || s.includes('escapes')) return 'nova-fase'
  if (r['barriga-dia'] === 'estufa-noite' || s.includes('estufada') || s.includes('intestino')) return 'estufada'
  if (r.abdominal === 'muito') return 'esforcada'
  if (['varias', 'perdi-conta'].includes(r.recomecos) || ['ansiedade', 'noite', 'doce'].includes(r.sabotador)) return 'recomeco'
  return 'depois'
}

// Texto da Michele (04/11) para a parte da mente, igual em todos os perfis.
const MENTE = 'É aí que entra a Mente Magra e Diva: aprender a sair do “tudo ou nada” e fazer escolhas que sustentem a sua transformação.'
const DIA_A_DIA = 'Quinze minutinhos para cuidar do corpo. Uma tarefa por dia para transformar a forma como você se cuida. 💜'

const MEDO = {
  fracasso: 'um passo a passo de 7 dias, com o Planner Diva, para você saber exatamente o que fazer em cada dia.',
  tempo: 'aulas de 15 minutos por dia, em casa, e uma rotina express de 5 minutos para os dias corridos.',
  dinheiro: 'garantia de 7 dias: se não fizer sentido para você, pode pedir o reembolso conforme a política da plataforma.',
  dor: 'os hipopressivos são feitos com respiração e postura, sem impacto. Se você teve bebê há pouco tempo ou tem hérnia, precisa de liberação médica antes de começar.',
  rebote: 'o áudio Mente Magra e Diva e o Planner ajudam a transformar os 7 dias em hábito.',
}

const MODULOS = [
  ['Comece Aqui: Sua Jornada Começa Agora', 'Como funciona o Desafio, como acessar as aulas e o que fazer em cada dia.'],
  ['Conheça Sua Barriga: Avaliação Inicial', 'Observar o abdômen, sinais como a diástase, quando buscar avaliação profissional, fotos e medidas.'],
  ['15 Minutos por Dia: Barriga e Cintura em Ação', 'Respiração e hipopressivos para o abdômen, a musculatura e a postura.'],
  ['Ative Sua Mente Magra e Diva', 'Áudio de motivação e visualização para reforçar o compromisso com a rotina.'],
  ['Planner Diva: Seus 7 Dias de Transformação', 'Roteiro diário para acompanhar exercícios e progresso.'],
]
const BONUS = ['Projeto Minha Calça Favorita', 'Cardápio de Emergência Diva', 'Cintura Ativa: Rotina Express (5 minutos)']

// Painel de revisão: respostas de exemplo para abrir cada perfil direto (?tela=resultado&perfil=…).
const EXEMPLO = {
  'nova-fase': { fase: 'pos-parto', sinais: ['escapes'], medo: 'dor', 'tempo-dia': '10-15' },
  'estufada': { 'barriga-dia': 'estufa-noite', sinais: ['estufada'], fase: 'nenhuma', medo: 'tempo', 'tempo-dia': '5' },
  'esforcada': { 'barriga-dia': 'sempre', abdominal: 'muito', fase: 'nenhuma', sinais: ['costas'], medo: 'fracasso', 'tempo-dia': '15-30' },
  'recomeco': { 'barriga-dia': 'sempre', abdominal: 'parei', recomecos: 'perdi-conta', sabotador: 'ansiedade', fase: 'nenhuma', sinais: ['ansiedade'], medo: 'rebote', 'tempo-dia': '10-15' },
  'depois': { 'barriga-dia': 'sempre', abdominal: 'nunca', recomecos: '1-2', sabotador: 'tempo', fase: 'maes', sinais: ['cansaco'], medo: 'dinheiro', 'tempo-dia': '5' },
}

const resultadoFoto = n => ({ src: IMG + 'resultado-' + n + '.webp', alt: 'Antes e depois de aluna do Desafio 7 em 7', w: 800, h: 800 })
const QUIZ = {
  slug: 'quiz-p', // painel: quiz-p1 … quiz-p5 (aba Quiz Diva)
  logo: { src: IMG + 'logo-desafio-7em7-escura.png', alt: 'Desafio 7 em 7' },
  capa: { src: IMG + 'hero-antes-depois-avatar.webp', alt: 'Antes e depois do Desafio 7 em 7', w: 1080, h: 1200 },
  bio: [
    'Educadora Física desde 2005, especialista em emagrecimento comportamental, licenciada na técnica da Barriga Negativa e autora do livro Vida Diva (2025).',
    'Referência em transformação feminina há mais de 20 anos, criei uma metodologia que já ajudou milhares de mulheres a perderem a barriga sem viver de dietas: primeiro a mente, depois o corpo.',
    'Nas próximas perguntas, vou entender a sua barriga e a sua rotina para te mostrar por onde começar.',
  ],
  prova: { titulo: 'Alunas que já começaram pelo Desafio 7 em 7', fotos: [1, 2, 3, 4].map(resultadoFoto) },
  insight: {
    ciclo: ['Rotina corrida. Cansaço.', 'Filhos, casa, trabalho…', 'Todo mundo virou prioridade, menos você.', 'E quando você percebe, a barriga aumentou e a autoestima sumiu.'],
    destaque: 'Isso não é “normal”, e não é falta de esforço.',
    texto: 'Com a técnica certa, poucos minutos por dia já são um começo: respiração, postura e o seu cinturão natural trabalhando a seu favor.',
  },
  resultado: {
    mente: MENTE,
    extra: 'E com o áudio “Ative Sua Mente Magra e Diva” e o Planner Diva, para cuidar da cabeça junto com o corpo.', extraSeTem: 'Mente Magra',
    diaADia: DIA_A_DIA,
    botao: 'Quero começar meus 7 dias',
  },
  oferta: {
    produto: 'Desafio 7 em 7', valor: '47', checkout: CHECKOUT,
    titulo: 'O seu caminho começa no <mark>Desafio 7 em 7</mark>',
    intro: '7 dias de aulas práticas de 15 minutos, em casa, com respiração e hipopressivos para trabalhar a barriga e a cintura, e o áudio Mente Magra e Diva para cuidar da cabeça.',
    modulos: MODULOS, bonus: BONUS,
    fotos: [1, 2, 5, 6].map(resultadoFoto),
    parcela: 'à vista · ou 12x de R$ 4,83',
    botao: 'Quero começar o Desafio 7 em 7',
    selos: 'Compra segura · Garantia de 7 dias · Pagamento único',
  },
}
