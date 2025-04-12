// src/types/global.d.ts
declare global {
    interface GlobalThis {
      expo?: {
        uuidv4?: () => string;
        uuidv5?: (name: string, namespace: string) => string;
      };
    }
  }
  
  export {};