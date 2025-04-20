// src/types/global.d.ts

export {};

declare global {
  interface GlobalThis {
    expo?: {
      uuidv4?: () => string;
      uuidv5?: (name: string, namespace: string) => string;
    };

    // Add missing Expo native internals for testing compatibility
    RN$Bridgeless?: boolean;
    nativeModuleProxy?: Record<string, unknown>;
    __turboModuleProxy?: (moduleName: string) => unknown;
  }
}