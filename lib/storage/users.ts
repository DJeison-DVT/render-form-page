"use server";

import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import bcrypt from "bcrypt";
import { z } from "zod";
import { userCreationSchema, userUpdateSchema } from "@/app/Schemas";
import { UserWhereClause, UserUpdateData } from "@/lib/types";

const SALT_ROUNDS = 10;

async function RegisterUser(userData: z.infer<typeof userCreationSchema>) {
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

const GetUserById = async (id: string) => {
	const user = await prisma.user.findUnique({
		where: {
			id,
			active: true,
		},
	});

	if (!user) {
		throw new Error("Usuario no encontrado");
	}

	return user;
};

const GetUser = async (phone: string) => {
	const user = await prisma.user.findUnique({
		where: {
			phone,
			active: true,
		},
	});

	if (!user) {
		throw new Error("Usuario no encontrado");
	}

	return user;
};

const GetUsers = async (role?: Role, filter?: string) => {
	const whereClause: UserWhereClause = {
		active: true,
	};

	if (role) {
		whereClause.role = role;
	}

	if (filter) {
		whereClause.OR = [
			{
				name: {
					contains: filter,
					mode: "insensitive",
				},
			},
			{
				description: {
					contains: filter,
					mode: "insensitive",
				},
			},
			{
				phone: {
					contains: filter,
					mode: "insensitive",
				},
			},
		];
	}

	const users = await prisma.user.findMany({
		where: whereClause,
	});
	return users;
};

const UpdateUser = async (userData: z.infer<typeof userUpdateSchema>) => {
	const { id, phone, password, name, email, role, description } = userData;

	if (!id || !phone || !name || !email || !role) {
		throw new Error("Faltan campos requeridos");
	}

	// Check if user exists using helper function
	const existingUser = await GetUserById(id);

	// Check if phone is being changed and if new phone already exists
	if (phone !== existingUser.phone) {
		try {
			await GetUser(phone);
			// If we get here, phone exists
			throw new Error("El teléfono ya está en uso");
		} catch (error) {
			// If error is "Usuario no encontrado", phone is available
			if (
				error instanceof Error &&
				error.message !== "Usuario no encontrado"
			) {
				throw error;
			}
		}
	}

	// Check if email is being changed and if new email already exists
	if (email !== existingUser.email) {
		const emailExists = await prisma.user.findUnique({
			where: { email, active: true },
		});

		if (emailExists) {
			throw new Error("El correo ya está en uso");
		}
	}

	const updateData: UserUpdateData = {
		phone,
		name,
		email,
		role: role as Role,
		description,
	};

	// Only hash and update password if provided
	if (password && password.trim() !== "") {
		updateData.password = await bcrypt.hash(password, SALT_ROUNDS);
	}

	const user = await prisma.user.update({
		where: { id },
		data: updateData,
	});

	return user;
};

const DeleteUser = async (id: string) => {
	const user = await GetUserById(id);

	// Add timestamp to ensure uniqueness even if same user is "deleted" multiple times
	const timestamp = Date.now();
	const deletedPrefix = `DELETED_${timestamp}_`;

	await prisma.user.update({
		where: { id },
		data: {
			active: false,
			phone: `${deletedPrefix}${user.phone}`,
			email: `${deletedPrefix}${user.email}`,
		},
	});
};

export { GetUserById, GetUser, GetUsers, RegisterUser, UpdateUser, DeleteUser };
