declare module 'passport-jwt' {
  // Minimal ambient declarations to satisfy TypeScript
  export const ExtractJwt: any
  export class Strategy {
    constructor(options?: any, verify?: any)
  }
}
