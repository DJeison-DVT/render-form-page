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
		<div className="h-screen flex flex-col justify-start items-center max-w-[80vw] mx-auto pt-[5vh] overflow-y-auto relative">
			<div className="absolute top-0 right-0 py-8">
				<Link href="/renders/dashboard">
					<div className="hover:bg-slate-200 rounded-lg transition-colors duration-200 cursor-pointer p-2">
						<MoveLeft size={32} />
					</div>
				</Link>
			</div>
			<div className="text-3xl p-4">Cotizaciones Completadas</div>
			<div className="flex flex-col items-center gap-4">
				{quoteInformations.length > 0 &&
					quoteInformations.map((quoteInformation) => (
						<QuoteCard
							key={quoteInformation.id}
							quoteInformation={quoteInformation}
							link={`/renders/history/${quoteInformation.id}`}
						/>
					))}
			</div>
		</div>
	);
}
