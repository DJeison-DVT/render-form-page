"use client";

import CompanyImage from "@/app/components/CompanyImage";
import EntryForm from "@/app/components/formPage/EntryForm";
import QuoteInformationDisplay from "@/app/components/QuoteInformationDisplay";
import Registered from "@/app/components/Registered";
import { initializeRenderUpload, RenderUploadSchema } from "@/app/Schemas";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import {
	createQuote,
	finalizeQuote,
	getQuoteInformation,
} from "@/lib/storage/database";
import { zodResolver } from "@hookform/resolvers/zod";
import { Quote, QuoteInformation, Role } from "@prisma/client";
import { CheckCheck, RefreshCw, Undo, Upload } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { useSession } from "next-auth/react";
import Loading from "@/components/Loading";
import CommentDialog from "@/app/components/CommentDialog";

export default function Confirmation() {
	const { id } = useParams();

	if (!id || Array.isArray(id)) {
		return <div>Error: ID invalido</div>;
	}

	const { data: session } = useSession();
	if (!session) {
		return <Loading />;
	}

	const searchParams = useSearchParams();
	const role = searchParams.get("role") as Role;
	const { toast } = useToast();
	const router = useRouter();

	const [loading, setLoading] = useState(true);
	const [disabled, setDisabled] = useState(false);
	const [notFound, setNotFound] = useState(false);
	const [registered, setRegistered] = useState(false);
	const [quote, setQuote] = useState<Quote>();

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
		if (!quote) {
			return;
		}

		values.createdByRole = role;
		if (form.formState.isValid) {
			try {
				setDisabled(true);
				await createQuote(id, quote.id, values);
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
			setDisabled(true);
			await finalizeQuote(id);
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

			const quoteInformation = {
				...response.quoteInformation,
				quote: response.quoteInformation.quotes[0],
				entries: response.quoteInformation.quotes[0]?.entries || [],
			};

			if (quoteInformation.finalizedAt) {
				router.push(`/renders/history/${id}`);
			}

			if (quoteInformation.quote.createdByRole === role) {
				setDisabled(true);
			}
			setQuote(quoteInformation.quote);

			const transformedData = {
				...quoteInformation,
				date: quoteInformation.createdAt.toISOString().split("T")[0],
				createdByRole: role,
				comment: "",
				entries: quoteInformation.entries.map((entry) => ({
					...entry,
					unitaryPrice: entry.unitaryPrice ?? 0,
					unitaryCost: entry.unitaryCost ?? 0,
					image: null,
				})),
			};

			form.reset(transformedData);
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

	useEffect(() => {
		fetchQuoteInformation();
	}, [id]);

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

	const handleUpload = async () => {
		const result = RenderUploadSchema.safeParse(form.getValues());
		if (result.success) {
			await onSubmitUpdate(form.getValues());
		}
	};

	return (
		<>
			{registered && quoteInformation ? (
				<Registered company={quoteInformation.company} />
			) : (
				<div className="h-screen overflow-y-hidden">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmitUpdate)}>
							{quoteInformation && (
								<QuoteInformationDisplay
									quoteInformation={quoteInformation}
								/>
							)}
							<div className="flex justify-center">
								<div className="w-fit">
									<EntryForm
										form={form}
										fieldArrayAppend={fieldArrayAppend}
										fieldArrayInsert={fieldArrayInsert}
										fieldArrayRemove={fieldArrayRemove}
										disabled={disabled}
									/>
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
													role === Role.VALIDATOR
												}
											>
												{role !== Role.VALIDATOR ? (
													<div>
														<RefreshCw />
														Actualizar
													</div>
												) : (
													<div>
														<Undo />
														Rechazar
													</div>
												)}
											</CommentDialog>
											{role === Role.VALIDATOR && (
												<div
													className={
														"cursor-pointer bg-gray-800/90 text-white rounded-md hover:bg-gray-700/90 gap-2 p-1 px-2 transition flex justify-center items-center text-xl"
													}
													onClick={() => {
														onSubmitFinalize();
													}}
												>
													<CheckCheck />
													Finalizar
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
