import CompanyImage from "@/app/components/CompanyImage";
import { getQuoteProvidersCount } from "@/lib/storage/database";
import { QuoteInformationWithQuotes } from "@/lib/types";
import { Role } from "@prisma/client";
import Link from "next/link";

interface QuoteCardProps {
	role: string;
	quoteInformation: QuoteInformationWithQuotes;
	link: string;
}

export default async function QuoteCard({
	role,
	quoteInformation,
	link,
}: QuoteCardProps) {
	const { total, providerMade } = quoteInformation.providerContact
		? { total: 0, providerMade: 0 }
		: await getQuoteProvidersCount(quoteInformation.id);

	return (
		<Link key={quoteInformation.id} href={link}>
			<div className="flex flex-col lg:flex-row justify-between items-center p-4 lg:w-[900px] w-80 border-2 rounded-md border-gray-300 text-lg">
				<div className="flex min-w-80 justify-center items-center ">
					<CompanyImage company={quoteInformation.company} />
					<div className="flex flex-col items-center lg:items-start justify-center px-4">
						<div className="font-bold text-xl">
							{quoteInformation.client}
						</div>
						<div>{quoteInformation.project}</div>
						<div>{quoteInformation.serial}</div>
					</div>
				</div>
				<div className="flex flex-col items-center text-center lg:text-end lg:items-end justify-center">
					<div>
						Fecha de Comienzo:{" "}
						{formatDateString(quoteInformation.createdAt)}
					</div>
					<div>
						Fecha de Entrega:{" "}
						{formatDateString(
							quoteInformation.estimatedDeliveryDate
						)}
					</div>
					{quoteInformation.quotes &&
						quoteInformation.quotes.length > 0 &&
						(role === Role.PETITIONER ||
							role === Role.VALIDATOR) && (
							<>
								{quoteInformation.providerContact ? (
									<div>
										Último cambio:{" "}
										{formatDateString(
											quoteInformation.quotes[0].createdAt
										)}
									</div>
								) : (
									<div>
										Cotizaciones de proveedores:{" "}
										{providerMade} de {total}
									</div>
								)}
							</>
						)}
				</div>
			</div>
		</Link>
	);
}

function formatDateString(date: Date): string {
	return new Intl.DateTimeFormat("es-MX", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false, // 24-hour format
		timeZone: "America/Mexico_City",
	}).format(date);
}
