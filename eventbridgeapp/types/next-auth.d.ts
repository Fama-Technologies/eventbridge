import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      accountType: 'VENDOR' | 'CUSTOMER' | 'PLANNER' | 'ADMIN';
    };
  }

  interface User {
    id: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
    accountType?: 'VENDOR' | 'CUSTOMER' | 'PLANNER' | 'ADMIN';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId?: number;
    accountType?: 'VENDOR' | 'CUSTOMER' | 'PLANNER' | 'ADMIN';
  }
}