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
import { Upload } from "lucide-react";
import { createQuoteInformation } from "@/lib/storage/database";
import { useToast } from "@/hooks/use-toast";
import Registered from "@/app/components/Registered";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function Home() {
	const { toast } = useToast();
	const { data: session } = useSession();
	const [disabled, setDisabled] = useState(false);
	const [registered, setRegistered] = useState(false);
	const [company, setCompany] = useState("");

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

	return (
		<>
			{registered ? (
				<Registered company={company} />
			) : (
				<Form {...form}>
					<div
						onClick={() => {
							const result = ProposalUploadSchema.safeParse(
								form.getValues()
							);
							if (result.success) {
								console.log(
									"Form values are valid:",
									result.data
								);
							} else {
								console.error(
									"Form validation errors:",
									result.error.errors
								);
							}

							console.log("Form values:", form.getValues());
							console.log("Form state:", form.formState);
							console.log("Form errors:", form.formState.errors);
						}}
					>
						Report
					</div>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<div className="flex flex-col items-center justify-center h-screen">
							<div className="flex flex-col justify-center items-center gap-12">
								<CompanySelection
									form={form}
									disabled={disabled}
								/>
								<ContactInformation
									form={form}
									disabled={disabled}
								/>
								<ProviderSelection
									form={form}
									disabled={disabled}
								/>
							</div>
							<div className="fixed bottom-4 right-4 flex justify-end gap-4">
								<Button
									type="submit"
									size={"xl"}
									disabled={!form.formState.isValid}
								>
									<Upload />
									Enviar
								</Button>
							</div>
						</div>
					</form>
				</Form>
			)}
		</>
	);
}
