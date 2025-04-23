// a perfectly fine, non‐cryptographic ID generator
export function generateId(): string {
    // 9 chars from Math.random() → plenty unique for in-app quick-logs
    return Math.random().toString(36).substr(2, 9)
  }