import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupApiProxy } from "./proxy";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Настраиваем прокси для внешнего API сначала, чтобы перехватывать запросы к внешнему API
  setupApiProxy(app);
  
  // Затем настраиваем стандартные маршруты приложения
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Try to serve the app on port 5000 first, but fall back to other ports if needed
  // this serves both the API and the client
  let port = 5000;
  const tryListen = (retryCount = 0) => {
    const maxRetries = 10;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${port}`);
    }).on('error', (err: any) => {
      if (err.code === 'EADDRINUSE' && retryCount < maxRetries) {
        log(`Port ${port} is in use, trying another port...`);
        port = 3000 + Math.floor(Math.random() * 2000); // Try a random port between 3000-5000
        tryListen(retryCount + 1);
      } else {
        log(`Failed to start server: ${err.message}`);
        process.exit(1);
      }
    });
  };
  
  tryListen();
})();
