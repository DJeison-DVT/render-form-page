import { auth } from "@/lib/auth";
import {
	getPendingProviderQuotes,
	getPendingQuotes,
} from "@/lib/storage/database";
import { Role } from "@prisma/client";
import QuoteCard from "./components/QuoteCard";
import { QuoteInformationWithQuotes } from "@/lib/types";
import Link from "next/link";
import { History } from "lucide-react";

export default async function Dashboard() {
	const session = await auth();

	if (!session) {
		return null;
	}

	let result: {
		success: boolean;
		quoteInformations?: QuoteInformationWithQuotes[];
	} | null = null;

	if (session.user.role === Role.PROVIDER) {
		result = await getPendingProviderQuotes(session.user.phone);
	} else {
		result = await getPendingQuotes(
			session.user.phone,
			session.user.role as Role
		);
	}

	if (!result.success) {
		return null;
	}
	const quoteInformations =
		result.quoteInformations as QuoteInformationWithQuotes[];

	return (
		<>
			<div className="h-screen flex flex-col justify-start items-center overflow-y-auto">
				<div className="flex justify-between items-center w-full p-2 shadow-md mb-4">
					<div></div>
					<div className="text-3xl">Cotizaciones pendientes</div>

					<Link href="/renders/dashboard/history">
						<div className="hover:bg-slate-200 rounded-lg transition-colors duration-200 cursor-pointer p-2 flex items-center gap-2 text-lg font-semibold">
							<History size={32} /> Historial
						</div>
					</Link>
				</div>
				<div className="flex flex-col items-center gap-4">
					{quoteInformations.length > 0 &&
						quoteInformations.map((quoteInformation) => (
							<QuoteCard
								role={session.user.role as Role}
								key={quoteInformation.id}
								quoteInformation={quoteInformation}
								link={`/renders/confirmation/${
									quoteInformation.id
								}${
									quoteInformation.providerId
										? ""
										: "/provider"
								}`}
							/>
						))}
				</div>
			</div>
		</>
	);
}
