import { useState, useEffect } from "react";
import { getUsers } from "@/lib/storage/database";
import { Role } from "@prisma/client";

export interface UserOption {
	id: string;
	phone: string;
	name: string;
}

export function useUsersByRole(role: Role, filter: string): UserOption[] {
	const [users, setUsers] = useState<UserOption[]>([]);

	useEffect(() => {
		const fetchOptions = async () => {
			try {
				const users = await getUsers(role, filter);
				setUsers(
					users.map((user) => ({
						id: user.id,
						phone: user.phone,
						name: user.name,
					}))
				);
			} catch (error) {
				console.error("Error fetching users:", error);
			}
		};

		if (role) {
			fetchOptions();
		}
	}, [role, filter]);

	return users;
}
