// Robô do Claude: junta no Google Drive os arquivos grandes que o Claude envia em pedaços.
// Instalar uma vez: cole este código no script.google.com, salve e rode a função "instalar".
// Pasta de entrada (o Claude põe os pedaços aqui): "Claude – envios em partes (não mexer)".
const ENTRADA = '1F0YGPhL_60IsLjE60nbxQgO3Tb6OSt0a';
const TIPOS = {mp4: 'video/mp4', mov: 'video/quicktime', zip: 'application/zip', pdf: 'application/pdf',
  png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp', mp3: 'audio/mpeg', wav: 'audio/wav', md: 'text/markdown', txt: 'text/plain'};

function instalar() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('juntarPartes').timeBased().everyMinutes(5).create();
  juntarPartes();
}

function juntarPartes() {
  const trava = LockService.getScriptLock();
  if (!trava.tryLock(1000)) return;
  try {
    const inicio = Date.now(), grupos = {};
    const arquivos = DriveApp.getFolderById(ENTRADA).getFiles();
    while (arquivos.hasNext()) {
      const f = arquivos.next();
      const m = f.getName().match(/^(.+?)~~(.+)~~(\d+)~~(\d+)\.bin$/);   // PASTA~~NOME~~001~~009.bin
      if (!m) continue;
      const k = m[1] + '~~' + m[2];
      (grupos[k] = grupos[k] || {pasta: m[1], nome: m[2], total: +m[4], partes: {}}).partes[+m[3]] = f;
    }
    const lista = Object.values(grupos);
    if (lista.length) registrar('Rodou: ' + lista.length + ' arquivo(s) em pedaços na fila.');
    for (const g of lista) {
      if (Date.now() - inicio > 4 * 60 * 1000) break;                 // o resto fica para a próxima rodada
      const n = Object.keys(g.partes).length;
      if (n < g.total) { registrar(g.nome + ': esperando pedaços (' + n + ' de ' + g.total + ').'); continue; }
      try { enviar(g); registrar(g.nome + ': PRONTO na pasta ' + g.pasta + '.'); }
      catch (e) { registrar(g.nome + ': ERRO ' + e.message); }
    }
  } finally { trava.releaseLock(); }
}

function registrar(msg) {                                             // o Claude lê este arquivo pelo Drive
  const pasta = DriveApp.getFolderById(ENTRADA), linha = new Date().toISOString() + '  ' + msg + '\n';
  const it = pasta.getFilesByName('_robo_log.txt');
  if (it.hasNext()) { const f = it.next(); f.setContent((linha + f.getBlob().getDataAsString()).slice(0, 20000)); }
  else pasta.createFile('_robo_log.txt', linha, MimeType.PLAIN_TEXT);
}

function enviar(g) {
  const tipo = TIPOS[g.nome.split('.').pop().toLowerCase()] || 'application/octet-stream';
  const partes = [];
  let tamanho = 0;
  for (let i = 1; i <= g.total; i++) { partes.push(g.partes[i]); tamanho += g.partes[i].getSize(); }
  const destino = DriveApp.getFolderById(g.pasta);
  const iguais = destino.getFilesByName(g.nome);
  while (iguais.hasNext()) {                                          // já existe igual: só limpa os pedaços
    const x = iguais.next();
    if (x.getSize() === tamanho) { partes.forEach(p => p.setTrashed(true)); return; }
    x.setTrashed(true);                                               // versão antiga diferente vai para a lixeira
  }
  const token = ScriptApp.getOAuthToken();
  const ini = UrlFetchApp.fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable', {
    method: 'post', contentType: 'application/json; charset=UTF-8', muteHttpExceptions: true, followRedirects: false,
    headers: {Authorization: 'Bearer ' + token, 'X-Upload-Content-Type': tipo, 'X-Upload-Content-Length': String(tamanho)},
    payload: JSON.stringify({name: g.nome, parents: [g.pasta]})});
  if (ini.getResponseCode() !== 200) throw new Error('Início do envio falhou: ' + ini.getContentText());
  const h = ini.getHeaders(), url = h['Location'] || h['location'];
  let pos = 0;
  for (const p of partes) {
    const bytes = p.getBlob().getBytes(), fim = pos + bytes.length - 1;
    const r = UrlFetchApp.fetch(url, {method: 'put', contentType: tipo, payload: bytes, muteHttpExceptions: true, followRedirects: false,
      headers: {Authorization: 'Bearer ' + token, 'Content-Range': 'bytes ' + pos + '-' + fim + '/' + tamanho}});
    const c = r.getResponseCode();
    if (c !== 308 && c !== 200 && c !== 201) throw new Error('Pedaço ' + (partes.indexOf(p) + 1) + ' falhou: ' + c + ' ' + r.getContentText());
    pos = fim + 1;
  }
  partes.forEach(p => p.setTrashed(true));
}
