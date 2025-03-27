"use client";

import { z } from "zod";
import { ProposalUploadSchema } from "@/app/Schemas";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Combobox, ComboboxOptions } from "@/components/ui/combobox";
import { getClients } from "@/lib/storage/database";

function ContactInformation({
	form,
	disabled,
}: {
	form: UseFormReturn<z.infer<typeof ProposalUploadSchema>>;
	disabled: boolean;
}) {
	const [clients, setClients] = useState<ComboboxOptions[]>([]);
	const [selectedClient, setSelectedClient] = useState<string>("");

	function handleAppendClient(label: ComboboxOptions["label"]) {
		const newClient = {
			value: label,
			label,
		};
		clients.push(newClient);
		setSelectedClient(newClient.value);
		form.setValue("client", newClient.value);
	}

	const getClientOptions = async () => {
		const result = await getClients();

		if (!result.success) {
			return;
		}

		const staticClients = [
			"Cosmic",
			"KCM",
			"Lala",
			"SCJ",
			"Haribo",
			"Newell",
		];

		const options: ComboboxOptions[] = result.clients.map((client) => ({
			value: client.client,
			label: client.client,
		}));

		for (const client of staticClients) {
			if (!options.find((option) => option.value === client)) {
				options.push({
					value: client,
					label: client,
				});
			}
		}

		setClients(options);
	};

	useEffect(() => {
		getClientOptions();
	}, []);

	return (
		<div className="flex gap-4 h-40">
			<div className="flex flex-col gap-4">
				<FormField
					control={form.control}
					name="client"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Cliente</FormLabel>
							<FormControl>
								<Combobox
									{...field}
									disabled={disabled}
									options={clients}
									onCreate={handleAppendClient}
									selected={selectedClient}
									onChange={(value) => {
										setSelectedClient(value.value);
										form.setValue("client", value.value);
									}}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="brand"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Marca</FormLabel>
							<FormControl>
								<Input
									placeholder="Marca"
									{...field}
									disabled={disabled}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>
			<Separator orientation="vertical" className="h-full" />
			<div className="flex flex-col gap-4">
				<FormField
					control={form.control}
					name="project"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Proyecto</FormLabel>
							<FormControl>
								<Input
									placeholder="Proyecto"
									{...field}
									disabled={disabled}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="serial"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Folio</FormLabel>
							<FormControl>
								<Input
									placeholder="Folio"
									{...field}
									disabled={disabled}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>
		</div>
	);
}

export default ContactInformation;
