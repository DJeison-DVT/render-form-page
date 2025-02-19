import { auth } from "@/lib/auth";
import { getPendingQuotes } from "@/lib/storage/database";
import { Role } from "@prisma/client";
import QuoteCard from "./components/QuoteCard";
import { QuoteInformationWithQuotes } from "@/lib/types";

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
		<div className="h-screen flex flex-col justify-start items-center max-w-[80vw] mx-auto pt-[5vh] overflow-y-auto">
			<div className="text-3xl p-4">Cotizaciones pendientes</div>
			<div className="flex flex-col items-center gap-4">
				{quoteInformations.length > 0 &&
					quoteInformations.map((quoteInformation) => (
						<QuoteCard quoteInformation={quoteInformation} />
					))}
			</div>
		</div>
	);
}
