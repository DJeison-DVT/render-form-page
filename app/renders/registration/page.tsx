"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ProposalUploadSchema, initializeProposalUpload } from "@/app/Schemas";
import { Form } from "@/components/ui/form";
import ContactInformation from "@/app/components/formPage/ContactInformation";
import CompanySelection from "@/app/components/formPage/CompanySelection";
import ProviderSelection from "@/app/components/formPage/ProviderSelection";
import { ChevronDown, ChevronUp, Upload } from "lucide-react";
import { createQuoteInformation } from "@/lib/storage/database";
import { useToast } from "@/hooks/use-toast";
import Registered from "@/app/components/Registered";
import { useSession } from "next-auth/react";

export default function Home() {
	const [canContinue, setCanContinue] = useState(false);
	const { toast } = useToast();
	const { data: session } = useSession();
	const [disabled, setDisabled] = useState(false);
	const [registered, setRegistered] = useState(false);
	const [company, setCompany] = useState("");

	const fullfilledTab = () => {
		setCanContinue(true);
	};

	const form = useForm<z.infer<typeof ProposalUploadSchema>>({
		resolver: zodResolver(ProposalUploadSchema),
		defaultValues: initializeProposalUpload(session?.user.phone || ""),
	});

	const onSubmit = async (values: z.infer<typeof ProposalUploadSchema>) => {
		if (form.formState.isValid) {
			try {
				setDisabled(true);
				console.log("Submitting form with values:", values);
				await createQuoteInformation(values);
				setCompany(values.company);
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

	const slides = [
		{
			title: "",
			content: (
				<CompanySelection form={form} fullfilled={fullfilledTab} />
			),
		},
		{
			title: "Información de Proyecto",
			content: (
				<ContactInformation form={form} fullfilled={fullfilledTab} />
			),
		},
		{
			title: "",
			content: <ProviderSelection form={form} disabled={disabled} />,
		},
	];

	const [currentSlide, setCurrentSlide] = useState(0);
	const handleNextSlide = () => {
		if (!canContinue) return;
		if (currentSlide < slides.length - 1) {
			setCurrentSlide(currentSlide + 1);
		}
		setCanContinue(false);
	};

	const handlePreviousSlide = () => {
		if (currentSlide > 0) {
			setCurrentSlide(currentSlide - 1);
		}
		setCanContinue(false);
	};

	return (
		<>
			{registered ? (
				<Registered company={company} />
			) : (
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<div className="flex flex-col items-center justify-center h-screen">
							{slides[currentSlide].title && (
								<h2 className="text-2xl font-bold mb-4">
									{slides[currentSlide].title}
								</h2>
							)}
							<div>{slides[currentSlide].content}</div>
						</div>
						<div className="fixed bottom-4 right-4 flex justify-end gap-4">
							<div className="flex flex-col space-y-2">
								<button
									type="submit"
									className={`cursor-pointer bg-gray-800/90 text-white rounded-full hover:bg-gray-700/90 transition w-12 h-12 flex justify-center items-center text-xl ${
										form.formState.isValid
											? ""
											: "opacity-50 pointer-events-none"
									}`}
									disabled={!form.formState.isValid}
									onClick={form.handleSubmit(onSubmit)}
								>
									<Upload />
								</button>
								<div
									onClick={handlePreviousSlide}
									className={`cursor-pointer bg-gray-800/90 text-white rounded-full hover:bg-gray-700/90 transition w-12 h-12 flex justify-center items-center text-xl ${
										currentSlide > 0
											? ""
											: "opacity-50 pointer-events-none"
									}`}
								>
									<ChevronUp />
								</div>
								<div
									onClick={handleNextSlide}
									className={`cursor-pointer bg-gray-800/90 text-white rounded-full hover:bg-gray-700/90 transition w-12 h-12 flex justify-center items-center text-xl ${
										canContinue
											? ""
											: "opacity-50 pointer-events-none"
									}`}
								>
									<ChevronDown />
								</div>
							</div>
						</div>
					</form>
				</Form>
			)}
		</>
	);
}
