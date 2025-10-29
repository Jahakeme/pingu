import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import prisma from "@/prisma/connection";
import argon2 from "argon2";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image: string;
    };
  }
    }

export const authOptions:NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    CredentialsProvider({
    name: "Email and Password",
    credentials: {
      username: { label: "Email", type: "text" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
        console.log("Credentials:", credentials); // Remove before deploying to production
         const user = await prisma.user.findFirst({where:{email:credentials?.username}})
            if (!user) {
                throw new Error("No user found with the given email")
            }
            if (!credentials?.password) {
                throw new Error("Password is required")
            }
            if (!user.password) {
                throw new Error("This account uses OAuth. Please sign in with Google or GitHub")
            }
            const isValid = await argon2.verify(user.password, credentials.password);
            if (!isValid) throw new Error("Invalid email or password");
            
        try {
            return user
        } catch (_error) {
            throw new Error("Check your credentials")
        }
    }
  }),
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!
  }),
  GitHubProvider({
    clientId: process.env.GITHUB_ID!,
    clientSecret: process.env.GITHUB_SECRET!
  })
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      if (account?.provider === "google" || account?.provider === "github") {
        console.log("Third-party sign-in:", { user, account, profile, email, credentials });
        const existingUser = await prisma.user.findFirst({ where: { email: user.email! } });
        if (!existingUser) {
          await prisma.user.create({
            data: {
              name: user.name!,
              email: user.email!,
              image: user.image!,
              gender: "MALE"
            },
          });
        }
      }
      return true
    },
    async session({ session }) {
      const loggedInUser = await prisma.user.findFirst({
         where: { email: session.user?.email },
         select: { id: true }
        });
      session.user.id = loggedInUser!.id;
      session.user.name = session.user.name!;
      session.user.email = session.user.email!;
      session.user.image = session.user.image!;

      return session
    },
}
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }