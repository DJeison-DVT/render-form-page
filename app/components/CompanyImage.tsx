import Image from "next/image";

type Company = "alquipop" | "demente";

export default function CompanyImage({ company }: { company: string }) {
	if (!company) return null;
	if (!["alquipop", "demente"].includes(company)) return null;

	const srcs: Record<Company, string> = {
		alquipop: "/alquipop-logo.svg",
		demente: "/demente-logo.png",
	};

	const alts: Record<Company, string> = {
		alquipop: "alquipop",
		demente: "DeMente",
	};

	const key = company as Company;

	return (
		<div
			className="
        relative 
        w-12 h-12          /* base: 3rem */
        sm:w-16 sm:h-16    /* ≥640px: 4rem */
        md:w-20 md:h-20    /* ≥768px: 5rem */
        lg:w-24 lg:h-24    /* ≥1024px: 6rem */
        xl:w-28 xl:h-28    /* ≥1280px: 7rem */
      "
		>
			<Image
				src={srcs[key]}
				alt={alts[key]}
				fill
				style={{ objectFit: "contain" }}
			/>
		</div>
	);
}
