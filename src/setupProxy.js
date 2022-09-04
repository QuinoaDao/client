const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://pro-api.coinmarketcap.com',
      pathRewrite: {
        '^/api': '/',
      },
      changeOrigin: true,
    })
  );

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/build/index.html'));
  });
};