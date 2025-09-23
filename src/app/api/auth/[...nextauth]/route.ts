// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { auth } from "@/lib/firebase"; 
import { signInWithEmailAndPassword } from "firebase/auth";

import { DefaultSession } from "next-auth";

// Extend the Session user type to include 'id'
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
    } & DefaultSession["user"];
  }
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const userCredential = await signInWithEmailAndPassword(
            auth,
            credentials?.email as string,
            credentials?.password as string
          );
          const user = userCredential.user;
          return {
            id: user.uid,
            email: user.email,
            name: user.displayName || "Usuário",
          };
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: import("next-auth/jwt").JWT; user?: import("next-auth").User }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }: { session: import("next-auth").Session; token: import("next-auth/jwt").JWT }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };