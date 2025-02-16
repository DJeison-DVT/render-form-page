import { signIn } from "@/lib/auth";
import { LogIn } from "lucide-react";

export function SignIn() {
	return (
		<form
			action={async () => {
				"use server";
				await signIn();
			}}
		>
			<button type="submit">
				<div className="flex gap-2 bg-slate-700 rounded-lg p-4 text-xl text-white">
					Acceso al dashboard <LogIn />
				</div>
			</button>
		</form>
	);
}
