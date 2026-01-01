import connectToDB from '@/utils/connectDB'
import StoreInvite from '@/models/storeInvite'
import User from '@/models/user'
import StoreMembership from '@/models/storeMembership'
import withTransaction from '@/lib/withTransaction'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'

export async function POST(req) {
  try {
    const body = await req.json();
    const token = body?.token;
    if (!token) return new Response(JSON.stringify({ error: 'token is required' }), { status: 400 });

    await connectToDB();

    const now = new Date();
    const invite = await StoreInvite.findOne({ token, isDeleted: { $ne: true }, expiresAt: { $gt: now } }).lean();
    if (!invite) return new Response(JSON.stringify({ error: 'Invalid or expired invite' }), { status: 400 });

    const user = await User.findOne({ email: invite.email }).lean();
    if (!user) {
      // Not registered yet — tell client to sign up
      return new Response(JSON.stringify({ action: 'signup_required', email: invite.email, message: 'Please sign up with this email to accept the invite' }), { status: 200 });
    }

    // Require session and that the signed-in user matches the invited email
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return new Response(JSON.stringify({ error: 'Unauthorized: please sign in' }), { status: 401 });
    if ((session.user.email || '').toLowerCase() !== (user.email || '').toLowerCase()) {
      return new Response(JSON.stringify({ error: 'Unauthorized: sign in with the invited email' }), { status: 401 });
    }

    // Do not bypass email verification
    if (!user.emailVerified) return new Response(JSON.stringify({ error: 'Forbidden: email not verified' }), { status: 403 });

    try {
      const result = await withTransaction(async (sessionDB) => {
        // ensure not already a member
        const existing = await StoreMembership.findOne({ userId: user._id, storeId: invite.storeId, isDeleted: { $ne: true } }).session(sessionDB);
        if (existing) {
          // mark invite consumed
          await StoreInvite.updateOne({ _id: invite._id }, { $set: { isDeleted: true } }, { session: sessionDB });
          return { alreadyMember: true };
        }

        const membership = new StoreMembership({ userId: user._id, storeId: invite.storeId, role: invite.role, slug: invite.slug });
        await membership.save({ session: sessionDB });

        await StoreInvite.updateOne({ _id: invite._id }, { $set: { isDeleted: true } }, { session: sessionDB });

        return { membershipId: membership._id };
      });

      if (result.alreadyMember) return new Response(JSON.stringify({ success: true, message: 'Already a member' }), { status: 200 });
      return new Response(JSON.stringify({ success: true, message: 'Invite accepted' }), { status: 200 });
    } catch (e) {
      console.error('accept invite transaction error', e);
      return new Response(JSON.stringify({ error: 'Failed to accept invite' }), { status: 500 });
    }
  } catch (err) {
    console.error('accept invite error', err);
    return new Response(JSON.stringify({ error: 'server error' }), { status: 500 });
  }
}
