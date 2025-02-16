import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { SignOut } from "@/components/auth/signout-button";

export default async function DashboardLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await auth();

	if (!session) {
		redirect("/");
	}

	return (
		<SessionProvider session={session}>
			<div className="fixed bottom-4 left-4 flex justify-start gap-4">
				<SignOut />
			</div>
			<main>{children}</main>
		</SessionProvider>
	);
}
