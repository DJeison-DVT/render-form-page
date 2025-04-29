import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchbarProps {
	route: string;
	initialQuery?: string;
	className?: string;
}

export default function Searchbar({
	route,
	initialQuery = "",
	className,
}: SearchbarProps) {
	return (
		<form action={route} method="get" className={className}>
			<Input
				name="query"
				defaultValue={initialQuery}
				icon={<Search size={16} />}
				placeholder="Buscar…"
				aria-label="Buscar"
			/>
		</form>
	);
}
