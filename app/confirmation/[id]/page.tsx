"use client";

import EntryForm from "@/app/components/formPage/EntryForm";
import { initializeRenderUpload, RenderUploadSchema } from "@/app/Schemas";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { getQuoteInformation } from "@/lib/storage/database";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCheck, RefreshCw, Undo, Upload } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

export default function Confirmation() {
	const { id } = useParams();
	const { toast } = useToast();

	const [loading, setLoading] = useState(true);
	const [notFound, setNotFound] = useState(false);

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
			console.log(form.getValues());
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
