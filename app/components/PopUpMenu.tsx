import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { SignOut } from "@/components/auth/signout-button";
import { auth } from "@/lib/auth";
import { AlignJustify } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RoleTranslations } from "@/lib/types";
import { Role } from "@prisma/client";
import { formatMexicanPhoneNumber } from "@/lib/utils";

const menuButton = (title: string, href: string) => {
	return (
		<div className="text-xl hover:bg-gray-500 rounded-md w-full cursor-pointer flex">
			<Link className="flex-1 p-2" href={href}>
				{title}
			</Link>
		</div>
	);
};

export default async function PopUpMenu() {
	const session = await auth();

	if (!session) {
		return null;
	}

	const user = session.user;
	const role = user.role;
	const adminRoles: Role[] = [Role.PETITIONER, Role.SUPERVISOR];

	return (
		<Popover>
			<PopoverTrigger>
				<AlignJustify />
			</PopoverTrigger>
			<PopoverContent>
				<div className="flex flex-col gap-2 items-start pb-2 text-md">
					<p>{RoleTranslations[user.role as Role]}</p>
					<p>{formatMexicanPhoneNumber(user.phone)}</p>
					<p>{user.email}</p>
					<p>{user.name}</p>
				</div>
				<Separator />
				<div className="flex justify-start w-full text-xl">
					<div className="flex flex-col items-start justify-start py-2 w-full">
						{menuButton("Pendientes", "/renders/dashboard")}
						{menuButton("Activos", "/renders/dashboard/active")}
						{menuButton("Historial", "/renders/dashboard/history")}
						{adminRoles.includes(role as Role) && (
							<>
								{menuButton(
									"Registro",
									"/renders/registration"
								)}
								{menuButton("Usuarios", "/renders/users")}
							</>
						)}
					</div>
				</div>
				<Separator />
				<div className="pt-2">
					<SignOut />
				</div>
			</PopoverContent>
		</Popover>
	);
}
