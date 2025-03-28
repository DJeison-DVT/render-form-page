"use client";

import { useEffect } from "react";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import { RenderUploadSchema } from "@/app/Schemas";

const EntryPriceField = ({
	form,
	index,
	disabled,
}: {
	form: UseFormReturn<z.infer<typeof RenderUploadSchema>>;
	index: number;
	disabled?: boolean;
}) => {
	const unitaryCost = form.watch(`entries.${index}.unitaryCost`);

	useEffect(() => {
		if (unitaryCost === 0) {
			const price = unitaryCost * 1.65;
			form.setValue(`entries.${index}.unitaryPrice`, price);
		}
	}, [unitaryCost, index, form]);

	return (
		<FormField
			control={form.control}
			name={`entries.${index}.unitaryPrice`}
			render={({ field }) => (
				<FormItem>
					{index === 0 && (
						<FormLabel className="text-nowrap">
							Precio DeMente
						</FormLabel>
					)}
					<FormControl>
						<Input
							disabled={disabled}
							type="number"
							className="w-24"
							{...field}
						/>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
};

export default EntryPriceField;
