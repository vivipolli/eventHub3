/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Adicione esta configuração para ignorar erros de hidratação durante o desenvolvimento
  compiler: {
    // Suprimir avisos de hidratação em desenvolvimento
    ...(process.env.NODE_ENV === 'development' && {
      reactRemoveProperties: { properties: ['^data-gr-.*$'] },
    }),
  },
  // Configuração para variáveis de ambiente
  env: {
    // Você pode adicionar variáveis de ambiente públicas aqui se necessário
  },
}

export default nextConfig
