import { signOut } from "@/lib/auth";
import { LogOut } from "lucide-react";
import { Button } from "../ui/button";

export async function SignOut() {
	return (
		<form
			action={async () => {
				"use server";
				await signOut();
			}}
		>
			<Button type="submit" className="flex mb-2 justify-center w-full">
				<div className="flex gap-2 w-fit rounded-md p-2 items-center">
					<div>Desconectar</div>
					<div>
						<LogOut />
					</div>
				</div>
			</Button>
		</form>
	);
}
