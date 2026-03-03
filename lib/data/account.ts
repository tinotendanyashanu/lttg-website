import dbConnect from '../mongodb';
import { Account, IAccount } from '../../models/Account';

export async function getAccountByEmail(email: string): Promise<IAccount | null> {
  if (process.env.NODE_ENV === 'development') {
    return {
      email: email || 'dev@leotech.com',
      roles: ['admin', 'employee', 'intern'],
      isActive: true,
      partnerId: 'dev-mock-partner-id',
    } as any;
  }

  await dbConnect();
  const account = await Account.findOne({ email }).lean();
  return account as IAccount | null;
}
