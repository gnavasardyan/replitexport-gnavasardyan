import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorText = '';
    try {
      // Пытаемся прочитать ответ как JSON
      const errorJson = await res.json();
      errorText = errorJson.message || errorJson.error || JSON.stringify(errorJson);
    } catch (e) {
      // Если не получается прочитать как JSON, читаем как текст
      try {
        errorText = await res.text() || res.statusText;
      } catch (e2) {
        errorText = res.statusText;
      }
    }
    
    console.error(`API Error: ${res.status} - ${errorText}`);
    throw new Error(`${res.status}: ${errorText}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Базовые заголовки
  const headers: Record<string, string> = {
    "Accept": "application/json",
  };
  
  // Добавляем Content-Type для запросов с данными
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  // Добавление авторизационного токена, если он есть
  // const token = localStorage.getItem('auth_token');
  // if (token) {
  //   headers['Authorization'] = `Bearer ${token}`;
  // }
  
  // Отправка запроса
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  // Проверка и обработка ошибок
  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Базовые заголовки для запроса
    const headers: Record<string, string> = {
      "Accept": "application/json",
    };
    
    // Добавление авторизационного токена, если он есть
    // const token = localStorage.getItem('auth_token');
    // if (token) {
    //   headers['Authorization'] = `Bearer ${token}`;
    // }

    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      headers
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      // Добавляем повторные попытки для запросов
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
      // Включаем кэширование на стороне клиента для повышения производительности
      // и чтобы показывать данные из кэша, если сервер недоступен
      cacheTime: 1000 * 60 * 30, // 30 минут кэширования
    },
    mutations: {
      retry: 1, // Одна повторная попытка для мутаций
    },
  },
});
