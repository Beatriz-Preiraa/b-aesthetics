/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Permite otimização de imagens de qualquer host externo (logos via URL legada)
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
    // Imagens locais em /public/uploads são servidas diretamente, sem necessidade de config extra
  },
  experimental: {
    serverActions: { bodySizeLimit: '5mb' },
  },
}

module.exports = nextConfig
