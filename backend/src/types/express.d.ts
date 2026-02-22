export interface JwtPayload {
  id: string;
  email: string;
  //   role: 'BUSINESS' | 'EMPLOYEE';
}

import 'express';
declare module 'express' {
  interface Request {
    user?: JwtPayload;
  }
}
