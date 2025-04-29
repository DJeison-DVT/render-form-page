"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button"; // Replace with your shadcn-ui button
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableCell,
	TableHead,
} from "@/components/ui/table";
import { QuoteInformationWithQuotes, RoleTranslations } from "@/lib/types";
import ZoomableImage from "@/app/components/ZoomableImage";
import { CalendarArrowUp, UserRoundPen } from "lucide-react";

export default function QuoteTable({
	quoteInformation,
	users,
}: {
	quoteInformation: QuoteInformationWithQuotes;
	users: Record<string, string>;
}) {
	const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

	const quotes = quoteInformation.quotes;
	const currentQuote = quotes[currentQuoteIndex];

	// Function to cycle quotes
	const handleNextQuote = () => {
		setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
	};

	const handlePreviousQuote = () => {
		setCurrentQuoteIndex(
			(prev) => (prev - 1 + quotes.length) % quotes.length
		);
	};

	const BUCKET_URL = process.env.NEXT_PUBLIC_BUCKET_URL;

	return (
		<div className="flex justify-start h-full p-2 md:p-8 overflow-x-auto text-sm md:text-base">
			<div className="min-w-max md:space-y-4">
				<div className="flex justify-between items-center">
					{quotes.length > 1 ? (
						<>
							<div className="text-xl font-bold">
								Historial {currentQuoteIndex + 1} de{" "}
								{quotes.length}
							</div>
							<div className="space-x-2">
								<Button
									onClick={handlePreviousQuote}
									disabled={quotes.length <= 1}
								>
									Anterior
								</Button>
								<Button
									onClick={handleNextQuote}
									disabled={quotes.length <= 1}
								>
									Siguiente
								</Button>
							</div>
						</>
					) : (
						<div className="text-xl font-bold">Historial</div>
					)}
				</div>
				<div className="flex gap-2">
					<CalendarArrowUp />
					{new Date(currentQuote.createdAt).toLocaleString("es-MX", {
						year: "numeric",
						month: "2-digit",
						day: "2-digit",
						hour: "2-digit",
						minute: "2-digit",
						hour12: false,
					})}
				</div>
				<div className="flex gap-2">
					<UserRoundPen />
					{RoleTranslations[currentQuote.createdByRole]}
					{currentQuote.createdByRole === "PETITIONER" ? (
						<div>{users[quoteInformation.requestContact]}</div>
					) : (
						<div>{users[quoteInformation.approvalContact]}</div>
					)}
				</div>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Imagen</TableHead>
							<TableHead>Nombre</TableHead>
							<TableHead>Tamaños</TableHead>
							<TableHead>Concepto</TableHead>
							<TableHead>Cantidad</TableHead>
							<TableHead>Precio Unitario</TableHead>
							<TableHead>Precio DeMente</TableHead>
							<TableHead>Precio Final</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{currentQuote.entries.map((entry) => (
							<TableRow key={entry.id}>
								<TableCell>
									<div className="max-w-[100px] max-h-[100px] relative">
										{entry.imageUrl && BUCKET_URL ? (
											<ZoomableImage
												imageUrl={`${BUCKET_URL}${entry.imageUrl}`}
											/>
										) : (
											"Sin imagen"
										)}
									</div>
								</TableCell>
								<TableCell>{entry.name}</TableCell>
								<TableCell>{entry.sizes}</TableCell>
								<TableCell>{entry.concept}</TableCell>
								<TableCell>{entry.range}</TableCell>
								<TableCell>
									{entry.unitaryCost !== null
										? formatCurrencyMXN(entry.unitaryCost)
										: "N/A"}
								</TableCell>
								<TableCell>
									{entry.unitaryPrice !== null
										? formatCurrencyMXN(entry.unitaryPrice)
										: "N/A"}
								</TableCell>
								<TableCell>
									{entry.unitaryFinalPrice !== null
										? formatCurrencyMXN(
												entry.unitaryFinalPrice
										  )
										: "N/A"}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}

const formatCurrencyMXN = (value: number) => {
	return new Intl.NumberFormat("es-MX", {
		style: "currency",
		currency: "MXN",
	}).format(value);
};
