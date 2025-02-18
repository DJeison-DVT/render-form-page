import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import PopUpMenu from "@/app/components/PopUpMenu";

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
			<div className="fixed top-4 left-4">
				<PopUpMenu />
			</div>
			<main>{children}</main>
		</SessionProvider>
	);
}
