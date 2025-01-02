import { initializeEntry, RenderUploadSchema } from "@/app/Schemas";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFieldArrayAppend, UseFieldArrayRemove, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { X, Plus, CornerDownLeft } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";

function EntryForm({
    form,
    fieldArrayAppend,
    fieldArrayRemove,
    isEvaluating = false,
}: {
    form: UseFormReturn<z.infer<typeof RenderUploadSchema>>
    fieldArrayAppend: UseFieldArrayAppend<z.infer<typeof RenderUploadSchema>>
    fieldArrayRemove: UseFieldArrayRemove
    isEvaluating?: boolean
}) {
    return (
        <div className="border p-4 m-4 rounded">
            <h4 className="text-3xl font-bold mb-2 flex flex-col">Cotización</h4>
            {form.getValues().entries.map((entry, index) => (
                <div key={index} className="p-2 flex gap-4">
                    {/* <FormField
                        control={form.control}
                        name={`entries.${index}.image`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Image</FormLabel>
                                <FormControl>
                                    <input
                                        type="file"
                                        onChange={(e) => field.onChange(e.target.files?.[0])}
                                        className="border p-2 rounded"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    /> */}
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
                                    <CornerDownLeft />
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
                                        console.log(fieldArrayRemove)
                                        fieldArrayRemove(index)
                                    }} />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Borrar Entrada</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        {index == form.getValues().entries.length - 1 && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Plus onClick={() => {
                                            console.log(fieldArrayAppend)
                                            fieldArrayAppend(initializeEntry())
                                        }} />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Nueva Entrada</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                </div >
            ))}
        </div>
    );
}

export default EntryForm;