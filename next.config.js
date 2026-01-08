/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! 警告 !!
    // 這會允許生產環境建置成功，即使你的專案有 TypeScript 錯誤。
    ignoreBuildErrors: true,
  },
  eslint: {
    // 同理，也忽略 ESLint 的錯誤
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
