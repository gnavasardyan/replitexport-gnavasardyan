import { createProxyMiddleware } from 'http-proxy-middleware';
import type { Express, Request, Response } from 'express';
import type { IncomingMessage, ServerResponse } from 'http';

export function setupApiProxy(app: Express) {
  // API routes prefix
  const API_PREFIX = "/api/v1";
  
  console.log(`Setting up API proxy for ${API_PREFIX} -> http://158.160.86.244:50000${API_PREFIX}`);
  
  // Настройка прокси для внешнего API с дополнительным логированием
  const apiProxy = createProxyMiddleware({
    target: 'http://158.160.86.244:50000',
    changeOrigin: true,
    // Не переписываем путь, он должен быть одинаковым
    // pathRewrite: {
    //   [`^${API_PREFIX}`]: '/api/v1', 
    // },
    logLevel: 'debug',
    
    // Расширенные обработчики с логированием
    onProxyReq: function(proxyReq: any, req: IncomingMessage) {
      console.log(`Proxying request to: ${req.method} ${req.url}`);
      
      // Добавляем заголовки для совместимости, если необходимо
      proxyReq.setHeader('Accept', 'application/json');
    },
    
    onProxyRes: function(proxyRes: any, req: IncomingMessage) {
      console.log(`Proxied response from: ${(req as any).method} ${(req as any).url} - Status: ${proxyRes.statusCode}`);
      
      // Добавляем CORS заголовки
      proxyRes.headers['access-control-allow-origin'] = '*';
      proxyRes.headers['access-control-allow-methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
      proxyRes.headers['access-control-allow-headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization';
    },
    
    onError: function(err: Error, req: Request, res: Response) {
      console.error(`Proxy error on ${req.method} ${req.url}:`, err);
      res.status(500).json({ message: 'Proxy error', error: err.message });
    },
  });

  // Добавляем обработчик для CORS preflight запросов
  app.options(`${API_PREFIX}/*`, (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.sendStatus(200);
  });

  // Применяем прокси ко всем маршрутам API
  app.use(`${API_PREFIX}`, apiProxy);
}