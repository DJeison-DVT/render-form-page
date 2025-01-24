import { QuoteInformation } from "@prisma/client";
import CompanyImage from "./CompanyImage";

const formatPhoneNumber = (phoneNumberString: string) => {
	const cleaned = ("" + phoneNumberString).replace(/\D/g, "");
	const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
	if (match) {
		return "(" + match[1] + ") " + match[2] + "-" + match[3];
	}
	return null;
};

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
									formatPhoneNumber(
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
									formatPhoneNumber(
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
			<div></div>
		</div>
	);
}
