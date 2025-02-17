"use client";

import QuoteInformationDisplay from "@/app/components/QuoteInformationDisplay";
import { useToast } from "@/hooks/use-toast";
import { getQuoteInformation } from "@/lib/storage/database";
import { QuoteInformationWithQuotes } from "@/lib/types";
import { QuoteInformation, Role } from "@prisma/client";
import { useParams, useSearchParams } from "next/navigation";
import { use, useEffect, useState } from "react";
import QuoteTable from "./QuoteTable";

export default function Page() {
	const { id } = useParams();

	if (!id || Array.isArray(id)) {
		return <div>Error: ID invalido</div>;
	}

	const searchParams = useSearchParams();
	const { toast } = useToast();
	const [loading, setLoading] = useState(true);
	const [notFound, setNotFound] = useState(false);
	const [quoteInformation, setQuoteInformation] =
		useState<QuoteInformationWithQuotes | null>(null);

	const fetchQuoteInformation = async () => {
		if (!id || typeof id !== "string") {
			setNotFound(true);
			setLoading(false);
			return;
		}

		try {
			const response = await getQuoteInformation(id);

			if (!response || !response.success) {
				setLoading(false);
				return;
			}
			if (!response.quoteInformation) {
				setNotFound(true);
				setLoading(false);
				return;
			}

			setQuoteInformation(response.quoteInformation);
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "An unknown error occurred.";
			toast({
				variant: "destructive",
				title: "Ocurrió un error",
				description: message,
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchQuoteInformation();
	}, [id]);

	if (loading) {
		return (
			<div className="w-full h-full flex justify-center items-center">
				Cargando...
			</div>
		);
	}

	if (notFound) {
		return <div>No se encontró la cotización</div>;
	}

	return (
		<div className="flex flex-col w-full h-full">
			<QuoteInformationDisplay
				quoteInformation={quoteInformation as QuoteInformation}
			/>
			{quoteInformation && (
				<QuoteTable quoteInformation={quoteInformation} />
			)}
		</div>
	);
}
