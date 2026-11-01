/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  optimizeFonts: false,
  experimental: {
    // trang đọc bài viết Markdown trong content/ lúc chạy (trang chủ làm mới mỗi 30 phút) → kèm thư mục này vào bản triển khai
    outputFileTracingIncludes: { "/": ["./content/**/*"], "/than-so-hoc/[slug]": ["./content/**/*"], "/sitemap.xml": ["./content/**/*"] },
  },
};
export default nextConfig;
