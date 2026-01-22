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
    userId?: string;       // Changed from 'id' to 'userId' to match your code
    email?: string;
    name?: string;
    picture?: string | null;
    accountType?: AccountType;
  }
}