import { createProxyMiddleware } from 'http-proxy-middleware';
import type { Express, Request, Response } from 'express';
import type { IncomingMessage, ServerResponse } from 'http';

export function setupApiProxy(app: Express) {
  // API routes prefix
  const API_PREFIX = "/api/v1";
  
  console.log(`Setting up API proxy for ${API_PREFIX} -> http://158.160.86.244:50000${API_PREFIX}`);
  
  // Настройка прокси для внешнего API с дополнительным логированием
  // @ts-ignore - игнорируем ошибки типов в http-proxy-middleware, библиотека и TypeScript имеют несовпадения
  const apiProxy = createProxyMiddleware({
    target: 'http://158.160.86.244:50000',
    changeOrigin: true,
    // Настройка прокси
    onProxyReq: function(proxyReq: any, req: IncomingMessage) {
      const originalPath = (req as any).originalUrl;
      console.log(`Proxying request to: ${req.method} ${originalPath} -> ${proxyReq.path}`);
      
      // Добавляем заголовки для совместимости
      proxyReq.setHeader('Accept', 'application/json');
      
      // Исправляем путь если необходимо сохранить слэш в конце
      if (originalPath.endsWith('/') && !proxyReq.path.endsWith('/')) {
        proxyReq.path = proxyReq.path + '/';
        console.log(`Fixed path to: ${proxyReq.path}`);
      }
    },
    
    onProxyRes: function(proxyRes: any, req: IncomingMessage) {
      console.log(`Proxied response from: ${(req as any).method} ${(req as any).url} - Status: ${proxyRes.statusCode}`);
      
      // Если получен ответ с данными, логируем это
      if (proxyRes.statusCode === 200) {
        console.log(`Successfully received data from API`);
      } else {
        console.warn(`Error response from API: ${proxyRes.statusCode}`);
      }
      
      // Добавляем CORS заголовки
      proxyRes.headers['access-control-allow-origin'] = '*';
      proxyRes.headers['access-control-allow-methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
      proxyRes.headers['access-control-allow-headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization';
    },
    
    onError: function(err: Error, req: Request, res: Response) {
      console.error(`Proxy error on ${req.method} ${req.url}:`, err);
      // Отправляем более подробную информацию об ошибке для отладки
      const errorDetail = err.stack || err.message || 'Unknown proxy error';
      console.error('Detailed error:', errorDetail);
      
      res.status(500).json({ 
        message: 'Proxy error', 
        error: err.message,
        url: req.url,
        method: req.method
      });
    }
  });

  // Добавляем обработчик для CORS preflight запросов
  app.options(`${API_PREFIX}/*`, (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.sendStatus(200);
  });

  // Прямой обработчик для тестирования доступности API
  app.get(`${API_PREFIX}/test`, async (req, res) => {
    try {
      const response = await fetch('http://158.160.86.244:50000/api/v1/partners/');
      if (response.ok) {
        const data = await response.json();
        res.json({ status: 'API доступен', data });
      } else {
        res.status(response.status).json({ 
          status: 'API недоступен', 
          error: `Статус: ${response.status} - ${response.statusText}` 
        });
      }
    } catch (error) {
      res.status(500).json({ 
        status: 'Ошибка соединения с API', 
        error: error instanceof Error ? error.message : 'Неизвестная ошибка' 
      });
    }
  });

  // Применяем прокси ко всем маршрутам API
  // Обработка ошибок прокси-запросов
  app.use((err: any, req: Request, res: Response, next: any) => {
    if (err && err.code === 'ECONNRESET') {
      console.error('Connection reset by server for request', req.url);
      return res.status(504).json({ message: 'Gateway timeout', details: 'Connection reset by server' });
    }
    next(err);
  });

  // Применяем прокси ко всем маршрутам API
  app.use(`${API_PREFIX}`, apiProxy);
}