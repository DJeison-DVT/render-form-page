"use server";

import { prisma } from "../prisma";
import bcrypt from "bcrypt";
import { z } from "zod";
import { userCreationSchema } from "@/app/Schemas";
import { Role } from "@prisma/client";

const SALT_ROUNDS = 10;

async function registerUser(userData: z.infer<typeof userCreationSchema>) {
	const { phone, password, name, email, role } = userData;
	if (!phone || !password || !name || !email || !role) {
		throw new Error("Missing required fields");
	}

	const existingUser = await prisma.user.findUnique({
		where: { phone },
	});

	if (existingUser) {
		throw new Error("User already exists");
	}

	const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
	const castRole = role as Role;

	const user = await prisma.user.create({
		data: {
			phone,
			password: hashedPassword,
			name,
			email,
			role: castRole,
		},
	});

	return user;
}

export { registerUser };
