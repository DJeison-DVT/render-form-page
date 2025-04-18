"use client";

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
import { CheckCheck, Undo } from "lucide-react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import CommentDialog from "@/app/components/CommentDialog";
import { useSession } from "next-auth/react";
import Loading from "@/components/Loading";
import ChangeAprovalContact from "./components/ChangeAprovalContact";

export default function Confirmation() {
	const { id } = useParams();

	const { data: session } = useSession();

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

	const role = session?.user?.role;

	const onSubmitUpdate = async (
		values: z.infer<typeof RenderUploadSchema>,
		accepted: boolean = false
	) => {
		if (!quote || !role || !id || Array.isArray(id)) {
			return;
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

		values.createdByRole = role as Role;

		if (!accepted) {
			for (const entry of values.entries) {
				entry.unitaryFinalPrice = 0;
			}
		} else {
			if (!checkAmountsNotZero()) {
				return;
			}
		}

		setDisabled(true);
		if (form.formState.isValid) {
			try {
				await createQuote(id, values, quote.id);
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

	const handleUpload = async () => {
		const result = RenderUploadSchema.safeParse(form.getValues());
		if (result.success) {
			await onSubmitUpdate(form.getValues());
		}
	};

	const handleAccept = async () => {
		const result = RenderUploadSchema.safeParse(form.getValues());
		if (result.success) {
			form.setValue("comment", "");
			if (role === Role.VALIDATOR) {
				await onSubmitUpdate(form.getValues(), true);
			} else {
				await onSubmitFinalize();
			}
		}
	};

	const checkAmountsNotZero = () => {
		let amountsAreNotZero = true;
		for (const entry of form.getValues().entries) {
			if (
				entry.unitaryCost === 0 ||
				entry.unitaryPrice === 0 ||
				entry.unitaryFinalPrice === 0
			) {
				amountsAreNotZero = false;
				break;
			}
		}

		if (!amountsAreNotZero) {
			toast({
				variant: "destructive",
				title: "Error",
				description: "Los valores no pueden ser cero",
			});
			return false;
		}
		return true;
	};

	const onSubmitFinalize = async () => {
		if (!id || Array.isArray(id)) {
			return;
		}

		if (!checkAmountsNotZero()) {
			return;
		}

		setDisabled(true);
		try {
			await finalizeQuote(id);
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
		setDisabled(false);
	};

	const fetchQuoteInformation = async () => {
		if (!id || typeof id !== "string") {
			setNotFound(true);
			setLoading(false);
			return;
		}

		if (!role) {
			setNotFound(true);
			setLoading(false);
			return;
		}

		try {
			const response = await getQuoteInformation(id, true);

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

			if (!quoteInformation.providerId) {
				setNotFound(true);
				return;
			}

			if (quoteInformation.finalizedAt) {
				router.push(`/renders/history/${id}`);
				return;
			}

			if (quoteInformation.quote.createdByRole === role) {
				setDisabled(true);
			}

			setQuote(quoteInformation.quote);

			const transformedData = {
				...quoteInformation,
				date: quoteInformation.createdAt.toISOString().split("T")[0],
				createdByRole: role as Role,
				estimatedDeliveryDate: new Date(
					quoteInformation.estimatedDeliveryDate
				),
				comment: quoteInformation.quote.comment ?? "",
				entries: quoteInformation.entries.map((entry) => ({
					...entry,
					unitaryPrice: entry.unitaryPrice ?? 0,
					unitaryCost: entry.unitaryCost ?? 0,
					unitaryFinalPrice: entry.unitaryFinalPrice ?? 0,
					image: null,
					imageUrl: entry.imageUrl ?? null,
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
	}, []);

	const onApprovalContactChange = async () => {
		fetchQuoteInformation();
	};

	if (!id || Array.isArray(id)) {
		return <div>Error: ID invalido</div>;
	}

	if (loading) {
		return <Loading />;
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
						<form
							onSubmit={form.handleSubmit((values) =>
								onSubmitUpdate(values)
							)}
						>
							<div className="flex gap-4 justify-between items-center">
								{quoteInformation && (
									<>
										<div className="flex-1">
											<QuoteInformationDisplay
												quoteInformation={
													quoteInformation
												}
											/>
										</div>
										<ChangeAprovalContact
											quoteInformation={quoteInformation}
											onChange={onApprovalContactChange}
										/>
									</>
								)}
							</div>
							<div className="flex justify-center">
								<div className="w-fit">
									{role && (
										<EntryForm
											form={form}
											fieldArrayAppend={fieldArrayAppend}
											fieldArrayInsert={fieldArrayInsert}
											fieldArrayRemove={fieldArrayRemove}
											disabled={disabled}
											role={role as Role}
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
												rejection
											>
												<div
													className={`cursor-pointer bg-gray-800/90 text-white rounded-md hover:bg-gray-700/90 gap-2 p-1 px-2 transition flex justify-center items-center text-xl ${
														form.formState.isValid
															? ""
															: "opacity-50 pointer-events-none"
													}`}
												>
													<Undo />
													{role === Role.VALIDATOR
														? "Rechazar"
														: "Actualizar"}
												</div>
											</CommentDialog>
											<div
												className={`cursor-pointer bg-gray-800/90 text-white rounded-md hover:bg-gray-700/90 gap-2 p-1 px-2 transition flex justify-center items-center text-xl ${
													form.formState.isValid
														? ""
														: "opacity-50 pointer-events-none"
												}`}
												onClick={handleAccept}
											>
												<CheckCheck />
												{role === Role.PETITIONER
													? "Finalizar"
													: "Aceptar"}
											</div>
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
