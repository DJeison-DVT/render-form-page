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
import UserCreation from "@/app/components/UserCreation";
import { formatMexicanPhoneNumber } from "@/lib/utils";

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
				<div className="flex flex-col gap-2 items-center pb-2">
					<p>{RoleTranslations[user.role as Role]}</p>
					<p>{formatMexicanPhoneNumber(user.phone)}</p>
					<p>{user.email}</p>
					<p>{user.name}</p>
				</div>
				<Separator />
				<div className="flex justify-center">
					<div className="flex flex-col items-start py-2 justify-center max-w-fit">
						<Button variant="link">
							<Link href="/renders/dashboard">Dashboard</Link>
						</Button>
						{role !== Role.PROVIDER && (
							<Button variant="link">
								<Link href="/renders/dashboard/history">
									Historial
								</Link>
							</Button>
						)}
						{adminRoles.includes(role as Role) && (
							<Button variant="link">
								<Link href="/renders/registration">
									Registro
								</Link>
							</Button>
						)}
					</div>
				</div>
				<Separator />
				{adminRoles.includes(role as Role) && (
					<>
						<div className="py-2 flex justify-center items-center">
							<UserCreation />
						</div>
						<Separator />
					</>
				)}
				<div className="pt-2">
					<SignOut />
				</div>
			</PopoverContent>
		</Popover>
	);
}
