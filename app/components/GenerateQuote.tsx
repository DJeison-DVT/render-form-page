import { FileDown } from "lucide-react";

interface GenerateQuoteProps {
	quoteURL: string;
}

export const GenerateQuote: React.FC<GenerateQuoteProps> = ({ quoteURL }) => {
	const handleClick = () => {
		window.open(quoteURL, "_blank");
	};

	return (
		<div
			onClick={handleClick}
			className="flex items-center justify-center gap-2 bg-slate-400 text-white p-2 rounded-md cursor-pointer"
		>
			<FileDown size={32} />
			Cotización
		</div>
	);
};
