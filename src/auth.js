import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import User from "@/models/user";
import Store from "@/models/store"
import bcrypt from "bcryptjs";
import connectToDB from '@/utils/connectDB';

const SECRET = process.env.NEXTAUTH_SECRET;

const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          await connectToDB();
          const user = await User.findOne({ email: credentials.email }).lean();
         
          if (!user) return null;  
          const match = await bcrypt.compare(credentials.password, user.password);
          if (!match) return null;
          return { id: String(user._id), name: user.name || user.email, email: user.email, role: user.role || 'user', isAdmin: user.isAdmin || false, root: user.root || false };
        } catch (e) {
          console.error('Credentials authorize error:', e);
          return null;
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: '/login'
  },
  session: {
    strategy: 'jwt'
  },
  secret: SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.email = user.email;
        token.name = user.name || user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.userId,
          email: token.email,
          name: token.name,
        };
      }
      return session;
    },
    async signIn({ user, account }) {
      return true;
    }
  }
};

export default NextAuth(authOptions);
export { authOptions };
