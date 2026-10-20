import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authorizeCredentials } from "@/utils/signIn.mjs";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "email@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        return authorizeCredentials(credentials, { apiUrl: process.env.NEXT_PUBLIC_API_URL });
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 hour
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  callbacks: {
    async jwt({ token, user }) {
      // First time login → store tokens
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.token;
        token.refreshToken = user.refreshToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        userId: token.id,
        role: token.role,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken
      };
      return session;
    }
  },
  pages: {
    signIn: "/login", // custom login page
  }
});

export { handler as GET, handler as POST };
