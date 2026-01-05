// types/next-auth.d.ts
import 'next-auth';

// Define AccountType once to be reused
type AccountType = 'VENDOR' | 'CUSTOMER' | 'PLANNER' | 'ADMIN';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      accountType: AccountType;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    accountType: AccountType;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    userId?: number;
    accountType?: AccountType;
  }
}