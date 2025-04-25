import { Button } from "@/components/ui/button";
import CompanyImage from "./CompanyImage";
import Link from "next/link";

export default function Registered({ company }: { company: string }) {
	return (
		<div className="flex flex-col items-center justify-center h-screen">
			<h2 className="text-2xl font-bold mb-4">
				¡Gracias por tu cotización!
			</h2>
			<CompanyImage company={company} />
			<p>En breve nos pondremos en contacto contigo.</p>
			<Button className="mt-4">
				<Link href="/renders/dashboard">Ir al dashboard</Link>
			</Button>
		</div>
	);
}
