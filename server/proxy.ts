import type { Express, Request, Response } from 'express';

export function setupApiProxy(app: Express) {
  // API routes prefix
  const API_PREFIX = "/api/v1";
  const API_BASE_URL = "http://158.160.86.244:50000";
  
  console.log(`Setting up API proxy for ${API_PREFIX} -> ${API_BASE_URL}${API_PREFIX}`);
  
  // Прямой обработчик для тестирования доступности API
  app.get(`${API_PREFIX}/test`, async (req, res) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/partners/`);
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
  
  // Обработка CORS preflight запросов
  app.options(`${API_PREFIX}/*`, (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.sendStatus(200);
  });
  
  // Обработка ошибок прокси-запросов
  app.use((err: any, req: Request, res: Response, next: any) => {
    if (err && err.code === 'ECONNRESET') {
      console.error('Connection reset by server for request', req.url);
      return res.status(504).json({ message: 'Gateway timeout', details: 'Connection reset by server' });
    }
    next(err);
  });
  
  // Простое перенаправление запросов вместо прокси
  app.use(`${API_PREFIX}`, async (req, res) => {
    const url = `${API_BASE_URL}${req.originalUrl}`;
    console.log(`Requesting ${url}`);
    
    try {
      const options: RequestInit = {
        method: req.method,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      };
      
      // Добавляем тело запроса для методов которые его поддерживают
      if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
        options.body = JSON.stringify(req.body);
      }
      
      // Выполняем запрос
      const response = await fetch(url, options);
      
      // Получаем тело ответа
      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        responseData = { message: 'Empty response from API' };
      }
      
      // Устанавливаем статус ответа
      res.status(response.status);
      
      // Добавляем CORS заголовки
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      
      // Отправляем данные
      res.json(responseData);
      
      // Логируем статус запроса
      if (response.ok) {
        console.log(`Successfully received data from API for ${req.originalUrl}`);
      } else {
        console.warn(`Error response from API: ${response.status} for ${req.originalUrl}`);
      }
    } catch (error) {
      // Обработка ошибок
      console.error(`Proxy error for ${req.originalUrl}:`, error);
      res.status(500).json({ 
        message: 'API request failed', 
        error: error instanceof Error ? error.message : 'Unknown error',
        url: req.originalUrl,
        method: req.method
      });
    }
  });
}