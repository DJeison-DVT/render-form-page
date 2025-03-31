"use client";

import EntryForm from "@/app/components/formPage/EntryForm";
import QuoteInformationDisplay from "@/app/components/QuoteInformationDisplay";
import Registered from "@/app/components/Registered";
import {
	initializeEntry,
	initializeRenderUpload,
	RenderUploadSchema,
} from "@/app/Schemas";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import {
	createProviderQuote,
	getQuoteProviders,
	saveProvider,
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

type Provider = Record<string, string>;

type InformationProviderQuotes = Record<string, QuoteWithEntries | null>;

export default function ProviderConfirmation() {
	const { id } = useParams();
	const { data: session } = useSession();
	const role = session?.user?.role as Role;
	const phone = session?.user?.phone;

	const { toast } = useToast();

	const [loading, setLoading] = useState(true);
	const [disabled, setDisabled] = useState(false);
	const [notFound, setNotFound] = useState(false);
	const [registered, setRegistered] = useState(false);
	const [quote, setQuote] = useState<Quote>();
	const [provider, setProvider] = useState<string>();
	const [providerIds, setProviderIds] = useState<Provider>();
	const [providers, setProviders] = useState<InformationProviderQuotes>();
	const [quoteInformation, setQuoteInformation] =
		useState<QuoteInformation>();

	const form = useForm<z.infer<typeof RenderUploadSchema>>({
		resolver: zodResolver(RenderUploadSchema),
		defaultValues: initializeRenderUpload(session?.user?.phone ?? ""),
	});

	const {
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
		if (!id || Array.isArray(id)) {
			return <div>Error: ID invalido</div>;
		}

		for (const entry of values.entries) {
			if (typeof entry.unitaryCost === "string") {
				entry.unitaryCost = parseFloat(entry.unitaryCost);
			}
			if (typeof entry.unitaryPrice === "string") {
				entry.unitaryPrice = parseFloat(entry.unitaryPrice);
			}
			if (typeof entry.unitaryFinalPrice === "string") {
				entry.unitaryFinalPrice = parseFloat(entry.unitaryFinalPrice);
			}
		}

		setDisabled(true);
		values.createdByRole = role;
		if (form.formState.isValid && providerIds && provider) {
			try {
				console.log(providerIds[provider]);
				await createProviderQuote(id, providerIds[provider], values, {
					rejectedQuoteId: quote?.id,
				});
				setRegistered(true);
				form.reset();
			} catch (error) {
				const message = error instanceof Error ? error.message : "";
				toast({
					variant: "destructive",
					title: "Ocurrió un error",
					description: message,
				});
			}
		}
		setDisabled(false);
	};

	const onSubmitFinalize = async (
		values: z.infer<typeof RenderUploadSchema>
	) => {
		if (!id || Array.isArray(id)) {
			return <div>Error: ID invalido</div>;
		}

		for (const entry of values.entries) {
			if (typeof entry.unitaryCost === "string") {
				entry.unitaryCost = parseFloat(entry.unitaryCost);
			}
			if (typeof entry.unitaryPrice === "string") {
				entry.unitaryPrice = parseFloat(entry.unitaryPrice);
			}
			if (typeof entry.unitaryFinalPrice === "string") {
				entry.unitaryFinalPrice = parseFloat(entry.unitaryFinalPrice);
			}
		}
		setDisabled(true);
		try {
			if (quote && form.formState.isValid && providerIds && provider) {
				await saveProvider(id, providerIds[provider], values, {
					rejectedQuoteId: quote.id,
				});
				setRegistered(true);
				form.reset();
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : "";
			toast({
				variant: "destructive",
				title: "Ocurrió un error",
				description: message,
			});
		}
		setDisabled(false);
	};

	const handleUpload = async () => {
		const result = RenderUploadSchema.safeParse(form.getValues());
		if (result.success) {
			await onSubmitUpdate(form.getValues());
		}
	};

	useEffect(() => {
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

				const quoteInformation = response.quoteInformation;
				if (
					quoteInformation.providerId ||
					quoteInformation.stage !== "QUOTING"
				) {
					setNotFound(true);
					setLoading(false);
					return;
				}
				form.setValue("brand", quoteInformation.brand);
				form.setValue("client", quoteInformation.client);
				form.setValue("company", quoteInformation.company);
				form.setValue("project", quoteInformation.project);
				form.setValue(
					"requestContact",
					quoteInformation.requestContact
				);
				form.setValue("serial", quoteInformation.serial);

				let providerQuotes: InformationProviderQuotes = {};
				let hasQuotes = false;
				const providerIds: Provider = {};

				for (const provider of quoteInformation.ProviderQuotes) {
					const alias = provider.user.company || provider.user.name;
					if (!Object.keys(providerQuotes).includes(alias)) {
						providerQuotes[alias] = null;
						providerIds[alias] = provider.user.id;
					}

					if (provider.user.phone === phone) {
						providerQuotes = {};
						providerQuotes[alias] = null;
						if (provider.quote) {
							providerQuotes[
								provider.user.company || provider.user.name
							] = provider.quote;
						}
						break;
					}
					if (provider.quote) {
						hasQuotes = true;
					}

					if (provider.quote) {
						providerQuotes[
							provider.user.company || provider.user.name
						] = provider.quote;
					}
				}

				const providers = Object.keys(providerQuotes);
				if (providers.length === 0) {
					setNotFound(true);
					setLoading(false);
					return;
				}

				setProviders(providerQuotes);
				setProviderIds(providerIds);
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

		fetchQuoteInformation();
	}, [id, form, phone, role, toast]);

	useEffect(() => {
		const updateDisplayQuote = () => {
			if (!provider || !providers) {
				return;
			}
			const quote = providers[provider];
			if (quote) {
				setQuote(quote);
			}

			const transformedData = {
				...quoteInformation,
				createdByRole: role,
				comment: quote?.comment ?? "",
				entries: quote
					? quote.entries.map((entry) => ({
							...entry,
							unitaryPrice: entry.unitaryPrice ?? 0,
							unitaryCost: entry.unitaryCost ?? 0,
							unitaryFinalPrice: entry.unitaryFinalPrice ?? 0,
							image: null,
							imageUrl: entry.imageUrl ?? null,
					  }))
					: [initializeEntry()],
			};
			form.reset(transformedData);
		};

		updateDisplayQuote();
	}, [provider, form, providers, quoteInformation, role]);

	if (!id || Array.isArray(id)) {
		return <div>Error: ID invalido</div>;
	}

	if (!session) {
		return <Loading />;
	}

	if (role === Role.VALIDATOR) {
		return (
			<div>
				Error: No tienes permiso para acceder a esta página Validador
			</div>
		);
	}

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
													className={`cursor-pointer bg-gray-800/90 text-white rounded-md hover:bg-gray-700/90 gap-2 p-1 px-2 transition flex justify-center items-center text-xl ${
														form.formState.isValid
															? ""
															: "opacity-50 pointer-events-none"
													}`}
													onClick={() => {
														onSubmitFinalize(
															form.getValues()
														);
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
