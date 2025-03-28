import NextAuth, { DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcrypt";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { JWT } from "next-auth/jwt";
import { object, string } from "zod";
// import { registerUser } from "./storage/auth";
// import { Role } from "@prisma/client";

export const signInSchema = object({
	phone: string({ required_error: "Se requiere un número de teléfono" })
		.min(1, "Se requiere un número de teléfono")
		.max(10, "En formato de 10 dígitos"),
	password: string({ required_error: "Password is required" })
		.min(1, "Password is required")
		.min(8, "Password must be more than 8 characters")
		.max(32, "Password must be less than 32 characters"),
});

declare module "next-auth" {
	interface Session {
		user: {
			role: string;
			phone: string;
			email: string;
			userId: string;
			company: string;
		} & DefaultSession["user"];
	}

	interface User {
		userId: string;
		role: string;
		phone: string;
		company: string;
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		role: string;
		phone: string;
		email: string;
		userId: string;
		company: string;
	}
}

export const { handlers, signIn, signOut, auth } = NextAuth({
	// @ts-expect-error PrismaAdapter requires a specific type
	adapter: PrismaAdapter(prisma),
	secret: process.env.NEXTAUTH_SECRET,
	trustHost: true,
	session: {
		strategy: "jwt",
	},
	providers: [
		Credentials({
			credentials: {
				phone: { label: "Número de teléfono", type: "text" },
				password: { label: "Contraseña", type: "password" },
			},
			authorize: async (credentials) => {
				const { phone, password } = await signInSchema.parseAsync(
					credentials
				);

				const user = await prisma.user.findUnique({
					where: { phone },
				});
				if (!user) {
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

				const userData = {
					userId: user.id,
					phone: user.phone,
					role: user.role,
					email: user.email,
					company: user.company,
				};

				return userData;
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.userId = user.userId;
				token.role = user.role;
				token.phone = user.phone;
				token.email = user.email || "";
				token.company = user.company || "";
			}
			return token;
		},
		async session({ session, token }) {
			if (session?.user) {
				session.user.userId = token.userId;
				session.user.role = token.role;
				session.user.phone = token.phone;
				session.user.email = token.email;
				session.user.company = token.company;
			}
			return session;
		},
	},
});
