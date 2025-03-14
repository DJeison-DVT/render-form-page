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

export default async function PopUpMenu() {
	const session = await auth();

	if (!session) {
		return null;
	}

	const user = session.user;
	const role = user.role;

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
				</div>
				<Separator />
				<div className="flex flex-col items-center py-2">
					<Button variant="link">
						<Link href="/renders/dashboard">Dashboard</Link>
					</Button>
					{role === Role.PETITIONER && (
						<Button variant="link">
							<Link href="/renders/registration">Registro</Link>
						</Button>
					)}
				</div>
				<div className="pb-2">
					<Separator />
				</div>
				<SignOut />
			</PopoverContent>
		</Popover>
	);
}
