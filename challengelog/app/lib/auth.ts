import { NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "../db/index";
import { users, accounts, sessions, verificationTokens } from "../(Schema)/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const authConfig: NextAuthOptions = {
    adapter: DrizzleAdapter(db, {
        usersTable: users as any,
        accountsTable: accounts as any,
        sessionsTable: sessions as any,
        verificationTokensTable: verificationTokens as any,
    }) as any,
    session: {
        strategy: "jwt",
    },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }
                const userQuery = await db.select().from(users).where(eq(users.email, credentials.email)).limit(1);
                const user = userQuery[0];
                if (!user || !user.password) {
                    return null;
                }
                const passwordsMatch = await bcrypt.compare(credentials.password, user.password);
                if (passwordsMatch) {
                    return { id: user.id.toString(), email: user.email, name: user.name };
                }
                return null;
            }
        })
    ],
    pages: {
        signIn: "/signin",
    },
    callbacks: {
        async session({ session, token }) {
            if (token.sub && session.user) {
                (session.user as any).id = token.sub;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id;
            }
            return token;
        }
    }
}