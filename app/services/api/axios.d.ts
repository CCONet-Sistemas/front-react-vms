import 'axios';

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    /** Quando true, o interceptor não exibe toast de erro automaticamente */
    _silentError?: boolean;
  }
}
