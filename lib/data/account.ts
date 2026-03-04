import dbConnect from '../mongodb';
import { Account, IAccount } from '../../models/Account';
import mongoose from 'mongoose';

export async function getAccountByEmail(email: string): Promise<IAccount | null> {
  await dbConnect();
  const account = await Account.findOne({ email }).lean();
  return account as IAccount | null;
}
