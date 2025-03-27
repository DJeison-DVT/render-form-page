import { QuoteInformation, Role, User } from "@prisma/client";
import CompanyImage from "./CompanyImage";
import { formatMexicanPhoneNumber } from "@/lib/utils";
import { getUserById } from "@/lib/storage/database";
import { useEffect, useState } from "react";
import { buildImageURL } from "@/lib/serverUtils";
import { FileSearch } from "lucide-react";
import { useSession } from "next-auth/react";

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
			<td className="border bg-slate-100 px-4 py-2 font-semibold">
				{title}:
			</td>
			<td className="border px-4 py-2">{value}</td>
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
		if (quoteInformation.providerId) {
			getUserById(quoteInformation.providerId).then((provider) =>
				setProvider(provider)
			);
		}
	}, [quoteInformation.providerId, quoteInformation.pdfUrl]);

	return (
		<div className="flex justify-around items-center p-8">
			<CompanyImage company={quoteInformation.company} size={150} />
			<div>
				<table className="table-auto border-collapse  w-full">
					<tbody>
						<tr>
							<TableInformation
								title="Fecha de la cotización"
								value={quoteInformation.createdAt.toLocaleDateString()}
							/>
						</tr>
						<tr>
							<TableInformation
								title="Numero de aprobación"
								value={
									formatMexicanPhoneNumber(
										quoteInformation.approvalContact
									) || ""
								}
							/>
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
								title="Número de solicitud"
								value={
									formatMexicanPhoneNumber(
										quoteInformation.requestContact
									) || ""
								}
							/>
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
			<div className="flex flex-col items-center gap-4 justify-center">
				{(session?.user?.role === Role.PETITIONER ||
					session?.user?.role === Role.SUPERVISOR) && (
					<div>
						Provedor:{" "}
						{provider
							? provider.name || provider.name
							: "No asignado"}
					</div>
				)}
				<div>
					{pdfUrl && (
						<a
							href={pdfUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center justify-center gap-2 bg-slate-400 text-white p-2 rounded-md"
						>
							Ver PDF
							<FileSearch size={32} />
						</a>
					)}
				</div>
			</div>
		</div>
	);
}
