import CompanyImage from "@/app/components/CompanyImage";
import { QuoteInformationWithQuotes } from "@/lib/types";
import Link from "next/link";

interface QuoteCardProps {
	quoteInformation: QuoteInformationWithQuotes;
}

export default function QuoteCard({ quoteInformation }: QuoteCardProps) {
	const quote = quoteInformation.quotes[0];
	const entriesLength = quote.entries.length;
	return (
		<Link
			key={quoteInformation.id}
			href={`/renders/confirmation/${quoteInformation.id}`}
		>
			<div className="flex justify-between items-center p-4 w-[900px] border-2 rounded-md border-gray-300 text-lg">
				<div className="flex min-w-80">
					<CompanyImage
						company={quoteInformation.company}
						size={124}
					/>
					<div className="flex flex-col items-start justify-center px-4">
						<div className="font-bold text-xl">
							{quoteInformation.client}
						</div>
						<div>{quoteInformation.project}</div>
						<div>{quoteInformation.serial}</div>
					</div>
				</div>
				<div className="flex flex-col items-end justify-center">
					<div>
						Fecha de Comienzo: {formatDateString(quote.createdAt)}
					</div>
					<div>
						Fecha de Actualizacion:{" "}
						{formatDateString(quote.createdAt)}
					</div>
					<div>Cantidad de Opciones: {entriesLength}</div>
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
