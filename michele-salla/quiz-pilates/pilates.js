/* Quiz da Michele Salla · PILATES EM CASA (fase 1 do teste, decisão do Patrik em 05/11/2026). Motor em ../quiz/motor.js.
   Modelo: o quiz do Desafio 7 em 7 e os quizzes de "pilates asiático" que rodam há meses no Meta (página "Pilates
   Asiáticos 28 dias" e Reverse Health: mulheres 40+, 15 a 20 minutos, barriga, core e postura, "descubra seu plano
   personalizado"). Preço do teste: R$ 47 (Patrik, 05/11). Tudo entre [[ ]] depende do produto de pilates da Michele na
   Hotmart e aparece em amarelo: não escrever nada do produto sem ver o que existe lá. */

const IMG = '../desafio-7em7/assets/img/'

const PROMESSAS = {
  1: {
    nome: 'Depois dos 40',
    etiqueta: 'Para mulheres a partir dos 35',
    titulo: 'Depois dos 40 o seu corpo pede outro treino. <mark>Descubra o seu plano de pilates em casa.</mark>',
    sub: 'Responda e veja qual é o seu perfil e por onde você começa.',
    botao: 'Quero o meu plano de pilates',
  },
  2: {
    nome: 'Sem impacto',
    etiqueta: 'Quiz gratuito',
    titulo: 'Chega de pular igual a uma maluca. <mark>Pilates em casa, sem impacto, no seu ritmo.</mark>',
    sub: 'Descubra o seu perfil e o plano de pilates para começar hoje.',
    botao: 'Quero treinar sem impacto',
  },
  3: {
    nome: 'Sem estúdio',
    etiqueta: 'Quiz gratuito',
    titulo: 'Pilates sem estúdio e sem sair de casa. <mark>Descubra o plano certo para o seu corpo.</mark>',
    sub: '[[Confirmar: precisa de algum acessório (bola, elástico) ou só o tapete?]]',
    botao: 'Quero descobrir o meu plano',
  },
  4: {
    nome: 'Plano personalizado',
    etiqueta: 'Quiz gratuito',
    titulo: 'Descubra o plano de pilates em casa <mark>para o seu perfil.</mark>',
    sub: 'Algumas perguntas sobre o seu corpo e a sua rotina e você vê por onde começar.',
    botao: 'Descobrir o meu plano',
  },
  5: {
    nome: 'A rotina da Michele',
    etiqueta: 'Quiz gratuito',
    titulo: 'Eu tenho 45 anos e faço pilates em casa. <mark>Descubra por onde você começa.</mark>',
    sub: 'Responda e veja qual é o seu perfil.',
    botao: 'Quero descobrir o meu perfil',
  },
}

const TELAS = [
  { id: 'capa', tipo: 'capa' },
  { id: 'idade', tipo: 'uma', cols: 2, titulo: 'Qual a sua faixa de idade?', sub: 'Cada fase da vida pede um cuidado diferente com o corpo.',
    op: [['-35', 'Menos de 35'], ['35-44', '35 a 44 anos'], ['45-54', '45 a 54 anos'], ['55+', '55 ou mais']] },
  { id: 'michele', tipo: 'michele' },
  { id: 'objetivo', tipo: 'uma', titulo: 'O que você mais quer com o pilates?', sub: 'É a resposta que mais pesa no seu plano.',
    op: [['barriga', 'Trabalhar a barriga e a cintura'], ['postura', 'Melhorar a postura', 'E aliviar o incômodo nas costas'], ['leveza', 'Me sentir mais leve e flexível'],
         ['autoestima', 'Recuperar a autoestima', 'Me olhar no espelho e gostar do que vejo'], ['tudo', 'Tudo isso']] },
  { id: 'pilates-antes', tipo: 'uma', titulo: 'Você já fez pilates?', sub: 'Não tem resposta errada.',
    op: [['nunca', 'Nunca fiz'], ['estudio', 'Já fiz em estúdio'], ['video', 'Já tentei em casa, por vídeo', 'E não sei se fiz certo'], ['faco', 'Faço hoje']] },
  { id: 'incomoda', tipo: 'varias', titulo: 'O que mais te incomoda no seu corpo hoje?', sub: 'Pode marcar mais de um.',
    op: [['barriga', 'A barriga'], ['costas', 'Dor ou cansaço nas costas'], ['postura', 'A postura (ombros caídos, corpo "pesado")'], ['flacidez', 'Flacidez'],
         ['rigidez', 'Corpo travado, pouca flexibilidade'], ['nenhum', 'Nada disso']] },
  { id: 'impacto', tipo: 'uma', titulo: 'E os exercícios de impacto, como pular e correr?', sub: 'Pense em como o seu corpo responde.',
    op: [['bem', 'Faço sem problema'], ['dor', 'Sinto dor no joelho ou nas costas'], ['escapes', 'Tenho escapes de xixi quando pulo'], ['evito', 'Não gosto, evito sempre']] },
  { id: 'prova', tipo: 'prova' },
  { id: 'rotina', tipo: 'uma', titulo: 'Como é a sua rotina hoje?', sub: 'O plano precisa caber na vida real.',
    op: [['corrida', 'Corrida, mal sobra tempo para mim', 'Trabalho, casa, filhos…'], ['todos', 'Cuido de todo mundo, menos de mim', 'Todo mundo virou prioridade'],
         ['equilibrada', 'Equilibrada, mas sem sobra', 'Consigo me organizar'], ['tempo', 'Tenho tempo para me dedicar', 'Posso investir em mim']] },
  { id: 'tempo-dia', tipo: 'uma', titulo: 'Quanto tempo por dia você consegue para você?', sub: 'Até o menor tempo serve para começar.',
    op: [['5-10', '5 a 10 minutos'], ['10-15', '10 a 15 minutos'], ['15-30', '15 a 30 minutos'], ['30+', 'Mais de 30 minutos']] },
  { id: 'espaco', tipo: 'uma', titulo: 'Onde você vai praticar?', sub: '[[Confirmar com a Michele o que o pilates dela precisa]]',
    op: [['sala', 'Na sala ou no quarto, tenho um cantinho'], ['tapete', 'Já tenho um tapete'], ['pouco', 'Tenho pouco espaço'], ['nao-sei', 'Ainda não sei']] },
  { id: 'fase', tipo: 'uma', titulo: 'Você está em alguma destas fases?', sub: 'O corpo muda em cada fase, e o treino também.',
    op: [['pos-parto', 'Tive bebê nos últimos 2 anos'], ['maes', 'Já sou mãe há mais tempo'], ['menopausa', 'Pré-menopausa ou menopausa'], ['nenhuma', 'Nenhuma delas']] },
  { id: 'insight', tipo: 'insight' },
  { id: 'carregando-1', tipo: 'carregando', titulo: 'Analisando suas respostas…', linhas: ['Juntando suas respostas…', 'Vendo o que o seu corpo está pedindo…', 'Vendo o que mais te faz parar…'] },
  { id: 'recomecos', tipo: 'uma', cols: 2, titulo: 'Quantas vezes você já começou um treino e parou?', sub: 'Seja sincera. Isso mostra o que te faz parar.',
    op: [['1-2', 'Uma ou duas vezes'], ['varias', 'Várias vezes'], ['perdi-conta', 'Já perdi a conta'], ['comecando', 'Ainda vou começar']] },
  { id: 'medo', tipo: 'uma', titulo: 'Qual é o seu maior medo agora?', sub: 'Seus medos são válidos. Vou responder cada um no final.',
    op: [['movimentos', 'Não conseguir fazer os movimentos', 'Nunca fiz ou não tenho flexibilidade'], ['dor', 'Sentir dor ou me machucar'], ['tempo', 'Não ter tempo', 'Minha rotina não deixa espaço'],
         ['dinheiro', 'Gastar e não ter resultado', 'Já investi em coisas que não funcionaram'], ['desistir', 'Desistir de novo', 'Começo e paro']] },
  { id: 'sonho', tipo: 'uma', titulo: 'Daqui a algumas semanas, o que você gostaria de sentir?', sub: 'Feche os olhos por 3 segundos e imagine.',
    op: [['leve', '“Acordo leve, sem o corpo travado”'], ['postura', '“Ando com a postura de quem se cuida”'], ['roupa', '“A roupa veste melhor”'],
         ['diva', '“Voltei a me sentir Diva”'], ['consegui', '“Consegui. Eu sabia que era capaz”']] },
  { id: 'carregando-2', tipo: 'carregando', titulo: 'Montando o seu plano de pilates…', linhas: ['Separando o seu primeiro passo…', 'Encaixando no tempo que você tem…', 'Escolhendo por onde você começa…'] },
  { id: 'resultado', tipo: 'resultado' },
  { id: 'oferta', tipo: 'oferta' },
]

// Perfis: a regra confere de cima para baixo e para no primeiro que bater.
const PERFIS = {
  'nova-fase': {
    nome: 'A Diva da Nova Fase',
    retrato: 'O seu corpo mudou: gestação, os anos ou a menopausa. O que funcionava antes parou de funcionar.',
    trava: 'Não é falta de esforço. Agora o seu corpo pede outro cuidado: fortalecer o centro do corpo, de dentro para fora, com postura e respiração, sem impacto.',
    comeca: 'Você começa por [[1ª aula ou módulo do pilates indicado para quem está numa nova fase]].',
  },
  'sem-impacto': {
    nome: 'A Diva Sem Impacto',
    retrato: 'Pular, correr e treino puxado não combinam com o seu corpo hoje: dói, incomoda ou você simplesmente não gosta.',
    trava: 'Você não precisa sofrer para cuidar do corpo. O pilates trabalha força, postura e o centro do corpo sem impacto.',
    comeca: 'Você começa por [[aulas do pilates sem impacto para iniciar]].',
  },
  'postura': {
    nome: 'A Diva da Postura',
    retrato: 'Costas cansadas, ombros caídos e a sensação de corpo pesado no fim do dia.',
    trava: 'Quando a postura sai do lugar, a barriga aparece mais e o corpo cansa mais. O primeiro passo é devolver o alinhamento.',
    comeca: 'Você começa por [[aulas do pilates de postura e coluna]].',
  },
  'recomeco': {
    nome: 'A Diva que Recomeça Toda Segunda',
    retrato: 'Você começa com tudo, a semana aperta, um dia sem treino vira “já estraguei” e a segunda-feira vira a data do recomeço.',
    trava: 'O que te tira do caminho não é preguiça, é o “tudo ou nada”. Um treino curto que você faz vale mais que o treino perfeito que você não faz.',
    comeca: 'Você começa por [[aula curta do pilates para os dias corridos]], um dia de cada vez.',
  },
  'iniciante': {
    nome: 'A Diva que Vai Começar Agora',
    retrato: 'Você quer cuidar do corpo em casa, no seu ritmo, sem estúdio e sem pressão.',
    trava: 'Começar sem saber o que fazer é o que faz muita gente desistir. Você precisa de um caminho simples, do básico para frente.',
    comeca: 'Você começa por [[aula de boas-vindas ou do básico do pilates]].',
  },
}

function perfilDe(r) {
  const inc = r.incomoda || []
  if (['pos-parto', 'menopausa'].includes(r.fase) || r.impacto === 'escapes') return 'nova-fase'
  if (['dor', 'evito'].includes(r.impacto)) return 'sem-impacto'
  if (inc.includes('costas') || inc.includes('postura') || r.objetivo === 'postura') return 'postura'
  if (['varias', 'perdi-conta'].includes(r.recomecos) || r.medo === 'desistir') return 'recomeco'
  return 'iniciante'
}

const MEDO = {
  movimentos: '[[como as aulas ensinam quem nunca fez pilates ou não tem flexibilidade]]',
  dor: 'pilates é sem impacto. Se você tem dor, hérnia ou teve bebê há pouco tempo, converse com o seu médico antes de começar.',
  tempo: '[[minutos de cada aula]] por dia, em casa.',
  dinheiro: '[[garantia na Hotmart: confirmar quantos dias]]: se não fizer sentido para você, pede o reembolso pela plataforma.',
  desistir: '[[o que no produto ajuda a manter a constância: planner, grupo, áudio?]]',
}

// Painel de revisão: respostas de exemplo para abrir cada perfil direto (?tela=resultado&perfil=…).
const EXEMPLO = {
  'nova-fase': { fase: 'menopausa', impacto: 'escapes', medo: 'dor' },
  'sem-impacto': { fase: 'nenhuma', impacto: 'dor', medo: 'movimentos' },
  'postura': { fase: 'nenhuma', impacto: 'bem', incomoda: ['costas'], medo: 'tempo' },
  'recomeco': { fase: 'nenhuma', impacto: 'bem', incomoda: ['barriga'], recomecos: 'perdi-conta', medo: 'desistir' },
  'iniciante': { fase: 'maes', impacto: 'bem', incomoda: ['barriga'], recomecos: 'comecando', medo: 'dinheiro' },
}

const QUIZ = {
  slug: 'pilates-p', // painel: pilates-p1 … pilates-p5 (aba Quiz Pilates)
  logo: null,
  capa: { src: IMG + 'michele-recorte.webp', alt: 'Michele Salla', w: 802, h: 1292, pendencia: 'Foto da Michele fazendo pilates (enviar)' },
  bio: [
    'Educadora Física desde 2005, especialista em emagrecimento comportamental, licenciada na técnica da Barriga Negativa e autora do livro Vida Diva (2025).',
    '[[Frase da Michele sobre o pilates: há quanto tempo dá aula e onde (o CNPJ é de serviços de pilates e personal)]]',
    'Nas próximas perguntas, vou entender o seu corpo e a sua rotina para te mostrar por onde começar.',
  ],
  prova: { titulo: 'Quem já pratica comigo', fotos: [], pendencia: 'Fotos ou depoimentos reais de alunas do pilates (as do Desafio 7 em 7 não podem ser usadas aqui)' },
  insight: {
    ciclo: ['Rotina corrida. Cansaço.', 'Costas pesadas no fim do dia.', 'Treino com impacto que dói ou que você larga.', 'E o corpo vai ficando travado.'],
    destaque: 'Isso não é falta de esforço.',
    texto: 'Com um treino sem impacto, feito em casa e no seu ritmo, poucos minutos por dia já são um começo: postura, respiração e o centro do corpo trabalhando a seu favor.',
  },
  resultado: {
    mente: 'E cuidar dos pensamentos e hábitos que fazem você desistir de si mesma.',
    diaADia: '[[Frase de fechamento com o que o pilates entrega por dia]]',
    botao: 'Ver o meu plano de pilates',
  },
  oferta: {
    produto: 'Pilates em Casa', valor: '47', checkout: null, // [[link da Hotmart a R$ 47: o Patrik manda]]
    titulo: 'O seu caminho começa no <mark>[[nome do produto de pilates na Hotmart]]</mark>',
    intro: '[[O que é: quantas aulas, quantos minutos cada, em quantos dias, como acessa]]',
    modulos: [['[[Módulo 1]]', '[[o que tem dentro, como está na Hotmart]]'], ['[[Módulo 2]]', '[[…]]'], ['[[Módulo 3]]', '[[…]]']],
    bonus: ['[[bônus, se houver]]'],
    fotos: [], fotosPendencia: 'Fotos de alunas do pilates ou prints de depoimentos reais',
    parcela: 'à vista · [[parcelamento que a Hotmart mostra]]',
    botao: 'Quero começar o meu pilates em casa',
    selos: 'Compra segura · [[Garantia de 7 dias]] · Pagamento único',
  },
}
