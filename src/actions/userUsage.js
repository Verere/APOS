import { getUserUsage } from '@/lib/subscriptionLimits';

export async function fetchUserUsage(userId) {
  return await getUserUsage(userId);
}
