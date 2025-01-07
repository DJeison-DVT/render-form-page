import { initializeEntry, RenderUploadSchema } from "@/app/Schemas";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFieldArrayAppend, UseFieldArrayInsert, UseFieldArrayRemove, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { X, Plus, CornerDownLeft } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { useEffect } from "react";

function EntryForm({
    form,
    fieldArrayAppend,
    fieldArrayInsert,
    fieldArrayRemove,
    isEvaluating = false,
}: {
    form: UseFormReturn<z.infer<typeof RenderUploadSchema>>
    fieldArrayAppend: UseFieldArrayAppend<z.infer<typeof RenderUploadSchema>>
    fieldArrayInsert: UseFieldArrayInsert<z.infer<typeof RenderUploadSchema>>
    fieldArrayRemove: UseFieldArrayRemove
    isEvaluating?: boolean
}) {
    return (
        <div className="h-screen pt-4">
            <div className="border p-4 rounded flex flex-col">
                <div className="flex justify-between items-center bg-white z-10 sticky top-0 p-2 border-b">
                    <h4 className="text-3xl font-bold">Cotización</h4>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Plus
                                    onClick={() => {
                                        fieldArrayAppend(initializeEntry());
                                    }}
                                    className="cursor-pointer"
                                />
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
                                        {index == 0 && <FormLabel>Imagen</FormLabel>}
                                        <FormControl>
                                            <div className="flex flex-col items-center justify-center max-w-24">
                                                <div className="w-24 h-24 border border-gray-300 rounded-md overflow-hidden flex items-center justify-center bg-gray-100">
                                                    <Input
                                                        type="file"
                                                        id={`file-upload-${index}`}
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            field.onChange(file);
                                                        }}
                                                        className="hidden"
                                                    />
                                                    <label
                                                        htmlFor={`file-upload-${index}`}
                                                        className="cursor-pointer flex items-center justify-center w-full h-full"
                                                    >
                                                        {form.getValues().entries[index].image ? (
                                                            <img
                                                                src={URL.createObjectURL(
                                                                    form.getValues().entries[index].image
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
                                                    {form.getValues().entries[index].image
                                                        ? form.getValues().entries[index].image.name
                                                        : "No file selected"}
                                                </p>
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`entries.${index}.name`}
                                render={({ field }) => (
                                    <FormItem>
                                        {index == 0 && <FormLabel>Material</FormLabel>}
                                        <FormControl>
                                            <Input placeholder="Exhibidor" {...field} />
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
                                        {index == 0 && <FormLabel>Medidas</FormLabel>}
                                        <FormControl>
                                            <Input placeholder="22cm x 33cm x 40cm" {...field} />
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
                                        {index == 0 && <FormLabel>Concepto</FormLabel>}
                                        <FormControl>
                                            <Textarea placeholder="Exhibidor de piso fabricado con..." {...field} className="min-w-96" />
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
                                        {index == 0 && <FormLabel>Cantidad</FormLabel>}
                                        <FormControl>
                                            <Input placeholder="Piezas" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {isEvaluating &&
                                <>
                                    <FormField
                                        control={form.control}
                                        name={`entries.${index}.unitary_price`}
                                        render={({ field: { value, onChange } }) => (
                                            <FormItem>
                                                {index == 0 && <FormLabel>Precio Unitario</FormLabel>}
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        value={value}
                                                        placeholder="Precio Unitario"
                                                        onChange={(e) =>
                                                            onChange(Number(e.target.value))
                                                        }
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            }
                            <div className="flex justify-around items-end gap-2 m-2">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <CornerDownLeft onClick={() => {
                                                const currentEntry = form.getValues().entries[index];
                                                const newEntry = { ...currentEntry };
                                                newEntry.range = "";
                                                fieldArrayInsert(index, newEntry);
                                                form.setValue(
                                                    `entries.${index + 1}`,
                                                    newEntry,
                                                    { shouldValidate: true, shouldDirty: true }
                                                );
                                                console.log(form.getValues().entries)
                                            }} />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Copiar Entrada</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider disableHoverableContent={form.getValues().entries.length <= 1}>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <X className={form.getValues().entries.length <= 1 ? "text-gray-400" : ""} onClick={() => {
                                                if (form.getValues().entries.length == 1) return
                                                fieldArrayRemove(index)
                                            }} />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Borrar Entrada</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div >
                    ))}
                </div>
            </div>
        </div>
    );
}

export default EntryForm;