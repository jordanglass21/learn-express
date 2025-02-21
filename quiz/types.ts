import { Request } from 'express';

// define relevant types here

/**
 * A type that represents a user object
 */
export interface User {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
  }

  /**
   * A type that represents the request received by the server
   */
  export interface UserRequest extends Request {
    users?: User[];
  }

