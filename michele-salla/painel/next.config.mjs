/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  async redirects() {
    return [{ source: '/', destination: '/painel', permanent: false }]
  },
  async headers() {
    // O rastreio da página do cliente é carregado de outro domínio (o site de vendas).
    return [{ source: '/rastreio.js', headers: [{ key: 'Cache-Control', value: 'public, max-age=300' }, { key: 'Access-Control-Allow-Origin', value: '*' }] }]
  },
}
export default nextConfig
