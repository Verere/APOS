import { getUserSubscription } from '@/lib/subscriptionLimits';

export async function fetchUserSubscription(userId) {
  return await getUserSubscription(userId);
}
