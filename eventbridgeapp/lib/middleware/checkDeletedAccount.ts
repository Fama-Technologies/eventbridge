// lib/middleware/checkDeletedAccount.ts
import { db } from '@/lib/db';
import { deletedAccounts } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function checkDeletedAccount(email: string): Promise<boolean> {
  const [deleted] = await db
    .select()
    .from(deletedAccounts)
    .where(eq(deletedAccounts.email, email.toLowerCase()))
    .limit(1);
  
  return !!deleted;
}