import {
	initializeEntry,
	materialEnum,
	RenderUploadSchema,
	solutionNameEnum,
} from "@/app/Schemas";
import {
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
import {
	UseFieldArrayAppend,
	UseFieldArrayInsert,
	UseFieldArrayRemove,
	UseFormReturn,
} from "react-hook-form";
import { z } from "zod";
import { Plus, CornerDownLeft, Trash, X } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import PushableComponent from "@/components/ui/pushableComponent";
import { useSession } from "next-auth/react";
import Loading from "@/components/Loading";
import { Role } from "@prisma/client";
import Image from "next/image";
import { Combobox, ComboboxOptions } from "@/components/ui/combobox";
import EntryPriceField from "./EntryPriceField";
import { Button } from "@/components/ui/button";

function EntryForm({
	form,
	fieldArrayAppend,
	fieldArrayInsert,
	fieldArrayRemove,
	role,
	disabled = false,
	modal = false,
}: {
	form: UseFormReturn<z.infer<typeof RenderUploadSchema>>;
	fieldArrayAppend: UseFieldArrayAppend<z.infer<typeof RenderUploadSchema>>;
	fieldArrayInsert: UseFieldArrayInsert<z.infer<typeof RenderUploadSchema>>;
	fieldArrayRemove: UseFieldArrayRemove;
	role: Role;
	disabled?: boolean;
	modal?: boolean;
}) {
	const solutionNameOptions: ComboboxOptions[] = solutionNameEnum.options.map(
		(option) => ({
			value: option,
			label: option,
		})
	);

	const [receivedMessage, setReceivedMessage] = useState("");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const { data: session } = useSession();
	const [solutionNames] = useState<ComboboxOptions[]>(solutionNameOptions);
	const [selectedSolutionNames, setSelectedSolutionNames] = useState<
		string[]
	>([]);

	function handleAppendMaterial(
		index: number,
		label: ComboboxOptions["label"]
	) {
		const newMaterial = {
			value: label,
			label,
		};
		solutionNames.push(newMaterial);
		setSelectedSolutionNames([
			...selectedSolutionNames.slice(0, index),
			newMaterial.value,
			...selectedSolutionNames.slice(index + 1),
		]);
		form.setValue("client", newMaterial.value);
	}

	useEffect(() => {
		const message = form.getValues("comment");
		if (message && receivedMessage === "") {
			setReceivedMessage(message);
		}
	}, [form, receivedMessage]);

	const BUCKET_URL = process.env.NEXT_PUBLIC_BUCKET_URL;

	if (!session) {
		return <Loading />;
	}

	const content = (
		<>
			{receivedMessage && (
				<div className="text-lg">Comentario: {receivedMessage}</div>
			)}
			{!BUCKET_URL && (
				<div>No se ha configurado el bucket de imágenes.</div>
			)}
			<div className="flex justify-between items-center bg-white z-10 sticky top-0 p-2 border-b">
				<h4 className="text-3xl font-bold">Cotización</h4>
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger>
							<PushableComponent
								onClick={() => {
									fieldArrayAppend(initializeEntry());
								}}
							>
								<Plus />
							</PushableComponent>
						</TooltipTrigger>
						<TooltipContent>
							<p>Nueva Entrada</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>
			<div className="overflow-y-auto flex-grow">
				{form.getValues().entries.map((entry, index) => (
					<div key={index} className="p-2 flex gap-4 relative">
						<FormField
							control={form.control}
							name={`entries.${index}.image`}
							render={({ field }) => {
								const imageUrl = form.watch(
									`entries.${index}.imageUrl`
								);
								return (
									<FormItem>
										{index == 0 && (
											<FormLabel>Imagen</FormLabel>
										)}
										<FormControl>
											<div className="w-24 h-24 border border-gray-300 rounded-md overflow-hidden flex items-center justify-center bg-gray-100 relative">
												{role === Role.PROVIDER && (
													<div className="absolute top-0 left-0">
														<Button
															size="icon"
															variant="ghost"
															type="button"
															onClick={() => {
																form.setValue(
																	`entries.${index}.imageUrl`,
																	null
																);
															}}
														>
															<X />
														</Button>
													</div>
												)}
												{BUCKET_URL && imageUrl ? (
													<Image
														src={
															BUCKET_URL +
															imageUrl
														}
														alt="Selected"
														className="object-cover w-full h-full"
														width={100}
														height={100}
													/>
												) : (
													<>
														<Input
															disabled={
																disabled ||
																role !==
																	Role.PROVIDER
															}
															type="file"
															id={`file-upload-${index}`}
															onChange={(e) => {
																const file =
																	e.target
																		.files?.[0];
																field.onChange(
																	file
																);
															}}
															className="hidden"
														/>
														<label
															htmlFor={`file-upload-${index}`}
															className="cursor-pointer flex items-center justify-center w-full h-full"
														>
															{form.getValues()
																.entries[index]
																.image ? (
																<Image
																	src={URL.createObjectURL(
																		form.getValues()
																			.entries[
																			index
																		].image
																	)}
																	alt="Selected"
																	className="object-cover w-full h-full"
																	width={100}
																	height={100}
																/>
															) : (
																<Plus className="text-gray-500 w-8 h-8" />
															)}
														</label>
													</>
												)}
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								);
							}}
						/>
						<FormField
							control={form.control}
							name={`entries.${index}.name`}
							render={({ field }) => (
								<FormItem>
									{index == 0 && (
										<>
											<FormLabel>Material</FormLabel>
											<br />
										</>
									)}
									<FormControl>
										<Combobox
											className="w-fit"
											{...field}
											options={solutionNames}
											onCreate={() => {
												handleAppendMaterial(
													index,
													field.value
												);
											}}
											selected={field.value}
											disabled={
												disabled ||
												role !== Role.PROVIDER
											}
											onChange={(value) => {
												setSelectedSolutionNames([
													...selectedSolutionNames.slice(
														0,
														index
													),
													value.value,
													...selectedSolutionNames.slice(
														index + 1
													),
												]);
												form.setValue(
													`entries.${index}.name`,
													value.value
												);
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name={`entries.${index}.material`}
							render={({ field }) => (
								<FormItem>
									{index == 0 && (
										<FormLabel>Materia Prima</FormLabel>
									)}
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
										disabled={
											disabled || role !== Role.PROVIDER
										}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue
													placeholder={
														field.value ||
														"Materia Prima"
													}
												/>
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{materialEnum.options.map(
												(material) => (
													<SelectItem
														key={material}
														value={material}
													>
														{material}
													</SelectItem>
												)
											)}
										</SelectContent>
									</Select>

									<FormMessage />

									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name={`entries.${index}.materialSubtype`}
							render={({ field }) => (
								<FormItem>
									{index == 0 && (
										<FormLabel>Subtipo</FormLabel>
									)}
									<FormControl>
										<Input
											disabled={
												disabled ||
												role !== Role.PROVIDER
											}
											className="w-24"
											placeholder="300mm"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name={`entries.${index}.sizes`}
							render={({ field }) => (
								<FormItem>
									{index == 0 && (
										<FormLabel>Medidas</FormLabel>
									)}
									<FormControl>
										<Input
											disabled={
												disabled ||
												role !== Role.PROVIDER
											}
											placeholder="22cm x 33cm x 40cm"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name={`entries.${index}.concept`}
							render={({ field }) => (
								<FormItem>
									{index == 0 && (
										<FormLabel>Concepto</FormLabel>
									)}
									<FormControl>
										<Textarea
											placeholder="Exhibidor de piso fabricado con..."
											{...field}
											disabled={
												disabled ||
												role !== Role.PROVIDER
											}
											className="min-w-96"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name={`entries.${index}.range`}
							render={({ field }) => (
								<FormItem>
									{index == 0 && (
										<FormLabel>Cantidad</FormLabel>
									)}
									<FormControl>
										<Input
											disabled={
												disabled ||
												role !== Role.PROVIDER
											}
											placeholder="Piezas"
											className="w-24"
											type="number"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						{role !== Role.VALIDATOR && (
							<FormField
								control={form.control}
								name={`entries.${index}.unitaryCost`}
								render={({ field }) => {
									return (
										<FormItem>
											{index == 0 && (
												<FormLabel>
													Costo Unitario
												</FormLabel>
											)}
											<FormControl>
												<Input
													disabled={
														disabled ||
														role !== Role.PROVIDER
													}
													type="number"
													className="w-24"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									);
								}}
							/>
						)}
						{(role === Role.PETITIONER ||
							role === Role.VALIDATOR) && (
							<EntryPriceField
								key={index}
								form={form}
								index={index}
								disabled={disabled || role === Role.VALIDATOR}
							/>
						)}
						{role !== Role.PROVIDER && (
							<FormField
								control={form.control}
								name={`entries.${index}.unitaryFinalPrice`}
								render={({ field }) => (
									<FormItem>
										{index == 0 && (
											<FormLabel>Precio Final</FormLabel>
										)}
										<FormControl>
											<Input
												disabled={
													disabled ||
													role === Role.PETITIONER
												}
												type="number"
												className="w-24"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}
						<div className="flex justify-around items-end gap-2 m-2 absolute right-0 bottom-0">
							{role === Role.PROVIDER && (
								<>
									<TooltipProvider
										disableHoverableContent={disabled}
									>
										<Tooltip>
											<TooltipTrigger
												asChild
												onClick={() => {
													if (disabled) return;
													const currentEntry =
														form.getValues()
															.entries[index];
													const newEntry =
														Object.assign(
															{},
															currentEntry
														);
													fieldArrayInsert(
														index + 1,
														newEntry
													);
													form.setValue(
														`entries.${index + 1}`,
														newEntry,
														{
															shouldValidate:
																true,
															shouldDirty: true,
														}
													);
												}}
											>
												<PushableComponent>
													<CornerDownLeft
														className={
															disabled ||
															role !==
																Role.PROVIDER
																? "text-gray-400 cursor-not-allowed"
																: ""
														}
													/>
												</PushableComponent>
											</TooltipTrigger>
											<TooltipContent>
												<p>Copiar Entrada</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
									<TooltipProvider
										disableHoverableContent={
											form.getValues().entries.length <=
												1 || disabled
										}
									>
										<Tooltip>
											<TooltipTrigger
												asChild
												onClick={() => {
													if (
														form.getValues().entries
															.length > 1 &&
														!disabled
													) {
														setIsModalOpen(true);
													}
												}}
											>
												<PushableComponent>
													<Trash
														className={
															form.getValues()
																.entries
																.length <= 1 ||
															disabled
																? "text-gray-400 cursor-not-allowed"
																: ""
														}
													/>
												</PushableComponent>
											</TooltipTrigger>
											<TooltipContent>
												<p>Borrar Entrada</p>
											</TooltipContent>
										</Tooltip>
										<AlertDialog
											open={isModalOpen}
											onOpenChange={setIsModalOpen}
										>
											<AlertDialogContent>
												<AlertDialogHeader>
													<AlertDialogTitle>
														Borrar Entrada
													</AlertDialogTitle>
													<AlertDialogDescription>
														Esta acción no se puede
														deshacer.
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>
														Cancelar
													</AlertDialogCancel>
													<AlertDialogAction
														onClick={() => {
															if (
																form.getValues()
																	.entries
																	.length == 1
															)
																return;
															fieldArrayRemove(
																index
															);
														}}
													>
														Continuar
													</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</TooltipProvider>
								</>
							)}
						</div>
					</div>
				))}
			</div>
		</>
	);

	return modal ? (
		<div className="h-screen pt-4">
			<div className="border p-4 rounded flex flex-col">{content}</div>
		</div>
	) : (
		content
	);
}

export default EntryForm;
