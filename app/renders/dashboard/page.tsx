import { auth } from "@/lib/auth";
import { getPendingQuotes } from "@/lib/storage/database";
import { Role } from "@prisma/client";
import QuoteCard from "./components/QuoteCard";
import { QuoteInformationWithQuotes } from "@/lib/types";
import Link from "next/link";
import { History } from "lucide-react";
import Head from "next/head";

export default async function Dashboard() {
	const session = await auth();

	if (!session) {
		return null;
	}

	const result = await getPendingQuotes(
		session.user.phone,
		session.user.role as Role
	);
	if (!result.success) {
		return null;
	}
	const quoteInformations =
		result.quoteInformations as QuoteInformationWithQuotes[];

	return (
		<>
			<Head>
				<title>Dashboard Pop ups</title>
			</Head>
			<div className="h-screen flex flex-col justify-start items-center max-w-[80vw] mx-auto pt-[5vh] overflow-y-auto relative">
				<div className="absolute top-0 right-0 py-8">
					<Link href="/renders/dashboard/history">
						<div className="hover:bg-slate-200 rounded-lg transition-colors duration-200 cursor-pointer p-2">
							<History size={32} />
						</div>
					</Link>
				</div>

				<div className="text-3xl p-4">Cotizaciones pendientes</div>
				<div className="flex flex-col items-center gap-4">
					{quoteInformations.length > 0 &&
						quoteInformations.map((quoteInformation) => (
							<QuoteCard
								key={quoteInformation.id}
								quoteInformation={quoteInformation}
								link={`/renders/confirmation/${quoteInformation.id}`}
							/>
						))}
				</div>
			</div>
		</>
	);
}
