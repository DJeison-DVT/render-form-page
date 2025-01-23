"use client";

import CompanyImage from "@/app/components/CompanyImage";
import EntryForm from "@/app/components/formPage/EntryForm";
import { initializeRenderUpload, RenderUploadSchema } from "@/app/Schemas";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { getQuoteInformation } from "@/lib/storage/database";
import { zodResolver } from "@hookform/resolvers/zod";
import { QuoteInformation } from "@prisma/client";
import { CheckCheck, RefreshCw, Undo, Upload } from "lucide-react";
import { useParams } from "next/navigation";
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
	const { toast } = useToast();

	const [loading, setLoading] = useState(true);
	const [notFound, setNotFound] = useState(false);

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
				console.log(response);
				setNotFound(true);
				setLoading(false);
				return;
			}
			const quoteInformation = {
				...response.quoteInformation,
				quote: response.quoteInformation.quotes[0],
				entries: response.quoteInformation.quotes[0]?.entries || [],
			};

			form.reset(quoteInformation);
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

	const onSubmit = async (values: z.infer<typeof RenderUploadSchema>) => {
		console.log(`updating ${id}`, values);
	};

	return (
		<div className="h-screen overflow-y-hidden">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
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
							/>
						</div>
					</div>
					<div className="fixed bottom-4 right-4 flex justify-end gap-4">
						<div className="flex gap-2">
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
							<button
								className={`cursor-pointer bg-gray-800/90 text-white rounded-md hover:bg-gray-700/90 gap-2 p-1 px-2 transition flex justify-center items-center text-xl ${
									form.formState.isValid
										? ""
										: "opacity-50 pointer-events-none"
								}`}
							>
								<Undo />
								Rechazar
							</button>
							<button
								className={`cursor-pointer bg-gray-800/90 text-white rounded-md hover:bg-gray-700/90 gap-2 p-1 px-2 transition flex justify-center items-center text-xl ${
									form.formState.isValid
										? ""
										: "opacity-50 pointer-events-none"
								}`}
							>
								<CheckCheck />
								Finalizar
							</button>
						</div>
					</div>
				</form>
			</Form>
		</div>
	);
}
