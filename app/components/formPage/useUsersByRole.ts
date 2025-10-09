import { useState, useEffect } from "react";
import { GetUsers } from "@/lib/storage/users";
import { Role } from "@prisma/client";

export interface UserOption {
	id: string;
	phone: string;
	name: string;
}

export function useUsersByRole(
	role?: Role,
	filter?: string,
	refreshKey?: number
): UserOption[] {
	const [users, setUsers] = useState<UserOption[]>([]);

	useEffect(() => {
		const fetchOptions = async () => {
			try {
				const users = await GetUsers(role, filter);
				setUsers(users);
			} catch (error) {
				console.error("Error fetching users:", error);
			}
		};

		fetchOptions();
	}, [role, filter, refreshKey]);

	return users;
}
