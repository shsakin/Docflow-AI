/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Handle PDF.js worker on server side
      config.resolve.alias = {
        ...config.resolve.alias,
        'pdfjs-dist/legacy/build/pdf.worker.mjs': false,
      };
    } else {
      // Handle PDF.js worker on client side
      config.resolve.alias = {
        ...config.resolve.alias,
        'pdfjs-dist/legacy/build/pdf.worker.mjs': 'pdfjs-dist/legacy/build/pdf.worker.min.js',
      };
    }
    return config;
  },
};
// export default nextConfig;
module.exports = nextConfig;
