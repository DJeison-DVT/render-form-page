import { prisma } from "../prisma";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

async function registerUser(email: string, password: string) {
	if (!email || !password) {
		throw new Error("Email and password are required");
	}

	const existingUser = await prisma.user.findUnique({
		where: { email },
	});

	if (existingUser) {
		throw new Error("User already exists");
	}

	const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

	const user = await prisma.user.create({
		data: {
			email,
			password: hashedPassword,
		},
	});

	return user;
}

export { registerUser };
