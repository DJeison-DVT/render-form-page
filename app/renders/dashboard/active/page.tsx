import { auth } from "@/lib/auth";
import { getPendingQuotes } from "@/lib/storage/database";
import { Role } from "@prisma/client";
import QuoteCard from "../components/QuoteCard";
import Searchbar from "../components/Searchbar";
import PagePagination from "../components/PagePagination";

type ActiveDashboardPageProps = {
	searchParams: Promise<{
		query?: string;
		page?: string;
	}>;
};

export default async function ActiveDashboard({
	searchParams,
}: ActiveDashboardPageProps) {
	const sp = await searchParams;
	const query = sp.query?.trim() ?? "";
	const page = parseInt(sp.page ?? "1", 10);
	const session = await auth();

	if (
		!session ||
		(session.user.role !== Role.SUPERVISOR &&
			session.user.role !== Role.PETITIONER)
	) {
		return null;
	}

	const { success, quoteInformations, pagination } = await getPendingQuotes(
		session.user.phone,
		session.user.role as Role,
		query,
		page,
		false
	);

	if (!success) {
		return null;
	}

	return (
		<>
			<div className="h-screen flex flex-col justify-start items-center overflow-y-auto ">
				<div className="w-full p-2 shadow-md mb-4 min-h-14 grid grid-cols-1 lg:grid-cols-3">
					<Searchbar
						route="/renders/dashboard"
						className="hidden lg:block ml-12 lg:w-56 w-28"
						initialQuery={query}
					/>
					<div className="flex justify-center items-center text-xl lg:text-3xl text-center">
						Cotizaciones Activas
					</div>
				</div>
				<div className="flex flex-wrap lg:flex-col items-center gap-4 justify-center">
					{quoteInformations && quoteInformations.length > 0 && (
						<>
							<PagePagination
								url="/renders/dashboard"
								page={pagination.page}
								totalPages={pagination.totalPages}
								query={query}
							/>
							{quoteInformations.map((quoteInformation) => (
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
						</>
					)}
				</div>
			</div>
		</>
	);
}
