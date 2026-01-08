import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import SubscriptionPackages from '@/components/SubscriptionPackages';

export const metadata = {
  title: 'Subscription Plans - MarketBook',
  description: 'Choose the perfect subscription plan for your business'
};

export default async function SubscriptionPage() {
  const session = await getServerSession(authOptions);

  return <SubscriptionPackages user={session?.user} />;
}
