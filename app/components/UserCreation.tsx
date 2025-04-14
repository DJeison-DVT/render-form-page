"use client";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { userCreationSchema } from "../Schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Role } from "@prisma/client";
import { UserPlus } from "lucide-react";
import { registerUser } from "@/lib/storage/auth";
import { RoleTranslations } from "@/lib/types";

export default function UserCreation() {
	const [open, setOpen] = useState(false);

	const { toast } = useToast();
	const form = useForm<z.infer<typeof userCreationSchema>>({
		resolver: zodResolver(userCreationSchema),
		defaultValues: {
			email: "",
			name: "",
			password: "",
			phone: "",
			role: "PETITIONER",
		},
	});

	function onSubmit(values: z.infer<typeof userCreationSchema>) {
		registerUser(values)
			.then((user) => {
				if (!user || !user.phone) {
					throw new Error("User creation failed, no phone returned");
				}

				form.reset();
				setOpen(false);

				toast({
					title: "Usuario creado",
					description: `El usuario ${user.phone} ha sido creado.`,
				});
			})
			.catch((error) => {
				const message =
					error instanceof Error
						? error.message
						: "Unknown error occurred";

				toast({
					variant: "destructive",
					title: "Ocurrió un error",
					description: message,
				});
			});
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger>
				<div className="flex gap-2 text-md justify-center items-center">
					<UserPlus size={18} /> Crear Usuario
				</div>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Nuevo Usuario</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4"
					>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										Nombre de Identificación
									</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="phone"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Teléfono</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Correo</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="role"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Rol</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Rol del usuario" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{Object.values(Role).map((role) => (
												<SelectItem
													value={role}
													key={role}
												>
													{RoleTranslations[role]}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Contraseña</FormLabel>
									<FormControl>
										<Input {...field} type="password" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit">Guardar</Button>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
