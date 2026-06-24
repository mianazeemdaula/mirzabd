// auth.config.ts
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || "placeholder",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || "placeholder",
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "CUSTOMER";
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role || "CUSTOMER";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
