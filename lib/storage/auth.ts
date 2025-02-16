import { prisma } from "../prisma";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

async function registerUser(phone: string, password: string) {
	if (!phone || !password) {
		throw new Error("Phone and password are required");
	}

	const existingUser = await prisma.user.findUnique({
		where: { phone },
	});

	if (existingUser) {
		throw new Error("User already exists");
	}

	const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

	const user = await prisma.user.create({
		data: {
			phone,
			password: hashedPassword,
		},
	});

	return user;
}

export { registerUser };
