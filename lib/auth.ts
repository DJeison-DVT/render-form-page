import NextAuth, { DefaultSession, User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcrypt";
import { JWT } from "next-auth/jwt";
import { registerUser } from "./storage/auth";
import { object, string } from "zod";

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
		} & DefaultSession["user"];
	}

	interface User {
		role: string;
		phone: string;
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		role: string;
		phone: string;
		email: string;
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
				phone: { label: "Número de teléfono", type: "text" },
				password: { label: "Contraseña", type: "password" },
			},
			authorize: async (credentials) => {
				const { phone, password } = await signInSchema.parseAsync(
					credentials
				);

				let user = await prisma.user.findUnique({
					where: { phone },
				});
				if (!user) {
					// user = await registerUser(phone, password);
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
					id: user.id,
					phone: user.phone,
					role: user.role,
					email: user.email,
				};

				return userData;
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.role = user.role;
				token.phone = user.phone;
				token.email = user.email || "";
			}
			return token;
		},
		async session({ session, token }) {
			if (session?.user) {
				session.user.role = token.role;
				session.user.phone = token.phone;
				session.user.email = token.email;
			}
			return session;
		},
	},
});
