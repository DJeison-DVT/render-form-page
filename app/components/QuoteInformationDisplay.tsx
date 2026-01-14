import { QuoteInformation, Role, User } from "@prisma/client";
import CompanyImage from "./CompanyImage";
import { formatMexicanPhoneNumber } from "@/lib/utils";
import { GetUser } from "@/lib/storage/users";
import { useEffect, useState } from "react";
import { buildImageURL } from "@/lib/serverUtils";
import { FileSearch } from "lucide-react";
import { useSession } from "next-auth/react";
import { GenerateQuote } from "./GenerateQuote";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { DisableQuote, EnableQuote } from "@/lib/storage/database";

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
	const { toast } = useToast();

	const handleToggleActive = async (active: boolean) => {
		try {
			if (active) {
				await EnableQuote(quoteInformation.id);
				toast({ title: "Cotización activada" });
			} else {
				await DisableQuote(quoteInformation.id);
				toast({ title: "Cotización desactivada" });
			}
			window.location.reload();
		} catch (error) {
			console.error(error);
			toast({
				title: "Error al actualizar estado",
				variant: "destructive",
			});
		}
	};

	useEffect(() => {
		const buildPDFUrl = async () => {
			if (quoteInformation.pdfUrl) {
				const url = await buildImageURL(quoteInformation.pdfUrl);
				setPdfUrl(url);
			}
		};

		buildPDFUrl();
		if (quoteInformation.providerContact) {
			GetUser(quoteInformation.providerContact).then((provider) =>
				setProvider(provider)
			);
		}
	}, [quoteInformation.providerContact, quoteInformation.pdfUrl]);

	const permittedRoles: Role[] = [
		Role.PETITIONER,
		Role.SUPERVISOR,
		Role.SUPERVISOR,
	];
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
					<GenerateQuote
						quoteURL={`/api/generate-quote?quoteId=${quoteInformation.id}`}
					/>
				)}
				{!isPermitted && quoteInformation.providerContact && (
					<GenerateQuote
						quoteURL={`/api/generate-quote?quoteId=${quoteInformation.id}&provider=true`}
					/>
				)}
				{(session?.user.role as Role) === Role.PETITIONER &&
					!quoteInformation.finalizedAt &&
					(quoteInformation.active ? (
						<Button
							onClick={() => handleToggleActive(false)}
							variant="destructive"
						>
							Desactivar Cotización
						</Button>
					) : (
						<Button onClick={() => handleToggleActive(true)}>
							Activar Cotización
						</Button>
					))}
			</div>
		</div>
	);
}
