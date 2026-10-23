import { test } from 'node:test'
import assert from 'node:assert/strict'
import { gerarHashSenha, conferirSenha, problemaSenha, novoToken, hashToken, assinarSessao, lerSessao, emailValido, normEmail } from '../lib/senhas.ts'

test('senha: guarda só o hash e confere', () => {
  const h = gerarHashSenha('minha senha boa')
  assert.ok(h.startsWith('scrypt$') && !h.includes('minha'))
  assert.equal(conferirSenha('minha senha boa', h), true)
  assert.equal(conferirSenha('minha senha errada', h), false)
  assert.notEqual(gerarHashSenha('minha senha boa'), h) // sal diferente
  assert.equal(conferirSenha('x', null), false)
  assert.equal(conferirSenha('x', 'lixo'), false)
})

test('senha nova: tamanho e repetição', () => {
  assert.match(problemaSenha('curta'), /8 caracteres/)
  assert.match(problemaSenha('senhalonga1', 'senhalonga2'), /iguais/)
  assert.equal(problemaSenha('senhalonga1', 'senhalonga1'), null)
})

test('convite: token vai no link, banco guarda só o hash', () => {
  const { token, hash } = novoToken()
  assert.ok(token.length >= 30)
  assert.equal(hash, hashToken(token))
  assert.notEqual(novoToken().token, token)
})

test('sessão assinada: vale, vence e não aceita falsificação', () => {
  const agora = Date.now()
  const c = assinarSessao('Michele@Exemplo.com', agora + 1000, 'chave')
  assert.equal(lerSessao(c, 'chave', agora), 'michele@exemplo.com')
  assert.equal(lerSessao(c, 'outra', agora), null)
  assert.equal(lerSessao(c, 'chave', agora + 2000), null)
  const [e, exp, ass] = c.split('.')
  const outro = Buffer.from('patrik@x.com').toString('base64url')
  assert.equal(lerSessao(`${outro}.${exp}.${ass}`, 'chave', agora), null)
  assert.equal(lerSessao(`${e}.${Number(exp) + 99999}.${ass}`, 'chave', agora), null)
  assert.equal(lerSessao('', 'chave', agora), null)
})

test('e-mail', () => {
  assert.equal(normEmail('  A@B.COM '), 'a@b.com')
  assert.equal(emailValido('michele@gmail.com'), true)
  assert.equal(emailValido('michele@gmail'), false)
  assert.equal(emailValido('sem arroba'), false)
})
