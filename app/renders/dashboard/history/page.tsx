import { auth } from "@/lib/auth";
import { getCompleteQuotes } from "@/lib/storage/database";
import QuoteCard from "../components/QuoteCard";
import { QuoteInformationWithQuotes } from "@/lib/types";
import { MoveLeft } from "lucide-react";
import Link from "next/link";
import Searchbar from "../components/Searchbar";

type DashboardPageProps = {
	searchParams: Promise<{
		page?: string;
		query?: string;
	}>;
};

export default async function Dashboard({ searchParams }: DashboardPageProps) {
	const sp = await searchParams;
	const page = parseInt(sp.page ?? "1", 10);
	const query = (sp.query ?? "").trim();

	const session = await auth();

	if (!session) {
		return null;
	}

	const { success, quoteInformations } = await getCompleteQuotes(
		session.user.phone,
		query,
		page
	);

	if (!success) {
		return null;
	}
	const qIs = quoteInformations as QuoteInformationWithQuotes[];

	return (
		<div className="h-screen flex flex-col justify-start items-center overflow-y-auto">
			<div className="flex justify-between items-center w-full p-2 shadow-md mb-4">
				<div>
					<Searchbar
						route="/renders/dashboard"
						className="hidden lg:block ml-12"
						initialQuery={query}
					/>
				</div>
				<div className="text-3xl">Cotizaciones Completadas</div>
				<Link href="/renders/dashboard">
					<div className="hover:bg-slate-200 rounded-lg transition-colors duration-200 cursor-pointer p-2 flex items-center gap-2 text-lg font-semibold">
						<MoveLeft size={32} /> Volver
					</div>
				</Link>
			</div>
			<div className="flex flex-col items-center gap-4">
				{qIs.length > 0 &&
					qIs.map((qi) => (
						<QuoteCard
							role={session.user.role}
							key={qi.id}
							quoteInformation={qi}
							link={`/renders/history/${qi.id}`}
						/>
					))}
			</div>
		</div>
	);
}
