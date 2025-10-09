"use client";

import { useUsersByRole } from "@/app/components/formPage/useUsersByRole";
import { useEffect, useState } from "react";
import { User } from "@prisma/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GetUser } from "@/lib/storage/users";
import UserCreation from "@/app/components/UserCreation";
import UpdateUser from "@/app/components/UpdateUser";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

export default function UsersPage() {
	const [query, setQuery] = useState<string>("");
	const [refreshKey, setRefreshKey] = useState(0);
	const users = useUsersByRole(undefined, query, refreshKey);
	const [selectedUserPhone, setSelectedUserPhone] = useState<string | null>(
		users.length > 0 ? users[0].phone : null
	);

	const [user, setUser] = useState<User | null>(null);

	const getUser = async (phone: string | null) => {
		if (!phone) {
			setUser(null);
			return;
		}
		const fetchedUser = await GetUser(phone);
		setUser(fetchedUser);
	};

	useEffect(() => {
		if (!selectedUserPhone && users.length > 0) {
			setSelectedUserPhone(users[0].phone);
		}
		getUser(selectedUserPhone);
	}, [selectedUserPhone, users]);

	return (
		<div className="h-screen flex flex-col">
			<div className="w-full p-2 shadow-md mb-4 min-h-14">
				<div className="flex justify-center items-center text-xl lg:text-3xl text-center">
					Usuarios
				</div>
			</div>
			<div className="flex flex-1 overflow-hidden px-4">
				<div className="w-fit flex flex-col min-h-0">
					<div className="flex items-center">
						<Input
							placeholder="Buscar usuario"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
						/>
						<UserCreation
							onUserCreation={() =>
								setRefreshKey((prev) => prev + 1)
							}
						/>
					</div>
					<ScrollArea className="flex-1 min-w-72">
						{users.map((user) => (
							<div
								key={user.id}
								className="p-2 border-b hover:bg-gray-50 cursor-pointer rounded-md"
								onClick={() => setSelectedUserPhone(user.phone)}
							>
								<div className="text-lg font-semibold">
									{user.name}
								</div>
								<div className="text-sm text-gray-600">
									{user.phone}
								</div>
							</div>
						))}
					</ScrollArea>
				</div>
				<Separator orientation="vertical" />
				<UpdateUser
					user={user}
					onUserUpdated={() => setRefreshKey((prev) => prev + 1)}
					onUserDeleted={() => setSelectedUserPhone(null)}
				/>
			</div>
		</div>
	);
}
