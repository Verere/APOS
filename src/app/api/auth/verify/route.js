import connectToDB from '@/utils/connectDB'
import User from '@/models/user'
import bcrypt from 'bcryptjs'

export async function POST(req) {
  try {
    const body = await req.json();
    const token = body?.token || body?.verificationToken;
    if (!token) return new Response(JSON.stringify({ error: 'token is required' }), { status: 400 });

    await connectToDB();

    // Try to find by legacy plain token first (emailToken)
    let user = await User.findOne({ emailToken: token });

    // If not found, try to match against hashed verification token (if not expired)
    if (!user) {
      const now = new Date();
      const candidates = await User.find({ emailVerificationToken: { $exists: true, $ne: null }, emailVerificationExpires: { $gt: now } }).lean();
      if (candidates && candidates.length > 0) {
        for (const cand of candidates) {
          if (!cand.emailVerificationToken) continue;
          const match = await bcrypt.compare(token, cand.emailVerificationToken);
          if (match) {
            // reload full document to update
            user = await User.findById(cand._id);
            break;
          }
        }
      }
    }

    if (!user) return new Response(JSON.stringify({ error: 'Invalid or expired token' }), { status: 400 });

    // Check expiry if present
    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      return new Response(JSON.stringify({ error: 'Token expired' }), { status: 400 });
    }

    // Mark verified and clear verification fields using an update (avoids running required validators)
    await User.updateOne(
      { _id: user._id },
      {
        $set: { emailVerified: new Date() },
        $unset: { emailVerificationToken: "", emailVerificationExpires: "", emailToken: "" },
      }
    );

    return new Response(JSON.stringify({ success: true, message: 'Email verified' }), { status: 200 });
  } catch (err) {
    console.error('email verify error', err);
    return new Response(JSON.stringify({ error: 'server error' }), { status: 500 });
  }
}
