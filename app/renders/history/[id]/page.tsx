"use client";

import QuoteInformationDisplay from "@/app/components/QuoteInformationDisplay";
import { useToast } from "@/hooks/use-toast";
import { getQuoteInformation } from "@/lib/storage/database";
import { QuoteInformationWithQuotes } from "@/lib/types";
import { QuoteInformation } from "@prisma/client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import QuoteTable from "./QuoteTable";
import Loading from "@/components/Loading";

export default function Page() {
	const { id } = useParams();

	const { toast } = useToast();
	const [loading, setLoading] = useState(true);
	const [notFound, setNotFound] = useState(false);
	const [quoteInformation, setQuoteInformation] =
		useState<QuoteInformationWithQuotes | null>(null);
	const [users, setUsers] = useState<Record<string, string>>({});

	useEffect(() => {
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

				const quoteInformation = response.quoteInformation;

				setQuoteInformation(quoteInformation);
				const contactUsers: Record<string, string> = {
					[quoteInformation.approvalContact]:
						quoteInformation.approver.name,
					[quoteInformation.requestContact]:
						quoteInformation.requester.name,
					...(quoteInformation.providerContact &&
					quoteInformation.provider
						? {
								[quoteInformation.providerContact]:
									quoteInformation.provider.name,
						  }
						: {}),
				};

				setUsers(contactUsers);
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

		fetchQuoteInformation();
	}, [id, toast]);

	if (!id || Array.isArray(id)) {
		return <div>Error: ID invalido</div>;
	}

	if (loading) {
		return (
			<div className="w-full h-full flex justify-center items-center">
				<Loading />
			</div>
		);
	}

	if (notFound) {
		return <div>No se encontró la cotización</div>;
	}

	return (
		<div className="flex flex-col w-screen h-screen overflow-auto">
			<QuoteInformationDisplay
				quoteInformation={quoteInformation as QuoteInformation}
			/>
			{quoteInformation && (
				<QuoteTable quoteInformation={quoteInformation} users={users} />
			)}
		</div>
	);
}
