/// <reference types="vite/client" />

interface ImportMeta {
  readonly glob: (
    pattern: string,
    options?: {
      eager?: boolean;
      as?: 'url' | 'raw' | 'string';
      import?: string;
    }
  ) => Record<string, any>;
}






