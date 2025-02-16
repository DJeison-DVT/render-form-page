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
import { Separator } from "@/components/ui/separator";

function ContactInformation({
	form,
	fullfilled,
}: {
	form: UseFormReturn<z.infer<typeof RenderUploadSchema>>;
	fullfilled: () => void;
}) {
	const client = form.watch("client");
	const brand = form.watch("brand");
	const project = form.watch("project");
	const serial = form.watch("serial");

	useEffect(() => {
		if (client && brand && project && serial) {
			fullfilled();
		}
	}, [fullfilled, client, brand, project, serial]);

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
								<Input placeholder="Cliente" {...field} />
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
								<Input placeholder="Marca" {...field} />
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
								<Input placeholder="Proyecto" {...field} />
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
								<Input placeholder="Folio" {...field} />
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
