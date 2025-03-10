"use client";

import EntryForm from "@/app/components/formPage/EntryForm";
import QuoteInformationDisplay from "@/app/components/QuoteInformationDisplay";
import Registered from "@/app/components/Registered";
import { initializeRenderUpload, RenderUploadSchema } from "@/app/Schemas";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import {
	createProviderQuote,
	getQuoteProviders,
	selectProvider,
} from "@/lib/storage/database";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Quote, QuoteInformation, Role } from "@prisma/client";
import { CheckCheck, Undo, Upload } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import CommentDialog from "@/app/components/CommentDialog";
import { useSession } from "next-auth/react";
import Loading from "@/components/Loading";
import { QuoteWithEntries } from "@/lib/types";

interface InformationProviderQuotes
	extends Record<string, QuoteWithEntries[]> {}

export default function ProviderConfirmation() {
	const { id } = useParams();

	if (!id || Array.isArray(id)) {
		return <div>Error: ID invalido</div>;
	}

	const { data: session } = useSession();
	if (!session) {
		return <Loading />;
	}
	const role = session.user.role as Role;
	const name = session.user.name;
	const userId = session.user.id;

	if (role === Role.VALIDATOR) {
		return <div>Error: No tienes permiso para acceder a esta página</div>;
	}

	const { toast } = useToast();

	const [loading, setLoading] = useState(true);
	const [disabled, setDisabled] = useState(false);
	const [notFound, setNotFound] = useState(false);
	const [registered, setRegistered] = useState(false);
	const [quote, setQuote] = useState<Quote>();
	const [provider, setProvider] = useState<string>();
	const [providers, setProviders] = useState<InformationProviderQuotes>();
	const [quoteInformation, setQuoteInformation] =
		useState<QuoteInformation>();

	const form = useForm<z.infer<typeof RenderUploadSchema>>({
		resolver: zodResolver(RenderUploadSchema),
		defaultValues: initializeRenderUpload(session.user.phone),
	});

	const {
		fields,
		append: fieldArrayAppend,
		insert: fieldArrayInsert,
		remove: fieldArrayRemove,
	} = useFieldArray({
		control: form.control,
		name: "entries",
	});

	const onSubmitUpdate = async (
		values: z.infer<typeof RenderUploadSchema>
	) => {
		console.log("Updating quote");
		if (!userId) {
			return;
		}

		values.createdByRole = role;
		if (form.formState.isValid) {
			try {
				setDisabled(true);
				await createProviderQuote(id, userId, values, {
					rejectedQuoteId: quote?.id,
				});
				setRegistered(true);
				form.reset();
				setDisabled(false);
			} catch (error) {
				const message = error instanceof Error ? error.message : "";
				toast({
					variant: "destructive",
					title: "Ocurrió un error",
					description: message,
				});
			}
		}
	};

	const onSubmitFinalize = async () => {
		try {
			if (!quote || !quote.providerQuotesUserId) {
				return;
			}

			setDisabled(true);
			await selectProvider(id, quote.providerQuotesUserId);
			setRegistered(true);
			form.reset();
			setDisabled(false);
		} catch (error) {
			const message = error instanceof Error ? error.message : "";
			toast({
				variant: "destructive",
				title: "Ocurrió un error",
				description: message,
			});
		}
	};

	const fetchQuoteInformation = async () => {
		if (!id || typeof id !== "string") {
			setNotFound(true);
			setLoading(false);
			return;
		}

		try {
			const response = await getQuoteProviders(id);

			if (!response || !response.success) {
				setLoading(false);
				return;
			}
			if (!response.quoteInformation) {
				setNotFound(true);
				setLoading(false);
				return;
			}

			let providerQuotes: InformationProviderQuotes = {};
			let hasQuotes = false;

			for (const provider of response.quoteInformation.ProviderQuotes) {
				if (provider.user.name === name) {
					// delete all of the others if the access is from the provider
					providerQuotes = {};
					providerQuotes[
						provider.user.company || provider.user.name
					] = provider.quotes;
					break;
				}
				if (provider.quotes.length > 0) {
					hasQuotes = true;
				}
				providerQuotes[provider.user.company || provider.user.name] =
					provider.quotes;
			}

			const providers = Object.keys(providerQuotes);
			if (providers.length === 0) {
				setNotFound(true);
				setLoading(false);
				return;
			}

			setProviders(providerQuotes);
			setProvider(providers[0]);

			if (!hasQuotes && role === Role.PETITIONER) {
				setNotFound(true);
			}

			setQuoteInformation(quoteInformation);
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

	const handleUpload = async () => {
		const result = RenderUploadSchema.safeParse(form.getValues());
		if (result.success) {
			await onSubmitUpdate(form.getValues());
		}
	};

	const updateDisplayQuote = () => {
		if (!provider || !providers) {
			return;
		}

		const quote = providers[provider][0];
		if (!quote) {
			return;
		}

		setQuote(quote);
		const transformedData = {
			...quoteInformation,
			createdByRole: role,
			comment: "",
			entries: quote.entries.map((entry) => ({
				...entry,
				unitaryPrice: entry.unitaryPrice ?? 0,
				unitaryCost: entry.unitaryCost ?? 0,
				unitaryFinalPrice: entry.unitaryFinalPrice ?? 0,
				image: null,
			})),
		};
		form.reset(transformedData);
	};

	useEffect(() => {
		fetchQuoteInformation();
	}, [id]);

	useEffect(() => {
		updateDisplayQuote();
	}, [provider]);

	if (loading) {
		return (
			<div className="flex justify-center items-center h-screen">
				<p>Loading...</p>
			</div>
		);
	}

	if (notFound) {
		return (
			<div className="flex justify-center items-center h-screen">
				<p>No se encontró la cotización.</p>
			</div>
		);
	}

	return (
		<>
			{registered && quoteInformation ? (
				<Registered company={quoteInformation.company} />
			) : (
				<div className="h-screen overflow-y-hidden p-4">
					<div className="m-2 flex justify-end">
						{providers && Object.keys(providers).length > 1 && (
							<Select
								value={provider}
								onValueChange={setProvider}
							>
								<SelectTrigger className="max-w-[180px]">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{Object.keys(providers).map((provider) => (
										<SelectItem
											key={provider}
											value={provider}
										>
											{provider}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					</div>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmitUpdate)}>
							{quoteInformation && (
								<QuoteInformationDisplay
									quoteInformation={quoteInformation}
								/>
							)}
							<div>{quote?.comment}</div>
							<div className="flex justify-center">
								<div className="w-fit">
									{role && (
										<EntryForm
											form={form}
											fieldArrayAppend={fieldArrayAppend}
											fieldArrayInsert={fieldArrayInsert}
											fieldArrayRemove={fieldArrayRemove}
											disabled={disabled}
											role={role}
										/>
									)}
								</div>
							</div>
							<div className="fixed bottom-4 right-4 flex justify-end gap-4">
								<div className="flex gap-2">
									{quote?.createdByRole !== role && (
										<>
											<CommentDialog
												form={form}
												disabled={disabled}
												upload={handleUpload}
												rejection={
													role === Role.PETITIONER
												}
											>
												{role !== Role.PETITIONER ? (
													<div
														className={`cursor-pointer bg-gray-800/90 text-white rounded-md hover:bg-gray-700/90 gap-2 p-1 px-2 transition flex justify-center items-center text-xl ${
															form.formState
																.isValid
																? ""
																: "opacity-50 pointer-events-none"
														}`}
													>
														<Upload />
														Entregar
													</div>
												) : (
													<div
														className={`cursor-pointer bg-gray-800/90 text-white rounded-md hover:bg-gray-700/90 gap-2 p-1 px-2 transition flex justify-center items-center text-xl ${
															form.formState
																.isValid
																? ""
																: "opacity-50 pointer-events-none"
														}`}
													>
														<Undo />
														Rechazar
													</div>
												)}
											</CommentDialog>
											{role === Role.PETITIONER && (
												<div
													className={
														"cursor-pointer bg-gray-800/90 text-white rounded-md hover:bg-gray-700/90 gap-2 p-1 px-2 transition flex justify-center items-center text-xl"
													}
													onClick={() => {
														onSubmitFinalize();
													}}
												>
													<CheckCheck />
													Seleccionar
												</div>
											)}
										</>
									)}
								</div>
							</div>
						</form>
					</Form>
				</div>
			)}
		</>
	);
}
