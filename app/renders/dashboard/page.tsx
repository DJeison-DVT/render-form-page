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
import Searchbar from "./components/Searchbar";

type DashboardPageProps = {
	searchParams: Promise<{
		query?: string;
	}>;
};

export default async function Dashboard({ searchParams }: DashboardPageProps) {
	const sp = await searchParams;
	const query = sp.query?.trim() ?? "";
	const session = await auth();

	if (!session) {
		return null;
	}

	const quoteInformation: QuoteInformationWithQuotes[] = [];
	if (session.user.role === Role.PROVIDER) {
		const result = await getPendingProviderQuotes(
			session.user.phone,
			query
		);
		if (!result.success) {
			return null;
		}
		quoteInformation.push(...result.quoteInformations);
	}

	const result = await getPendingQuotes(
		session.user.phone,
		session.user.role as Role,
		query
	);

	if (!result.success) {
		return null;
	}

	quoteInformation.push(...result.quoteInformations);

	return (
		<>
			<div className="h-screen flex flex-col justify-start items-center overflow-y-auto ">
				<div className="flex justify-between items-center w-full p-2 shadow-md mb-4 min-h-14">
					<div>
						<Searchbar
							route="/renders/dashboard"
							className="hidden lg:block ml-12"
							initialQuery={query}
						/>
					</div>
					<div className="text-xl lg:text-3xl">
						Cotizaciones pendientes
					</div>
					<div>
						<Link
							href="/renders/dashboard/history"
							className="hidden lg:block"
						>
							<div className="hover:bg-slate-200 rounded-lg transition-colors duration-200 cursor-pointer p-2 flex items-center gap-2 text-lg font-semibold">
								<History size={32} /> Historial
							</div>
						</Link>
					</div>
				</div>
				<div className="flex flex-wrap lg:flex-col items-center gap-4 justify-center">
					{quoteInformation &&
						quoteInformation.length > 0 &&
						quoteInformation.map((quoteInformation) => (
							<QuoteCard
								role={session.user.role as Role}
								key={quoteInformation.id}
								quoteInformation={quoteInformation}
								link={`/renders/confirmation/${
									quoteInformation.id
								}${
									quoteInformation.providerContact
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
