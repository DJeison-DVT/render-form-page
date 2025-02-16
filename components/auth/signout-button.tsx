import { signOut } from "@/lib/auth";
import { LogOut } from "lucide-react";

export function SignOut() {
	return (
		<form
			action={async () => {
				"use server";
				await signOut();
			}}
		>
			<button type="submit" className="flex mb-2 justify-end w-full">
				<div className="flex gap-2  rounded-md bg-transparent p-2 hover:text-white hover:bg-slate-800/80 transition-all duration-400 ">
					<div>Desconectar</div>
					<div>
						<LogOut />
					</div>
				</div>
			</button>
		</form>
	);
}
