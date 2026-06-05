import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

const ADMIN_EMAILS = ['kashish.ghanghss@wiom.in'];

export function isAdmin(email) {
  return ADMIN_EMAILS.includes(email?.toLowerCase());
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_ADS_CLIENT_ID,
      clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      const email = profile?.email || '';
      return email.endsWith('@wiom.in') || email.endsWith('@i2e1.com');
    },
    async session({ session }) {
      if (session?.user?.email) {
        session.user.isAdmin = isAdmin(session.user.email);
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
});
