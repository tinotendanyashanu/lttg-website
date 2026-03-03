import clientPromise from '../mongodb';
import { Account } from '@/models/Account';
import { Team } from '@/models/Team';
import mongoose from 'mongoose';
import { AccountType, TeamType } from '@/types';

export async function getUserTeamInfo(email: string): Promise<{ team: TeamType | null; teamMembers: AccountType[] }> {
  try {
    await clientPromise;
    
    // 1. Find the current user's account
    const account = await Account.findOne({ email }).lean();
    if (!account) {
      return { team: null, teamMembers: [] };
    }

    // 2. If the user doesn't have a team assigned, return early
    if (!account.teamId) {
      return { team: null, teamMembers: [] };
    }

    // 3. Fetch the team details
    const teamDoc = await Team.findById(account.teamId).lean();
    if (!teamDoc) {
      return { team: null, teamMembers: [] };
    }

    // 4. Fetch all other users (accounts) assigned to the same team
    const membersDocs = await Account.find({ teamId: account.teamId }).lean();

    // Map the Mongodb documents to our standard Types
    const team: TeamType = {
      _id: teamDoc._id.toString(),
      name: teamDoc.name,
      description: teamDoc.description,
      createdAt: teamDoc.createdAt?.toISOString(),
      updatedAt: teamDoc.updatedAt?.toISOString(),
    };

    const teamMembers: AccountType[] = membersDocs.map(doc => ({
      _id: doc._id.toString(),
      email: doc.email,
      roles: doc.roles,
      teamId: doc.teamId?.toString(),
      isActive: doc.isActive,
      createdAt: doc.createdAt?.toISOString(),
    }));

    return { 
      team, 
      teamMembers 
    };

  } catch (error) {
    console.error('Error in getUserTeamInfo:', error);
    return { team: null, teamMembers: [] };
  }
}
