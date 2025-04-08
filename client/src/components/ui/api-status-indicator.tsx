import React, { useState, useEffect } from 'react';
import { WifiOff, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

type ApiStatus = 'checking' | 'online' | 'offline' | 'error';

export function ApiStatusIndicator() {
  const [status, setStatus] = useState<ApiStatus>('checking');
  const [error, setError] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState<boolean>(false);

  // Функция для проверки статуса API
  const checkApiStatus = async () => {
    try {
      setStatus('checking');
      
      // Создаем контроллер с таймаутом для прерывания запроса
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        const response = await fetch('/api/v1/partners/', {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          setStatus('online');
          setError(null);
        } else {
          setStatus('error');
          setError(`Ошибка запроса: ${response.status} - ${response.statusText}`);
          setShowAlert(true);
        }
      } catch (fetchError) {
        setStatus('offline');
        const errorMessage = fetchError instanceof Error 
          ? fetchError.message 
          : 'Неизвестная ошибка соединения';
        setError(errorMessage);
        setShowAlert(true);
      }
    } catch (error) {
      setStatus('error');
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Неизвестная ошибка';
      setError(errorMessage);
      setShowAlert(true);
    }
  };

  // Проверяем статус при загрузке компонента
  useEffect(() => {
    checkApiStatus();
    
    // Планируем периодическую проверку статуса
    const interval = setInterval(checkApiStatus, 60000); // каждую минуту
    
    return () => clearInterval(interval);
  }, []);

  // Если нет проблем - ничего не показываем
  if (status === 'online' || status === 'checking' || !showAlert) {
    return null;
  }

  return (
    <Alert 
      variant="destructive" 
      className="fixed bottom-4 right-4 max-w-md z-50 shadow-lg transition-all duration-300"
    >
      <div className="flex items-center">
        {status === 'offline' ? (
          <WifiOff className="h-5 w-5 mr-2" />
        ) : (
          <AlertCircle className="h-5 w-5 mr-2" />
        )}
        <AlertTitle>
          {status === 'offline' ? 'Нет соединения с сервером' : 'Ошибка сервера'}
        </AlertTitle>
      </div>
      <AlertDescription className="mt-2">
        {error || 'Произошла ошибка при обращении к API. Некоторые функции могут быть недоступны.'}
        <div className="mt-2 flex gap-2">
          <Button variant="outline" size="sm" onClick={checkApiStatus}>
            Проверить соединение
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowAlert(false)}>
            Скрыть
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}