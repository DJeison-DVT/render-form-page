import Image from "next/image";

type Company = "alquipop" | "demente";

export default function CompanyImage({
	company,
	size,
}: {
	company: string;
	size?: number;
}) {
	if (!company) return null;

	const isValidCompany = (value: string): value is Company =>
		["alquipop", "demente"].includes(value);

	if (!isValidCompany(company)) return null;

	const alts: Record<Company, string> = {
		alquipop: "alquipop",
		demente: "DeMente",
	};

	const srcs: Record<Company, string> = {
		alquipop: "/alquipop-logo.svg",
		demente: "/demente-logo.png",
	};

	return (
		<Image
			src={srcs[company]}
			alt={alts[company]}
			width={size}
			height={size}
		/>
	);
}
