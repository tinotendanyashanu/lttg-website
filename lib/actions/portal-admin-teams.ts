'use server';

import { getSessionWithDevBypass } from '@/lib/auth-util';
import { getAccountByEmail } from '@/lib/data/account';
import dbConnect from '@/lib/mongodb';
import { Team } from '@/models/Team';
import { ActivityLog } from '@/models/ActivityLog';

export async function getAdminTeams() {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) throw new Error('Unauthorized');

  const teams = await Team.find().sort({ name: 1 }).lean();

  return { success: true, teams: JSON.parse(JSON.stringify(teams)) };
}

export async function createAdminTeam(data: { name: string; description?: string }) {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) throw new Error('Unauthorized');

  const team = await Team.create({ ...data, isActive: true });

  await ActivityLog.create({
    actorAccountId: account._id,
    actionType: 'team_created',
    newValue: `Team created: ${team.name}`,
  });

  return { success: true, teamId: team._id.toString() };
}

export async function updateAdminTeam(teamId: string, data: { name?: string; description?: string; isActive?: boolean }) {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) throw new Error('Unauthorized');

  const team = await Team.findByIdAndUpdate(teamId, { $set: data }, { new: true });
  if (!team) throw new Error('Team not found');

  await ActivityLog.create({
    actorAccountId: account._id,
    actionType: 'team_updated',
    newValue: `Team updated: ${team.name}`,
  });

  return { success: true };
}
