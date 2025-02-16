import NextAuth, { DefaultSession, User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcrypt";
import { JWT } from "next-auth/jwt";
import { registerUser } from "./storage/auth";
import { object, string } from "zod";

export const signInSchema = object({
	email: string({ required_error: "Email is required" })
		.min(1, "Email is required")
		.email("Invalid email"),
	password: string({ required_error: "Password is required" })
		.min(1, "Password is required")
		.min(8, "Password must be more than 8 characters")
		.max(32, "Password must be less than 32 characters"),
});

declare module "next-auth" {
	interface Session {
		user: {
			role: string;
		} & DefaultSession["user"];
	}

	interface User {
		role: string;
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		role: string;
	}
}

export const { handlers, signIn, signOut, auth } = NextAuth({
	//@ts-ignore
	adapter: PrismaAdapter(prisma),
	secret: process.env.AUTH_SECRET,
	session: {
		strategy: "jwt",
	},
	providers: [
		Credentials({
			credentials: {
				email: { label: "Email", type: "text" },
				password: { label: "Contraseña", type: "password" },
			},
			authorize: async (credentials) => {
				const { email, password } = await signInSchema.parseAsync(
					credentials
				);

				let user = await prisma.user.findUnique({
					where: { email },
				});

				if (!user) {
					// user = await registerUser(email, password);
					throw new Error("User not found");
				}

				if (!user.password) {
					throw new Error(
						"User is not registered through credentials"
					);
				}

				const isMatch = await bcrypt.compare(password, user.password);

				if (!isMatch) {
					throw new Error("Invalid credentials");
				}

				const role = user.role || "USER";

				return {
					id: user.id,
					email: user.email,
					role,
				};
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) token.role = user.role;
			return token;
		},
		async session({ session, token }) {
			if (session?.user) session.user.role = token.role;
			return session;
		},
	},
});
