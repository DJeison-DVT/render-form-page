import { auth } from "@/lib/auth";
import { getCompleteQuotes } from "@/lib/storage/database";
import QuoteCard from "../components/QuoteCard";
import { QuoteInformationWithQuotes } from "@/lib/types";
import Searchbar from "../components/Searchbar";
import { Role } from "@prisma/client";
import PagePagination from "../components/PagePagination";

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

	const phone = session?.user.phone || "";
	const role = (session?.user.role as Role) || "";

	const { success, quoteInformations, pagination } = await getCompleteQuotes(
		phone,
		query,
		page,
		role
	);

	if (!success) {
		return null;
	}
	const qIs = quoteInformations as QuoteInformationWithQuotes[];

	return (
		<div className="h-screen flex flex-col justify-start items-center overflow-y-auto">
			<div className="w-full p-2 shadow-md mb-4 min-h-14 grid grid-cols-1 lg:grid-cols-3">
				<Searchbar
					route="/renders/dashboard/history"
					className="hidden lg:block ml-12 lg:w-56 w-28"
					initialQuery={query}
				/>
				<div className="flex justify-center items-center text-xl lg:text-3xl text-center">
					Cotizaciones Completadas
				</div>
			</div>
			<PagePagination
				url="/renders/dashboard/history"
				page={pagination.page}
				totalPages={pagination.totalPages}
				query={query}
			/>
			<div className="flex flex-col items-center gap-4">
				{qIs.length > 0 &&
					qIs.map((qi) => (
						<QuoteCard
							role={role}
							key={qi.id}
							quoteInformation={qi}
							link={`/renders/history/${qi.id}`}
						/>
					))}
			</div>
		</div>
	);
}
