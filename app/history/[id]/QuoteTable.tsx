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
import { QuoteInformationWithQuotes } from "@/lib/types";

export default function QuoteTable({
	quoteInformation,
}: {
	quoteInformation: QuoteInformationWithQuotes;
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

	return (
		<div className="flex justify-center h-full p-8">
			<div className="space-y-4 max-w-screen-2xl flex-1">
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

				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Imagen</TableHead>
							<TableHead>Nombre</TableHead>
							<TableHead>Tamaños</TableHead>
							<TableHead>Concepto</TableHead>
							<TableHead>Cantidad</TableHead>
							<TableHead>Precio Unitario</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{currentQuote.entries.map((entry) => (
							<TableRow key={entry.id}>
								<TableCell>
									{entry.imageUrl ? (
										<img
											src={entry.imageUrl}
											alt={entry.name}
											className="h-12 w-12 object-cover rounded"
										/>
									) : (
										"No Image"
									)}
								</TableCell>
								<TableCell>{entry.name}</TableCell>
								<TableCell>{entry.sizes}</TableCell>
								<TableCell>{entry.concept}</TableCell>
								<TableCell>{entry.range}</TableCell>
								<TableCell>
									{entry.unitaryPrice !== null
										? `$${entry.unitaryPrice.toFixed(2)}`
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
