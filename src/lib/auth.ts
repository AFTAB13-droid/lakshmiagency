import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDatabase from "@/lib/db";
import { User, IUser, UserRole } from "@/models/User";
import bcrypt from "bcryptjs";

const getBaseUrl = () => {
  if (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.includes("localhost")) {
    return process.env.NEXTAUTH_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "https://www.lakshmiagency.net";
};

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

        // Mediator verification check: unapproved or rejected mediators cannot log in
        if (user.role === UserRole.PREMIUM_USER) {
          if (user.mediatorApprovalStatus === "PENDING") {
            throw new Error("Your request is under verification. Once admin approves your request, you can login.");
          }
          if (user.mediatorApprovalStatus === "REJECTED") {
            const reason = user.mediatorRejectionReason ? `: ${user.mediatorRejectionReason}` : "";
            throw new Error(`Admin has rejected your request${reason}. Please contact support.`);
          }
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
      const canonicalBase = getBaseUrl();
      // Relative paths must be resolved to a valid absolute URL so new URL(data.url) never throws in NextAuth client
      if (url.startsWith("/")) return `${canonicalBase}${url}`;
      try {
        const u = new URL(url);
        if (
          u.origin === canonicalBase ||
          u.origin.includes("lakshmiagency.net") ||
          u.origin.includes("vercel.app") ||
          u.origin === baseUrl
        ) {
          return url;
        }
      } catch {}
      return `${canonicalBase}/login`;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        // @ts-ignore
        token.role = user.role;
        // @ts-ignore
        token.mediatorCode = user.mediatorCode;
      }
      if (trigger === "update" && session?.name) {
        token.name = session.name;
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
