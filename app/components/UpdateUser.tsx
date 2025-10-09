"use client";

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
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { userUpdateSchema } from "../Schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { Role, User } from "@prisma/client";
import {
	DeleteUser,
	UpdateUser as UpdateUserAction,
} from "@/lib/storage/users";
import { RoleTranslations } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface UpdateUserProps {
	user: User | null;
	onUserUpdated?: () => void;
	onUserDeleted?: () => void;
}

export default function UpdateUser({
	user,
	onUserUpdated,
	onUserDeleted,
}: UpdateUserProps) {
	const { toast } = useToast();
	const form = useForm<z.infer<typeof userUpdateSchema>>({
		resolver: zodResolver(userUpdateSchema),
		defaultValues: {
			id: "",
			email: "",
			name: "",
			description: "",
			password: "",
			phone: "",
			role: "PETITIONER",
		},
	});

	// Update form when user changes
	useEffect(() => {
		if (user) {
			form.reset({
				id: user.id,
				email: user.email,
				name: user.name,
				description: user.description || "",
				password: "",
				phone: user.phone,
				role: user.role,
			});
		}
	}, [user, form]);

	function onSubmit(values: z.infer<typeof userUpdateSchema>) {
		UpdateUserAction(values)
			.then((updatedUser) => {
				if (!updatedUser || !updatedUser.phone) {
					throw new Error("User update failed, no phone returned");
				}

				toast({
					title: "Usuario actualizado",
					description: `El usuario ${updatedUser.name} ha sido actualizado.`,
				});

				// Clear password field after successful update
				form.setValue("password", "");

				// Callback to refresh user list
				if (onUserUpdated) {
					onUserUpdated();
				}
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

	function handleDelete() {
		if (!user) return;

		DeleteUser(user.id)
			.then(() => {
				toast({
					title: "Usuario eliminado",
					description: `El usuario ${user.name} ha sido eliminado.`,
				});

				if (onUserDeleted) {
					onUserDeleted();
				}
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

		toast({
			title: "Usuario eliminado",
			description: "El usuario ha sido eliminado corectamente",
		});
	}

	if (!user) {
		return (
			<div className="p-12 flex items-center justify-center text-gray-500">
				Selecciona un usuario para editar
			</div>
		);
	}

	return (
		<div className="flex-1 p-6 h-full overflow-y-auto flex flex-col gap-6">
			<div>
				<div className="text-5xl flex items-end gap-3">
					{user.name}
					<div className="text-gray-500 text-3xl">{user.phone}</div>
				</div>
				<div className="w-fit text-xl">
					<Badge variant="default">
						{RoleTranslations[user.role]}
					</Badge>
				</div>
			</div>

			<div>
				<h2 className="text-2xl font-bold">Editar Usuario</h2>
				<p className="text-gray-600 text-sm mt-1">
					Actualiza la información del usuario
				</p>
			</div>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-4 "
				>
					<div className="flex gap-4">
						<div className="flex-[0.5] flex flex-col gap-4">
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
						</div>
						<div className="flex-1">
							<FormField
								control={form.control}
								name="role"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Rol</FormLabel>
										<Select
											onValueChange={field.onChange}
											value={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Rol del usuario" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{Object.values(Role).map(
													(role) => (
														<SelectItem
															value={role}
															key={role}
														>
															{
																RoleTranslations[
																	role
																]
															}
														</SelectItem>
													)
												)}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Descripción</FormLabel>
										<FormControl>
											<Textarea {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Contraseña
											<span className="text-gray-500 text-sm ml-2">
												(opcional)
											</span>
										</FormLabel>
										<FormControl>
											<Input
												{...field}
												type="password"
												placeholder="Dejar vacío para mantener la actual"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>
					<div className="flex gap-4">
						<Button type="submit" className="w-full">
							Actualizar
						</Button>
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button
									type="button"
									variant="destructive"
									className="w-full"
								>
									Eliminar
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>
										¿Estás seguro?
									</AlertDialogTitle>
									<AlertDialogDescription>
										Esta acción no se puede deshacer. Esto
										eliminará permanentemente el usuario{" "}
										<strong>{user.name}</strong> y todos sus
										datos asociados.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>
										Cancelar
									</AlertDialogCancel>
									<AlertDialogAction
										onClick={handleDelete}
										className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
									>
										Eliminar
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				</form>
			</Form>
		</div>
	);
}
