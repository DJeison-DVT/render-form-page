import { auth } from "@/lib/auth";
import { getCompleteQuotes } from "@/lib/storage/database";
import QuoteCard from "../components/QuoteCard";
import { QuoteInformationWithQuotes } from "@/lib/types";
import { MoveLeft } from "lucide-react";
import Link from "next/link";

export default async function Dashboard() {
	const session = await auth();

	if (!session) {
		return null;
	}

	const result = await getCompleteQuotes(session.user.phone);
	if (!result.success) {
		return null;
	}
	const quoteInformations =
		result.quoteInformations as QuoteInformationWithQuotes[];

	return (
		<div className="h-screen flex flex-col justify-start items-center overflow-y-auto">
			<div className="flex justify-between items-center w-full p-2 shadow-md">
				<div></div>
				<div className="text-3xl">Cotizaciones Completadas</div>
				<Link href="/renders/dashboard">
					<div className="hover:bg-slate-200 rounded-lg transition-colors duration-200 cursor-pointer p-2 flex items-center gap-2 text-lg font-semibold">
						<MoveLeft size={32} /> Volver
					</div>
				</Link>
			</div>
			<div className="flex flex-col items-center gap-4">
				{quoteInformations.length > 0 &&
					quoteInformations.map((quoteInformation) => (
						<QuoteCard
							role={session.user.role}
							key={quoteInformation.id}
							quoteInformation={quoteInformation}
							link={`/renders/history/${quoteInformation.id}`}
						/>
					))}
			</div>
		</div>
	);
}
