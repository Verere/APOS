import  connectToDB  from '@/utils/connectDB';
import User  from '@/models/user';

export const GET = async () => {
  const token = request.nextUrl.pathname.split('/').pop(); // Extract the token from the URL
  await connectToDB();

  // Find the user by the email token and update their isActive status
  const user = await User.findOneAndUpdate(
    { emailToken: token },
    { isActive: true, emailToken: null },
    { new: true }
  );

  if (user) {
    return new Response(JSON.stringify({ message: 'Account has been activated.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } else {
    return new Response(JSON.stringify({ message: 'Invalid or expired activation token.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};