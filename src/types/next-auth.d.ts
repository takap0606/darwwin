import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username: string;
      email: string;
      // Here we add that the user object may have an address field
      address?: string;
      [key: string]: string;
    };
  }
}
