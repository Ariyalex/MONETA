import "express";

// memperluas express request agar memiliki properti auth.
declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        username: string;
      };
    }
  }
}

export {};
