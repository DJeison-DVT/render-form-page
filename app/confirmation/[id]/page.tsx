"use client";

import CompanyImage from "@/app/components/CompanyImage";
import EntryForm from "@/app/components/formPage/EntryForm";
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
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

const formatPhoneNumber = (phoneNumberString: string) => {
	const cleaned = ("" + phoneNumberString).replace(/\D/g, "");
	const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
	if (match) {
		return "(" + match[1] + ") " + match[2] + "-" + match[3];
	}
	return null;
};

export default function Confirmation() {
	const { id } = useParams();

	if (!id || Array.isArray(id)) {
		return <div>Error: ID invalido</div>;
	}

	const searchParams = useSearchParams();
	const role = searchParams.get("role") as Role;
	const { toast } = useToast();

	const [loading, setLoading] = useState(true);
	const [disabled, setDisabled] = useState(false);
	const [notFound, setNotFound] = useState(false);
	const [registered, setRegistered] = useState(false);
	const [quote, setQuote] = useState<Quote>();

	const [quoteInformation, setQuoteInformation] =
		useState<QuoteInformation>();

	const form = useForm<z.infer<typeof RenderUploadSchema>>({
		resolver: zodResolver(RenderUploadSchema),
		defaultValues: initializeRenderUpload(),
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

			const transformedData = {
				approvalContact: quoteInformation.approvalContact,
				requestContact: quoteInformation.requestContact,
				date: quoteInformation.createdAt.toISOString().split("T")[0],
				company: quoteInformation.company,
				createdByRole: role,
				entries: quoteInformation.entries.map((entry) => ({
					name: entry.name,
					sizes: entry.sizes,
					concept: entry.concept,
					range: entry.range,
					unitaryPrice: entry.unitaryPrice ?? 0,
					image: null,
				})),
			};

			form.reset(transformedData);
			setQuoteInformation(quoteInformation);
			setQuote(quoteInformation.quote);
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

	return (
		<>
			{registered && quoteInformation ? (
				<Registered company={quoteInformation.company} />
			) : (
				<div className="h-screen overflow-y-hidden">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmitUpdate)}>
							{quoteInformation && (
								<div className="flex justify-around items-center p-4">
									<CompanyImage
										company={quoteInformation.company}
										size={200}
									/>
									<div>
										<table className="table-auto border-collapse border border-gray-200 w-full">
											<tbody>
												<tr>
													<td className="border border-gray-200 px-4 py-2 font-semibold">
														Fecha de la cotización:
													</td>
													<td className="border border-gray-200 px-4 py-2">
														{quoteInformation.createdAt.toLocaleDateString()}
													</td>
												</tr>
												<tr>
													<td className="border border-gray-200 px-4 py-2 font-semibold">
														Número de aprobación:
													</td>
													<td className="border border-gray-200 px-4 py-2">
														{formatPhoneNumber(
															quoteInformation.approvalContact
														)}
													</td>
												</tr>
												<tr>
													<td className="border border-gray-200 px-4 py-2 font-semibold">
														Número de solicitud:
													</td>
													<td className="border border-gray-200 px-4 py-2">
														{formatPhoneNumber(
															quoteInformation.requestContact
														)}
													</td>
												</tr>
											</tbody>
										</table>
									</div>
									<div></div>
								</div>
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
											{role === Role.PETITIONER && (
												<button
													className={`cursor-pointer bg-gray-800/90 text-white rounded-md hover:bg-gray-700/90 gap-2 p-1 px-2 transition flex justify-center items-center text-xl ${
														form.formState.isValid
															? ""
															: "opacity-50 pointer-events-none"
													}`}
												>
													<RefreshCw />
													Actualizar
												</button>
											)}
											{role === Role.VALIDATOR && (
												<>
													<button
														className={`cursor-pointer bg-gray-800/90 text-white rounded-md hover:bg-gray-700/90 gap-2 p-1 px-2 transition flex justify-center items-center text-xl ${
															form.formState
																.isValid
																? ""
																: "opacity-50 pointer-events-none"
														}`}
														type="submit"
													>
														<Undo />
														Rechazar
													</button>
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
												</>
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
