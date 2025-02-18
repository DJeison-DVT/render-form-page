"use client";

import { EmailSchema } from "@/app/Schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { updateEmail } from "@/lib/storage/database";
import { useSession } from "next-auth/react";

export default function EmailForm() {
	const [loading, setLoading] = useState(false);
	const [open, setOpen] = useState(false);
	const { toast } = useToast();

	const { data: session } = useSession();

	const form = useForm<z.infer<typeof EmailSchema>>({
		resolver: zodResolver(EmailSchema),
		defaultValues: {
			email: "",
		},
	});

	function onSubmit(values: z.infer<typeof EmailSchema>) {
		setLoading(true);
		try {
			if (!session) {
				throw new Error("No hay sesion");
			}
			updateEmail(session.user.phone, values);
			setOpen(false);
		} catch {
			toast({
				title: "Fallo al registrar email",
				description: "Intenta de nuevo",
			});
		}
		setLoading(false);
	}

	return (
		<Dialog modal={false} open={open} onOpenChange={setOpen}>
			<DialogTrigger className="w-full" asChild>
				<Button className="w-full" variant={"outline"}>
					Registra tu email
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Registra tu email</DialogTitle>
					<DialogDescription>
						Aqui se enviaran notificaciones de cotizaciones
						faltantes.
					</DialogDescription>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="space-y-4"
						>
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button type="submit" disabled={loading}>
								Submit
							</Button>
						</form>
					</Form>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
}
