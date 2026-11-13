/* Quiz da Michele Salla · PILATES EM CASA (fase 1 do teste, decisão do Patrik em 05/11/2026). Motor em ../quiz/motor.js.
   Modelo: o quiz do Desafio 7 em 7 e os quizzes de "pilates asiático" que rodam há meses no Meta (página "Pilates
   Asiáticos 28 dias" e Reverse Health: mulheres 40+, 15 a 20 minutos, barriga, core e postura, "descubra seu plano
   personalizado"). Preço do teste: R$ 37 (Patrik, 06/11; antes R$ 47). Produto e história: texto "MINHA HISTÓRIA" da Michele (Drive, 06/11);
   fotos reais das aulas dela (mesma pasta). Tudo entre [[ ]] ainda falta e aparece em amarelo. */

const FOTO = 'img/'

const IMG = '../desafio-7em7/assets/img/'

const PROMESSAS = {
  // 1 e 2 DESATIVADAS em 11/11 (Patrik: "ajusta tudo"): a capa 5 passa da capa em 50% (19 de 38) contra 24% das outras (28 de 117). Para reativar, tire os //.
  // 1: {
  //   nome: 'Depois dos 40',
  //   etiqueta: 'Para mulheres a partir dos 35',
  //   titulo: 'Depois dos 40 o seu corpo pede outro treino. <mark>Descubra o seu plano de pilates em casa.</mark>',
  //   sub: 'Responda e veja qual é o seu perfil e por onde você começa.',
  //   botao: 'Quero o meu plano de pilates',
  // },
  // 2: {
  //   nome: 'Sem impacto',
  //   etiqueta: 'Quiz gratuito',
  //   titulo: 'Chega de pular igual a uma maluca. <mark>Pilates em casa, sem impacto, no seu ritmo.</mark>',
  //   sub: 'Descubra o seu perfil e o plano de pilates para começar hoje.',
  //   botao: 'Quero treinar sem impacto',
  // },
  // 3 DESATIVADA em 10/11 (Patrik): 10 visitas, 0 chegaram à oferta, 0 cliques e 0 vendas. Para reativar, tire os // das linhas abaixo.
  // 3: {
  //   nome: 'Sem estúdio',
  //   etiqueta: 'Quiz gratuito',
  //   titulo: 'Pilates sem estúdio e sem sair de casa. <mark>Descubra o plano certo para o seu corpo.</mark>',
  //   sub: 'Para começar, basta um tapete. Bola, flex ring, theraband e overball são opcionais.',
  //   botao: 'Quero descobrir o meu plano',
  // },
  // 4 DESATIVADA em 11/11: 20% passam da capa (5 de 25), a pior das ativas.
  // 4: {
  //   nome: 'Plano personalizado',
  //   etiqueta: 'Quiz gratuito',
  //   titulo: 'Descubra o plano de pilates em casa <mark>para o seu perfil.</mark>',
  //   sub: 'Algumas perguntas sobre o seu corpo e a sua rotina e você vê por onde começar.',
  //   botao: 'Descobrir o meu plano',
  // },
  5: {
    nome: 'A rotina da Michele',
    etiqueta: 'Quiz gratuito',
    titulo: 'Há quase 20 anos eu vivo o pilates todos os dias. <mark>Descubra por onde você começa em casa.</mark>',
    sub: 'Responda e veja qual é o seu perfil.',
    botao: 'Quero descobrir o meu perfil',
  },
  // 6 NOVA (13/11, Patrik: "a promessa dela, podemos testar"): modelada na capa do quiz da Lays Trancoso (pilates 50+:
  // "Acabe com as dores e emagreça após os 50 anos com exercícios seguros de pilates em casa"), com a idade do nosso público
  // (80% tem 45+). Fora do sorteio: abre só com ?p=6, para um conjunto próprio. Falta a Michele confirmar a promessa.
  6: {
    nome: 'Dores e emagrecer 45+',
    etiqueta: 'Quiz gratuito',
    titulo: 'Acabe com as dores e emagreça depois dos 45. <mark>Pilates em casa, com exercícios seguros e sem impacto.</mark>',
    faixa: '', // o título já diz "pilates em casa, sem impacto"
    sub: 'Responda e veja qual é o seu perfil.',
    botao: 'Quero descobrir o meu perfil',
  },
}

const TELAS = [
  { id: 'capa', tipo: 'capa' },
  // A idade fica na própria capa (QUIZ.idadeNaCapa, 06/11): o primeiro clique já é a resposta.
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
    op: [['bem', 'Faço sem problema'], ['dor', 'Sinto dor no joelho ou nas costas'], ['escapes', 'Tenho escapes de xixi quando pulo'], ['evito', 'Não gosto, evito sempre']],
    dica: '💡 O pilates trabalha força, postura e o centro do corpo sem impacto, no seu ritmo.' },
  { id: 'prova', tipo: 'prova' },
  { id: 'rotina', tipo: 'uma', titulo: 'Como é a sua rotina hoje?', sub: 'O plano precisa caber na vida real.',
    op: [['corrida', 'Corrida, mal sobra tempo para mim', 'Trabalho, casa, filhos…'], ['todos', 'Cuido de todo mundo, menos de mim', 'Todo mundo virou prioridade'],
         ['equilibrada', 'Equilibrada, mas sem sobra', 'Consigo me organizar'], ['tempo', 'Tenho tempo para me dedicar', 'Posso investir em mim']] },
  { id: 'tempo-dia', tipo: 'uma', titulo: 'Quanto tempo por dia você consegue para você?', sub: 'Até o menor tempo serve para começar.',
    op: [['-20', 'Menos de 20 minutos'], ['20-30', '20 a 30 minutos'], ['30-40', '30 a 40 minutos'], ['40+', 'Mais de 40 minutos']] },
  { id: 'espaco', tipo: 'uma', titulo: 'Onde você vai praticar?', sub: 'Para começar, basta um tapete. Os acessórios são opcionais.',
    op: [['sala', 'Na sala ou no quarto, tenho um cantinho'], ['tapete', 'Já tenho um tapete'], ['pouco', 'Tenho pouco espaço'], ['nao-sei', 'Ainda não sei']] },
  { id: 'fase', tipo: 'uma', titulo: 'Você está em alguma destas fases?', sub: 'O corpo muda em cada fase, e o treino também.',
    op: [['pos-parto', 'Tive bebê nos últimos 2 anos'], ['maes', 'Já sou mãe há mais tempo'], ['menopausa', 'Pré-menopausa ou menopausa'], ['nenhuma', 'Nenhuma delas']] },
  { id: 'altura', tipo: 'numero', titulo: 'Qual é a sua altura?', sub: 'Em centímetros. Usamos só para calcular o seu IMC.', unidade: 'cm', min: 130, max: 200, padrao: 160 },
  { id: 'peso', tipo: 'numero', titulo: 'Qual é o seu peso hoje?', sub: 'Em quilos. Usamos só para calcular o seu IMC.', unidade: 'kg', min: 35, max: 200, padrao: 70 },
  { id: 'peso-meta', tipo: 'numero', titulo: 'E qual peso você gostaria de ter?', sub: 'Em quilos. Não existe resposta certa.', unidade: 'kg', min: 35, max: 200, padrao: r => (Number(r.peso) || 70) - 5 },
  { id: 'insight', tipo: 'insight' },
  { id: 'carregando-1', tipo: 'carregando', titulo: 'Analisando suas respostas…', linhas: ['Juntando suas respostas…', 'Vendo o que o seu corpo está pedindo…', 'Vendo o que mais te faz parar…'] },
  { id: 'recomecos', tipo: 'uma', cols: 2, titulo: 'Quantas vezes você já começou um treino e parou?', sub: 'Seja sincera. Isso mostra o que te faz parar.',
    op: [['1-2', 'Uma ou duas vezes'], ['varias', 'Várias vezes'], ['perdi-conta', 'Já perdi a conta'], ['comecando', 'Ainda vou começar']] },
  { id: 'compromisso', tipo: 'uma', titulo: 'Você consegue reservar 20 minutos, alguns dias por semana, só para você?', sub: 'É o tempo da aula mais curta.',
    op: [['sim', 'Sim, consigo!'], ['ajustes', 'Com alguns ajustes, sim']],
    dica: '✅ As aulas têm de 20 a 40 minutos e ficam com você por 365 dias: dá para encaixar nos dias que der.' },
  { id: 'medo', tipo: 'uma', titulo: 'Qual é o seu maior medo agora?', sub: 'Seus medos são válidos. Vou responder cada um no final.',
    op: [['movimentos', 'Não conseguir fazer os movimentos', 'Nunca fiz ou não tenho flexibilidade'], ['dor', 'Sentir dor ou me machucar'], ['tempo', 'Não ter tempo', 'Minha rotina não deixa espaço'],
         ['dinheiro', 'Gastar e não ter resultado', 'Já investi em coisas que não funcionaram'], ['desistir', 'Desistir de novo', 'Começo e paro']] },
  { id: 'sonho', tipo: 'uma', titulo: 'Daqui a algumas semanas, o que você gostaria de sentir?', sub: 'Feche os olhos por 3 segundos e imagine.',
    op: [['leve', '“Acordo leve, sem o corpo travado”'], ['postura', '“Ando com a postura de quem se cuida”'], ['roupa', '“A roupa veste melhor”'],
         ['diva', '“Voltei a me sentir Diva”'], ['consegui', '“Consegui. Eu sabia que era capaz”']] },
  { id: 'nome', tipo: 'nome', titulo: 'Falta pouco! Qual é o seu primeiro nome?', sub: 'Para o seu plano sair no seu nome.', placeholder: 'Seu primeiro nome',
    privacidade: '🔒 Não pedimos e-mail nem telefone. O nome serve só para personalizar o seu plano.', botao: 'Ver o meu plano' },
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
    comeca: 'Você começa pelos Fundamentos do Pilates Mat (respiração, postura e controle do movimento) e segue para o Pilates Funcional & Mobilidade. Se teve bebê, tem o bônus Pilates no Pós-Parto.',
  },
  'sem-impacto': {
    nome: 'A Diva Sem Impacto',
    retrato: 'Pular, correr e treino puxado não combinam com o seu corpo hoje: dói, incomoda ou você simplesmente não gosta.',
    trava: 'Você não precisa sofrer para cuidar do corpo. O pilates trabalha força, postura e o centro do corpo sem impacto.',
    comeca: 'Você começa pelos Fundamentos do Pilates Mat e pelo Mat Pilates Essencial, sem acessórios e sem impacto, para ganhar força, mobilidade e flexibilidade.',
  },
  'postura': {
    nome: 'A Diva da Postura',
    retrato: 'Costas cansadas, ombros caídos e a sensação de corpo pesado no fim do dia.',
    trava: 'Quando a postura sai do lugar, a barriga aparece mais e o corpo cansa mais. O primeiro passo é devolver o alinhamento.',
    comeca: 'Você começa pelos Fundamentos do Pilates Mat (respiração e postura) e pelos bônus para dor: dor lombar e ciático, hérnia de disco e escoliose.',
  },
  'recomeco': {
    nome: 'A Diva que Recomeça Toda Segunda',
    retrato: 'Você começa com tudo, a semana aperta, um dia sem treino vira “já estraguei” e a segunda-feira vira a data do recomeço.',
    trava: 'O que te tira do caminho não é preguiça, é o “tudo ou nada”. A aula que você faz vale mais que o treino perfeito que você não faz.',
    comeca: 'Você começa pelas Boas-vindas e pelos Fundamentos do Pilates Mat e segue o passo a passo, módulo por módulo, sem se sentir perdida.',
  },
  'iniciante': {
    nome: 'A Diva que Vai Começar Agora',
    retrato: 'Você quer cuidar do corpo em casa, no seu ritmo, sem estúdio e sem pressão.',
    trava: 'Começar sem saber o que fazer é o que faz muita gente desistir. Você precisa de um caminho simples, do básico para frente.',
    comeca: 'Você começa pelas Boas-vindas e pelos Fundamentos do Pilates Mat: respiração, postura, controle do movimento e consciência corporal, mesmo que nunca tenha praticado.',
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
  movimentos: 'o curso começa pelos fundamentos e te guia passo a passo, mesmo que você nunca tenha praticado. Ninguém começa no nível avançado.',
  dor: 'pilates é sem impacto e você recebe de bônus aulas para dor lombar e ciático, hérnia de disco e escoliose. Se você tem dor, hérnia ou teve bebê há pouco tempo, converse com o seu médico antes de começar.',
  tempo: 'aulas de 20 a 40 minutos, em casa, sem deslocamento e sem horário fixo, com 365 dias de acesso para fazer no seu ritmo.',
  dinheiro: 'o curso começa pelos fundamentos e segue passo a passo, do básico para frente, com a Michele, que é especialista em pilates desde 2005. E você tem 7 dias de garantia pela Hotmart: se não fizer sentido para você, pede o reembolso pela própria plataforma, sem precisar explicar.',
  desistir: 'um caminho passo a passo, do básico para frente, para você não se sentir perdida e não precisar recomeçar do zero.',
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
  mostraPct: true,
  sorteio: ['5', '6'], // 13/11 (Patrik: "é um link só dividindo as promessas"): link sem ?p= sorteia 50% capa 5 e 50% capa 6 // 13/11: "% concluído" ao lado da barra (modelo NovaMente)
  // 13/11 (Patrik: "faz o 4 e o 5"): capa com a foto real da Michele, selos e a idade em botões grandes de texto
  // (80% de quem responde tem 45+; as 4 fotos ilustrativas saíram). Desligar: apague capaV2 e tire `texto` de idadeNaCapa.
  capaV2: {
    foto: { src: FOTO + 'michele-pilates-estudio.webp', alt: 'Michele Salla fazendo pilates no estúdio', w: 900, h: 1200 },
    marca: 'Pilates em Casa · com Michele Salla',
    // 13/11 (análise da tela 1): a promessa da capa 5 não muda. Embaixo dela, o público em destaque (modelo Lays: "com exercícios
    // seguros de pilates em casa", em amarelo) e, embaixo da idade, o que ela ganha no final ("diagnóstico grátis" → plano grátis).
    // Os selos saíram para os botões de idade caberem na primeira tela de um celular pequeno (360 × 640).
    faixa: 'Pilates em casa, sem impacto, para mulheres a partir dos 35', // 35: a idade começa em 35 a 44 (e "menos de 35")
    selos: [],
    final: 'No final, você recebe o seu plano grátis. Sem cadastro.',
  },
  assinatura: 'Por Michele Salla, educadora física e especialista em pilates desde 2005',
  logo: { src: FOTO + 'logo-pilates-em-casa.webp', alt: 'Pilates em Casa', style: 'width:170px;border-radius:18px' },
  capa: { src: FOTO + 'michele-pilates-estudio.webp', alt: 'Michele Salla fazendo pilates no estúdio', w: 900, h: 1200 }, // não aparece com idadeNaCapa
  // Capa no padrão dos quizzes de pilates 40+ (Patrik, 06/11): promessa + "escolha a sua idade" com 4 fotos.
  // Fotos ilustrativas geradas no Gravyx (não são a Michele nem alunas): mulheres de corpo comum, em casa, alongamento fácil.
  idadeNaCapa: {
    pergunta: 'Escolha a sua idade:',
    texto: true, tempo: 'Leva cerca de 3 minutos', // botões de texto (13/11); a ordem abaixo põe 45 a 54 primeiro
    op: [['45-54', '45 a 54', 'idade-45-54', 'Mulher de 45 a 54 anos fazendo pilates em casa'], ['55-64', '55 a 64', 'idade-55-64', 'Mulher de 55 a 64 anos fazendo pilates em casa'],
         ['35-44', '35 a 44', 'idade-35-44', 'Mulher de 35 a 44 anos fazendo pilates em casa'], ['65+', '65 ou mais', 'idade-65', 'Mulher de 65 anos ou mais fazendo pilates em casa']]
      .map(([id, rot, n, alt]) => [id, rot, { src: FOTO + n + '.webp', alt, w: 480, h: 643 }]),
    outra: ['-35', 'Tenho menos de 35 anos'],
  },
  bio: [
    'Formada em Educação Física e especialista em Pilates. Desde 2005 eu estudo, ensino e vivo esse método: clássico, contemporâneo, com acessórios, para hérnia de disco, gestantes, pós-parto, terceira idade e dores na coluna.',
    'Comecei com um estúdio pequeno, ao lado do meu marido. Na pandemia, meus alunos não podiam mais ir ao estúdio, e eu transformei tudo o que eu sabia em pilates possível e seguro dentro de casa. Assim nasceu o Pilates em Casa.',
    'Nas próximas perguntas, vou entender o seu corpo e a sua rotina para te mostrar por onde começar.',
  ],
  prova: { titulo: 'Quem já pratica comigo', fotos: [['turma-ao-ar-livre', 'Turma da Michele em aula ao ar livre', 900, 404], ['aula-com-bola', 'Aula de pilates com bola', 900, 1200], ['aula-na-grama', 'Aula de pilates na grama', 900, 1200], ['aula-com-elastico', 'Aula de pilates com elástico', 900, 1200]].map(([n, alt, w, h]) => ({ src: FOTO + n + '.webp', alt, w, h })) },
  insight: {
    ciclo: ['Rotina corrida. Cansaço.', 'Costas pesadas no fim do dia.', 'Treino com impacto que dói ou que você larga.', 'E o corpo vai ficando travado.'],
    destaque: 'Isso não é falta de esforço.',
    texto: 'Com um treino sem impacto, feito em casa e no seu ritmo, você começa a cuidar do que importa: postura, respiração e o centro do corpo trabalhando a seu favor.',
  },
  resultado: {
    mente: 'E cuidar dos pensamentos e hábitos que fazem você desistir de si mesma.',
    diaADia: 'Você não precisa esperar a dor piorar para cuidar do seu corpo. Pode começar hoje, dentro da sua casa, com orientação, método e segurança.',
    botao: 'Ver o meu plano de pilates',
    // 13/11 (Patrik: "faz o 4 e o 5"): resultado com o nome, o IMC e os "dois caminhos" (modelo NovaMente). Desligar: v2: false.
    v2: true,
    imc: {
      textos: {
        abaixo: 'O foco do seu plano é ganhar força, postura e mobilidade, sem impacto e no seu ritmo.',
        normal: 'Bom ponto de partida. O foco é força, postura e o centro do corpo, para você se sentir mais firme e leve.',
        sobrepeso: 'Um treino sem impacto, em casa e no seu ritmo, ajuda você a começar sem sofrer: força, postura e o centro do corpo.',
        obesidade: 'Um treino sem impacto, em casa e no seu ritmo, ajuda você a começar sem sofrer. Se você tem alguma condição de saúde, converse com o seu médico antes de começar.',
      },
      aviso: 'O IMC (peso ÷ altura²) é uma referência geral da OMS. Não é diagnóstico.',
    },
    caminhos: {
      adiar: 'A rotina corrida continua, as costas pesam no fim do dia e o corpo vai ficando mais travado. E a segunda-feira vira, de novo, a data do recomeço.',
      comecar: 'Aulas de 20 a 40 minutos em casa, do básico para frente: postura, respiração e o centro do corpo trabalhando a seu favor, no seu ritmo.',
      eixo: 'Disposição e constância',
      aviso: 'Gráfico ilustrativo de hábito. Não é previsão nem garantia de resultado; os resultados variam de pessoa para pessoa.',
    },
  },
  oferta: {
    produto: 'Pilates em Casa', valor: '37',
    checkout: 'https://pay.hotmart.com/K103974189L?off=6lnthlfw', // Hotmart "PILATES EM CASA - COM MICHELE SALLA", R$ 37 (Patrik, 06/11; antes 1exyl0t5)
    titulo: 'O seu caminho começa no <mark>Pilates em Casa</mark>',
    intro: '24 aulas de 20 a 40 minutos, para fazer em casa, com 365 dias de acesso pela área de membros da Hotmart. Não é só uma sequência de aulas gravadas: é a minha jornada inteira no pilates, organizada para te guiar passo a passo, mesmo que você nunca tenha praticado.',
    modulos: [
      ['Módulo 0 · Boas-vindas e Orientações Iniciais', 'Como o curso funciona e por onde começar.'],
      ['Módulo 1 · Fundamentos do Pilates Mat', 'Respiração, postura, controle do movimento e consciência corporal.'],
      ['Módulo 2 · Mat Pilates Essencial (sem acessórios)', 'Aulas clássicas, inspiradas na essência criada por Joseph Pilates, com o peso do próprio corpo.'],
      ['Módulo 3 · Pilates com Acessórios', 'Bola, flex ring, theraband e overball, no conforto da sua casa.'],
      ['Módulo 4 · Pilates Funcional & Mobilidade', 'Força, mobilidade, flexibilidade, alongamento e condicionamento.'],
    ],
    bonus: ['Pilates no Pós-Parto', 'Pilates para Dor Lombar e Ciático', 'Aula para quem tem Hérnia de Disco', 'Aula para quem tem Escoliose'], // módulos 5 e 6 (Patrik, 06/11)
    fotos: [['aula-em-grupo', 'Aula de pilates em grupo', 900, 675], ['estudio', 'Estúdio da Michele', 900, 1200]].map(([n, alt, w, h]) => ({ src: FOTO + n + '.webp', alt, w, h })),
    parcela: 'pagamento único, pela Hotmart',
    botao: 'Quero começar o meu pilates em casa',
    selos: 'Compra segura pela Hotmart · Garantia de 7 dias · 365 dias de acesso',
    // Página final no modelo do quiz da Laura (Patrik, 06/11: "olha a nossa que vendeu mais de 3 mil"). Só fatos do curso
    // (texto da Michele e do Patrik); as contas por aula e por dia são 37 ÷ 24 e 37 ÷ 365.
    v2: {
      titulo: 'Seu plano de pilates em casa está pronto.',
      marca: 'Comece hoje, no seu ritmo.',
      botao: 'Quero começar hoje',
      sub: 'Com base nas suas respostas, você recebe hoje 24 aulas de pilates de 20 a 40 minutos para fazer em casa, do básico para frente, mesmo que nunca tenha praticado.',
      resumo: [['objetivo', 'Você quer'], ['incomoda', 'O que mais incomoda'], ['impacto', 'Exercício de impacto'], ['tempo-dia', 'Seu tempo por dia', 'As aulas têm de 20 a 40 minutos.']],
      caminho: [['Passo 1', 'Fundamentos'], ['Passo 2', 'Mat Essencial'], ['Passo 3', 'Acessórios'], ['Passo 4', 'Funcional']],
      antesDepois: { titulo: 'O que muda na sua rotina', itens: [
        ['Treino de impacto que dói ou que você larga', 'Pilates sem impacto, no seu ritmo'],
        ['Não sabe por onde começar nem se está fazendo certo', 'Um passo a passo do básico para frente, com a Michele'],
        ['Estúdio longe, horário fixo, deslocamento', 'Em casa, na hora que der, só com um tapete'],
        ['Treino longo que não cabe no dia', 'Aulas de 20 a 40 minutos'],
        ['Costas pesadas e corpo travado no fim do dia', 'Aulas de postura e mobilidade, e bônus para dor lombar e ciático'],
      ] },
      porque: { titulo: 'Por que começar pelo pilates em casa', itens: [
        'Pilates trabalha força, postura e o centro do corpo <b>sem impacto</b>.',
        'Você faz <b>em casa</b>, sem deslocamento e sem horário fixo.',
        'Começa pelos <b>fundamentos</b>: respiração, postura e controle do movimento. Ninguém começa no nível avançado.',
      ] },
      card: {
        selo: 'Comece hoje · acesso pela Hotmart', nome: 'Pilates em Casa',
        sub: '24 aulas de pilates para fazer em casa, do básico para frente, com a Michele Salla.',
        vez: 'pagamento único',
        ancora: ['Menos de R$ 1,55 por aula (são 24 aulas).', 'Cerca de R$ 0,10 por dia nos 365 dias de acesso.'],
        itens: [
          '<b>24 aulas</b> de 20 a 40 minutos, para fazer em casa',
          '<b>Fundamentos do Pilates Mat</b>: respiração, postura e controle do movimento',
          '<b>Mat Pilates Essencial</b>, sem acessórios',
          '<b>Pilates com Acessórios</b>: bola, flex ring, theraband e overball (opcionais)',
          '<b>Pilates Funcional & Mobilidade</b>',
          'Bônus: <b>Pilates no Pós-Parto</b>, <b>Dor Lombar e Ciático</b>, <b>Hérnia de Disco</b> e <b>Escoliose</b>',
          '<b>365 dias de acesso</b> pela área de membros da Hotmart',
        ],
        risco: 'você tem 7 dias de garantia pela Hotmart. Se não fizer sentido para você, pede o reembolso de R$ 37 pela própria plataforma.',
      },
      passos: { titulo: 'Por onde você caminha', itens: [
        ['Fundamentos do Pilates Mat', 'Respiração, postura, controle do movimento e consciência corporal.'],
        ['Mat Pilates Essencial', 'Aulas clássicas com o peso do próprio corpo, sem acessórios.'],
        ['Pilates com Acessórios', 'Bola, flex ring, theraband e overball, no conforto da sua casa.'],
        ['Pilates Funcional & Mobilidade', 'Força, mobilidade, flexibilidade, alongamento e condicionamento.'],
      ] },
      quem: { nome: 'Michele Salla', texto: 'Educadora física e especialista em pilates desde 2005. Na pandemia, transformou o que ensinava no estúdio em pilates possível e seguro dentro de casa. Assim nasceu o Pilates em Casa.' },
      garantia: { titulo: 'Garantia de 7 dias', texto: 'Comece hoje. Se em 7 dias você sentir que não é para você, pede o reembolso pela própria Hotmart, sem precisar explicar.' },
      faq: [
        ['Nunca fiz pilates. Consigo acompanhar?', 'Sim. O curso começa pelos fundamentos e te guia passo a passo. Ninguém começa no nível avançado.'],
        ['Preciso de aparelho ou equipamento?', 'Para começar, basta um tapete. Bola, flex ring, theraband e overball são opcionais.'],
        ['Tenho mais de 50. Serve para mim?', 'Sim. O pilates é sem impacto e você faz no seu ritmo, do básico para frente.'],
        ['Tenho dor nas costas ou hérnia. Posso fazer?', 'Você recebe de bônus aulas para dor lombar e ciático, hérnia de disco e escoliose. Se tem dor, hérnia ou teve bebê há pouco tempo, converse com o seu médico antes de começar.'],
        ['Quanto tempo dura cada aula?', 'De 20 a 40 minutos.'],
        ['Como eu acesso?', 'Pela área de membros da Hotmart, no celular ou no computador, com 365 dias de acesso.'],
        ['É mensalidade?', 'Não. É pagamento único de R$ 37, pela Hotmart.'],
        ['Como funciona a garantia?', 'Você tem 7 dias. Se não fizer sentido para você, pede o reembolso pela própria Hotmart.'],
      ],
    },
    // 13/11 (Patrik: "quero a nossa tela final parecida com a dela, mas tem que fazer sentido no quiz"): página final no modelo da
    // Lays Trancoso. Mesmo preço (R$ 37) e mesmo link da Hotmart; sem desconto nem âncora até o Patrik escolher. Desligar: v3: null.
    v3: {
      selo: 'Comece hoje · acesso imediato',
      precoSub: '24 aulas · 365 dias',
      precoVez: 'à vista · pagamento único',
      garantiaCurta: 'Garantia de 7 dias: se não for pra você, pede o reembolso pela própria Hotmart.',
      titulo: 'Pilates em casa, <b>sem impacto</b>, para cuidar das dores e fortalecer o corpo',
      sub: '24 aulas de 20 a 40 minutos, do básico para frente, com a Michele Salla, educadora física e especialista em pilates desde 2005.',
      foto: { src: FOTO + 'michele-pilates-estudio.webp', alt: 'Michele Salla fazendo pilates no estúdio', w: 900, h: 1200 },
      // 13/11 (Patrik: "ajusta também os antes e depois", pasta "Antes e depois" da Michele no Drive): só fotos sem rosto, nome,
      // telefone ou número de quilos. São de alunas do Desafio 7 em 7 da Michele (os prints falam do Desafio), e a legenda diz isso.
      heroAD: { src: FOTO + 'ad-1.webp', alt: 'Antes e depois de aluna da Michele', w: 682, h: 900 },
      adTitulo: 'Resultados de alunas da Michele',
      adLegenda: 'Alunas do Desafio 7 em 7 da Michele. Os resultados variam de pessoa para pessoa.',
      antesDepois: [
        { src: FOTO + 'ad-2.webp', alt: 'Antes e depois de aluna da Michele', w: 715, h: 900 },
        { src: FOTO + 'ad-3.webp', alt: 'Antes e depois de aluna da Michele', w: 720, h: 720 },
        { src: FOTO + 'ad-4.webp', alt: 'Antes e depois de aluna da Michele', w: 900, h: 764 },
      ],
      feitoTitulo: 'Feito a partir do que você respondeu',
      feito: {
        dor: 'Você sente <b>dor ou cansaço nas costas</b> ou com impacto: tem aulas de postura e mobilidade e bônus para <b>dor lombar e ciático</b>.',
        fase: 'Você marcou <b>menopausa ou pós-parto</b>: o pilates trabalha o centro do corpo sem impacto, e tem o bônus <b>Pilates no Pós-Parto</b>.',
        iniciante: 'Você <b>nunca fez</b> ou não sabe se fez certo: o curso começa pelos <b>Fundamentos</b>, passo a passo.',
        perfil: '', // o texto do perfil já aparece inteiro na tela anterior (resultado): aqui fica só o nome do perfil
      },
      depoTitulo: 'O que as alunas dizem',
      depoimentos: [], // (ESCREVER AQUI: 3 a 5 depoimentos reais de alunas do pilates, com idade e a dor que melhorou; a Michele manda)
      recebeTitulo: 'Veja tudo que você vai receber',
      // 13/11 (Patrik: "essas imagens tão ruins, crie uma melhor com gravyx"): notebook, tablet e celular gerados no Gravyx com as
      // telas em verde e, dentro delas, fotos reais das aulas da Michele (montagem: scratchpad ad/scripts/mockup.py).
      mockupImg: { src: FOTO + 'mockup-aulas.webp', alt: 'As aulas do Pilates em Casa no notebook, no tablet e no celular', w: 900, h: 361 },
      mockup: [{ src: FOTO + 'aula-em-grupo.webp', alt: 'Aula de pilates', w: 900, h: 675 }, { src: FOTO + 'aula-com-elastico.webp', alt: 'Aula de pilates com elástico', w: 900, h: 1200 }],
      recebe: [
        '<b>24 aulas</b> de 20 a 40 minutos para fazer em casa, só com um tapete',
        '<b>Do básico para frente</b>: Fundamentos, Mat Essencial, Acessórios e Funcional & Mobilidade',
        '<b>Bônus</b> para dor lombar e ciático, hérnia de disco, escoliose e pós-parto',
        '<b>365 dias de acesso</b> pelo celular, tablet ou computador, na área de membros da Hotmart',
      ],
      praQuem: {
        titulo: 'O Pilates em Casa é pra quem…',
        // 13/11 (Patrik: "uma imagem assim, batendo nas ruminações e nas dores", modelo Lays): mulher ilustrativa gerada no Gravyx
        // (não é aluna) e balões com as dores e ruminações mais marcadas no quiz; o que ela marcou fica em destaque.
        figura: {
          img: { src: FOTO + 'mulher-baloes.webp', alt: 'Mulher de uns 55 anos, de frente, com balões de pensamento', w: 700, h: 938 },
          baloes: [['costas', 'Minhas costas pesam no fim do dia'], ['recomeco', 'Começo e paro de novo'],
            ['impactoDor', 'O joelho dói quando pulo ou corro'], ['todos', 'Cuido de todo mundo, menos de mim'],
            ['barriga', 'Quero diminuir a barriga'], ['movimentos', 'Tenho medo de não conseguir fazer os movimentos']],
        },
        itens: [['costas', 'Sente dor ou cansaço nas costas'], ['impactoDor', 'Sente dor no joelho ou nas costas quando pula ou corre'],
          ['rigidez', 'Sente o corpo travado, com pouca flexibilidade'], ['barriga', 'Quer trabalhar a barriga e a flacidez'],
          ['postura', 'Quer melhorar a postura e tirar o peso do fim do dia'], ['fase', 'Está na pré-menopausa, na menopausa ou no pós-parto'],
          ['escapes', 'Tem escapes de xixi quando pula'], ['iniciante', 'Nunca fez pilates ou não sabe se faz certo']],
        nota: 'Tem hérnia de disco ou escoliose? Há aulas específicas de bônus. Se tiver dor forte ou alguma condição de saúde, converse com o seu médico antes de começar.',
      },
      professora: {
        titulo: 'Conheça a sua professora',
        foto: { src: IMG + 'michele-recorte.webp', alt: 'Michele Salla', w: 802, h: 1292 },
        textos: [
          'Eu sou a <b>Michele Salla</b>, formada em Educação Física e especialista em pilates <b>desde 2005</b>: clássico, contemporâneo, com acessórios, para hérnia de disco, gestantes, pós-parto, terceira idade e dores na coluna.',
          'Comecei com um estúdio pequeno, ao lado do meu marido. Na pandemia, transformei tudo o que eu sabia em <b>pilates possível e seguro dentro de casa</b>. Assim nasceu o Pilates em Casa.',
        ],
      },
      faq: [0, 3, 5, 6], // índices de v2.faq: nunca fiz, dor/hérnia, como acesso, é mensalidade
    },
    rodape: 'O Pilates em Casa não substitui avaliação médica ou fisioterapêutica. Se você tem dor, hérnia, teve bebê há pouco tempo ou tem outra condição de saúde, converse com o seu médico antes de começar. Os resultados variam de pessoa para pessoa. Este site não é afiliado ao Facebook.',
  },
}
