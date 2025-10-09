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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { useUsersByRole } from "./useUsersByRole";
import { useState } from "react";

export default function ProviderSelection({
	form,
	disabled = false,
}: {
	form: UseFormReturn<z.infer<typeof ProposalUploadSchema>>;
	disabled?: boolean;
}) {
	const [filter, setFilter] = useState<string>("");

	const providers = useUsersByRole("PROVIDER", filter);

	return (
		<div>
			<div className="flex gap-12">
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
							<Input
								placeholder="Buscar proveedor por nombre, número o descripción"
								value={filter}
								onChange={(e) => setFilter(e.target.value)}
							/>
							<ScrollArea className="h-32 border px-4 py-1 rounded-sm">
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
														{item.name}
													</FormLabel>
												</FormItem>
											);
										}}
									/>
								))}
							</ScrollArea>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name={"pdf"}
					render={({ field }) => (
						<FormItem>
							<FormLabel>Archivo PDF de la cotización</FormLabel>
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
									<p className="text-gray-600 text-sm mt-2">
										{form.getValues().pdf
											? form.getValues().pdf.name
											: "No se ha seleccionado el PDF"}
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
