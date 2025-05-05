import { QuoteInformation, Role, User } from "@prisma/client";
import CompanyImage from "./CompanyImage";
import { formatMexicanPhoneNumber } from "@/lib/utils";
import { getUserByPhone } from "@/lib/storage/database";
import { useEffect, useState } from "react";
import { buildImageURL } from "@/lib/serverUtils";
import { FileDown, FileSearch } from "lucide-react";
import { useSession } from "next-auth/react";

const sixHoursInMs = 6 * 60 * 60 * 1000;

export default function QuoteInformationDisplay({
	quoteInformation,
}: {
	quoteInformation: QuoteInformation;
}) {
	const TableInformation = ({
		title,
		value,
	}: {
		title: string;
		value: string;
	}) => (
		<>
			<td className="border bg-slate-100 md:px-4 md:py-2 font-semibold">
				{title}:
			</td>
			<td className="border md:px-4 md:py-2">{value}</td>
		</>
	);
	const [provider, setProvider] = useState<User | null>(null);
	const [pdfUrl, setPdfUrl] = useState<string | null>(null);
	const { data: session } = useSession();

	useEffect(() => {
		const buildPDFUrl = async () => {
			if (quoteInformation.pdfUrl) {
				const url = await buildImageURL(quoteInformation.pdfUrl);
				setPdfUrl(url);
			}
		};

		buildPDFUrl();
		if (quoteInformation.providerContact) {
			getUserByPhone(quoteInformation.providerContact).then((provider) =>
				setProvider(provider)
			);
		}
	}, [quoteInformation.providerContact, quoteInformation.pdfUrl]);

	const permittedRoles: Role[] = [Role.PETITIONER, Role.SUPERVISOR];
	const isPermitted = permittedRoles.includes(session?.user.role as Role);

	return (
		<div className="lg:flex-row flex-col flex justify-around items-center flex-1 pl-4 pt-8 md:p-8 gap-4 lg:gap-0 text-sm md:text-base">
			<div className="flex items-center justify-around w-full flex-1">
				<CompanyImage company={quoteInformation.company} />
				<div>
					<table className="table-auto border-collapse  w-full">
						<tbody>
							<tr>
								<TableInformation
									title="Fecha de entrega estimada"
									value={new Date(
										quoteInformation.estimatedDeliveryDate.getTime() +
											sixHoursInMs
									).toLocaleDateString()}
								/>
								{isPermitted && provider && (
									<TableInformation
										title="Proveedor"
										value={provider?.name}
									/>
								)}
							</tr>
							<tr>
								<TableInformation
									title="Fecha de la cotización"
									value={quoteInformation.createdAt.toLocaleDateString()}
								/>
								<TableInformation
									title="Número de solicitud"
									value={formatMexicanPhoneNumber(
										quoteInformation.requestContact
									)}
								/>
								{session?.user?.role !== Role.PROVIDER && (
									<TableInformation
										title="Numero de aprobación"
										value={formatMexicanPhoneNumber(
											quoteInformation.approvalContact
										)}
									/>
								)}
							</tr>
							<tr>
								<TableInformation
									title="Cliente"
									value={quoteInformation.client}
								/>
								<TableInformation
									title="Proyecto"
									value={quoteInformation.project}
								/>
							</tr>
							<tr>
								<TableInformation
									title="Marca"
									value={quoteInformation.brand}
								/>
								<TableInformation
									title="Serial"
									value={quoteInformation.serial}
								/>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
			<div className="flex flex-col items-center gap-2 md:gap-4 justify-center p-2">
				{pdfUrl && (
					<a
						href={pdfUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center justify-center gap-2 bg-slate-400 text-white p-2 rounded-md"
					>
						<FileSearch size={32} />
						PDF de Render
					</a>
				)}
				{isPermitted && quoteInformation.finalizedAt && (
					<>
						<div
							onClick={() =>
								window.open(
									`/api/generate-quote?quoteId=${quoteInformation.id}`,
									"_blank"
								)
							}
							className="flex items-center justify-center gap-2 bg-slate-400 text-white p-2 rounded-md cursor-pointer"
						>
							<FileDown size={32} />
							Cotización
						</div>
					</>
				)}
			</div>
		</div>
	);
}
