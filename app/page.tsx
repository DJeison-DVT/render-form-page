import { SignIn } from "@/components/auth/sign-in";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
	const session = await auth();

	if (session) {
		redirect("/renders/registration");
	}

	return (
		<div className="flex flex-col items-center justify-center min-h-screen py-2">
			<div>
				<SignIn />
			</div>
		</div>
	);
}
