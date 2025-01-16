import { z } from "zod";
import { RenderUploadSchema } from "@/app/Schemas";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";

function ContactInformation({
	form,
	fullfilled,
}: {
	form: UseFormReturn<z.infer<typeof RenderUploadSchema>>;
	fullfilled: () => void;
}) {
	const approvalContact = form.watch("approvalContact");
	const requestContact = form.watch("requestContact");

	useEffect(() => {
		if (approvalContact && requestContact) {
			fullfilled();
		}
	}, [approvalContact, requestContact, fullfilled]);

	return (
		<>
			<FormField
				control={form.control}
				name="approvalContact"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Contacto de Aprobación</FormLabel>
						<FormControl>
							<Input placeholder="2225542247" {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="requestContact"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Contacto de Solicitud</FormLabel>
						<FormControl>
							<Input placeholder="552331233" {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	);
}

export default ContactInformation;
