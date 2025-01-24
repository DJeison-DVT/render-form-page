import { initializeEntry, RenderUploadSchema } from "@/app/Schemas";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	UseFieldArrayAppend,
	UseFieldArrayInsert,
	UseFieldArrayRemove,
	UseFormReturn,
} from "react-hook-form";
import { z } from "zod";
import { X, Plus, CornerDownLeft, Trash } from "lucide-react";
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
import { useState } from "react";
import PushableComponent from "@/components/ui/pushableComponent";

function EntryForm({
	form,
	fieldArrayAppend,
	fieldArrayInsert,
	fieldArrayRemove,
	disabled = false,
	modal = false,
}: {
	form: UseFormReturn<z.infer<typeof RenderUploadSchema>>;
	fieldArrayAppend: UseFieldArrayAppend<z.infer<typeof RenderUploadSchema>>;
	fieldArrayInsert: UseFieldArrayInsert<z.infer<typeof RenderUploadSchema>>;
	fieldArrayRemove: UseFieldArrayRemove;
	disabled?: boolean;
	modal?: boolean;
}) {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const content = (
		<>
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
					<div key={index} className="p-2 flex gap-4">
						<FormField
							control={form.control}
							name={`entries.${index}.image`}
							render={({ field }) => (
								<FormItem>
									{index == 0 && (
										<FormLabel>Imagen</FormLabel>
									)}
									<FormControl>
										<div className="flex flex-col items-center justify-center max-w-24">
											<div className="w-24 h-24 border border-gray-300 rounded-md overflow-hidden flex items-center justify-center bg-gray-100">
												<Input
													disabled={disabled}
													type="file"
													id={`file-upload-${index}`}
													onChange={(e) => {
														const file =
															e.target.files?.[0];
														field.onChange(file);
													}}
													className="hidden"
												/>
												<label
													htmlFor={`file-upload-${index}`}
													className="cursor-pointer flex items-center justify-center w-full h-full"
												>
													{form.getValues().entries[
														index
													].image ? (
														<img
															src={URL.createObjectURL(
																form.getValues()
																	.entries[
																	index
																].image
															)}
															alt="Selected"
															className="object-cover w-full h-full"
														/>
													) : (
														<Plus className="text-gray-500 w-8 h-8" />
													)}
												</label>
											</div>
											<p className="text-gray-600 text-xs mt-2">
												{form.getValues().entries[index]
													.image
													? form.getValues().entries[
															index
													  ].image.name
													: "No file selected"}
											</p>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name={`entries.${index}.name`}
							render={({ field }) => (
								<FormItem>
									{index == 0 && (
										<FormLabel>Material</FormLabel>
									)}
									<FormControl>
										<Input
											disabled={disabled}
											placeholder="Exhibidor"
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
											disabled={disabled}
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
											disabled={disabled}
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
											disabled={disabled}
											placeholder="Piezas"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name={`entries.${index}.unitaryPrice`}
							render={({ field }) => (
								<FormItem>
									{index == 0 && (
										<FormLabel>Precio Unitario</FormLabel>
									)}
									<FormControl>
										<Input
											disabled={disabled}
											type="number"
											{...field}
											placeholder="Precio Unitario"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="flex justify-around items-end gap-2 m-2">
							<TooltipProvider disableHoverableContent={disabled}>
								<Tooltip>
									<TooltipTrigger
										asChild
										onClick={() => {
											if (disabled) return;
											const currentEntry =
												form.getValues().entries[index];
											const newEntry = Object.assign(
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
													shouldValidate: true,
													shouldDirty: true,
												}
											);
										}}
									>
										<PushableComponent>
											<CornerDownLeft
												className={
													disabled
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
									form.getValues().entries.length <= 1 ||
									disabled
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
													form.getValues().entries
														.length <= 1 || disabled
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
														form.getValues().entries
															.length == 1
													)
														return;
													fieldArrayRemove(index);
												}}
											>
												Continuar
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</TooltipProvider>
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
