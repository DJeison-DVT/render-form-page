import CompanyImage from "@/app/components/CompanyImage";
import { QuoteInformationWithQuotes } from "@/lib/types";
import { Role } from "@prisma/client";
import Link from "next/link";

interface QuoteCardProps {
	role: string;
	quoteInformation: QuoteInformationWithQuotes;
	link: string;
}

export default function QuoteCard({
	role,
	quoteInformation,
	link,
}: QuoteCardProps) {
	return (
		<Link key={quoteInformation.id} href={link}>
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
					{quoteInformation.quotes.length > 0 &&
						(role === Role.PETITIONER ||
							role === Role.VALIDATOR) && (
							<>
								<div>
									Fecha de Comienzo:{" "}
									{formatDateString(
										quoteInformation.createdAt
									)}
								</div>
								{quoteInformation.providerId && (
									<>
										<div>
											Fecha de Actualizacion:{" "}
											{formatDateString(
												quoteInformation.quotes[0]
													.createdAt
											)}
										</div>
										<div>
											Cantidad de Listados:{" "}
											{
												quoteInformation.quotes[0]
													.entries.length
											}
										</div>
									</>
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
