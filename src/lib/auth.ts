import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDatabase from "@/lib/db";
import { User, IUser, UserRole } from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your email and password");
        }

        await connectToDatabase();
        const normalizedEmail = credentials.email.toLowerCase().trim();

        const user = await User.findOne({ email: normalizedEmail });
        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        const isMatch = await bcrypt.compare(credentials.password, user.password);
        if (!isMatch) {
          throw new Error("Invalid email or password");
        }

        if (!user.isActive) {
          throw new Error("Your account is currently inactive. Please contact support.");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          mediatorCode: user.mediatorCode,
        };
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // If relative URL, return it directly so the client resolves on current origin
      if (url.startsWith("/")) return url;
      // If same origin, allow it
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch {
        return "/login";
      }
      return "/login";
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // @ts-ignore
        token.role = user.role;
        // @ts-ignore
        token.mediatorCode = user.mediatorCode;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        // @ts-ignore
        session.user.id = token.id as string;
        // @ts-ignore
        session.user.role = token.role as UserRole;
        // @ts-ignore
        session.user.mediatorCode = token.mediatorCode as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "lakshmi_agency_default_jwt_secret_dev_2026",
};

export default authOptions;
