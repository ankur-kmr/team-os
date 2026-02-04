import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt", // Use JWT for stateless sessions
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials): Promise<{ id: string; email: string; name?: string } | null> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) {
          return null;
        }

        console.log("🔐 Auth successful for:", user)

        // Return user object
        return {
          id: user.id,
          email: user.email,
          name: user.name || undefined,
        };
      },
    }),
  ],

  callbacks: {
    // async signIn({ user }) {
    //   // Simply allow sign in
    //   return true;
    // },

    async jwt({ token, user }) {
      // Add user ID to JWT token
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      // Add token data to session
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});