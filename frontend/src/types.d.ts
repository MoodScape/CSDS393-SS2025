
declare module 'react' {
  export interface FunctionComponent<P = {}> {
    (props: P): ReactElement | null;
  }
  
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  
  export interface ReactElement {
    type: any;
    props: any;
    key: string | null;
  }
}

declare module 'axios' {
  export interface AxiosResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
    config: any;
  }

  export interface AxiosError<T = any> extends Error {
    config: any;
    code?: string;
    request?: any;
    response?: AxiosResponse<T>;
    isAxiosError: boolean;
  }

  export interface AxiosInstance {
    post<T = any, R = AxiosResponse<T>>(url: string, data?: any, config?: any): Promise<R>;
  }

  export function isAxiosError(payload: any): payload is AxiosError;

  const axios: AxiosInstance;
  export default axios;
}

// JSX支持
declare namespace JSX {
  interface IntrinsicElements {
    div: any;
    h2: any;
    form: any;
    label: any;
    input: any;
    select: any;
    option: any;
    button: any;
  }
} 