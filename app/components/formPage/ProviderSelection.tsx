"use client";

import { ProposalUploadSchema } from "@/app/Schemas";
import { Checkbox } from "@/components/ui/checkbox";
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { getUsers } from "@/lib/storage/database";
import { Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

interface checkboxOptions {
	id: string;
	label: string;
}

export default function ProviderSelection({
	form,
	disabled = false,
}: {
	form: UseFormReturn<z.infer<typeof ProposalUploadSchema>>;
	disabled?: boolean;
}) {
	const [providers, setProviders] = useState<checkboxOptions[]>([]);

	const fetchProviders = async () => {
		const users = await getUsers("PROVIDER");
		setProviders(
			users.map((user) => ({
				id: user.id,
				label: user.company || user.name,
			}))
		);
	};

	useEffect(() => {
		fetchProviders();
	}, []);
	return (
		<div>
			<div className="flex gap-4">
				<FormField
					control={form.control}
					name="providers"
					render={() => (
						<FormItem>
							<div className="mb-4">
								<FormLabel className="text-base">
									Proveedores
								</FormLabel>
								<FormDescription>
									Selecciona los proveedores a los que se les
									enviará la cotización.
								</FormDescription>
							</div>
							{providers.map((item) => (
								<FormField
									key={item.id}
									control={form.control}
									name="providers"
									render={({ field }) => {
										return (
											<FormItem
												key={item.id}
												className="flex flex-row items-start space-x-3 space-y-0"
											>
												<FormControl>
													<Checkbox
														checked={field.value?.includes(
															item.id
														)}
														onCheckedChange={(
															checked
														) => {
															return checked
																? field.onChange(
																		[
																			...field.value,
																			item.id,
																		]
																  )
																: field.onChange(
																		field.value?.filter(
																			(
																				value
																			) =>
																				value !==
																				item.id
																		)
																  );
														}}
													/>
												</FormControl>
												<FormLabel className="text-sm font-normal">
													{item.label}
												</FormLabel>
											</FormItem>
										);
									}}
								/>
							))}
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name={"pdf"}
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<div className="flex flex-col items-center justify-center max-w-48">
									<div className="w-24 h-24 border border-gray-300 rounded-md overflow-hidden flex items-center justify-center bg-gray-100">
										<Input
											disabled={disabled}
											type="file"
											id={`file-upload`}
											onChange={(e) => {
												const file =
													e.target.files?.[0];
												field.onChange(file);
											}}
											className="hidden"
										/>
										<label
											htmlFor={`file-upload`}
											className="cursor-pointer flex items-center justify-center w-full h-full"
										>
											<Upload className="text-gray-500 w-8 h-8" />
										</label>
									</div>
									<p className="text-gray-600 text-md mt-2">
										{form.getValues().pdf
											? form.getValues().pdf.name
											: "No se ha seleccionado un archivo"}
									</p>
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>
		</div>
	);
}
