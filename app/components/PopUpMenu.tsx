import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { SignOut } from "@/components/auth/signout-button";
import { auth } from "@/lib/auth";
import { AlignJustify } from "lucide-react";
import EmailForm from "./EmailForm";

interface PopUpMenuProps {
	onSubmit: () => void;
}

export default async function PopUpMenu() {
	const session = await auth();

	if (!session) {
		return null;
	}

	const user = session.user;

	return (
		<Popover>
			<PopoverTrigger>
				<AlignJustify />
			</PopoverTrigger>
			<PopoverContent>
				<div className="flex flex-col gap-2 items-center pb-2">
					<p className="">
						{user.role === "VALIDATOR" ? "VALIDADOR" : "USUARIO"}
					</p>

					<p>{user.phone}</p>
					{user.email ? <p>{user.email}</p> : <EmailForm />}
				</div>
				<SignOut />
			</PopoverContent>
		</Popover>
	);
}
