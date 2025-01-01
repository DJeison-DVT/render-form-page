import { initializeEntry, RenderUploadSchema } from "@/app/Schemas";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFieldArrayAppend, UseFieldArrayRemove, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { X, Plus, CornerDownLeft } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
        <div>
            <h4 className="text-3xl font-bold mb-2">Cotización</h4>
            {form.getValues().entries.map((entry, index) => (
                <div key={index} className="mb-4 p-4 border flex gap-4">
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
                                <FormLabel>Material</FormLabel>
                                <FormControl>
                                    <Input placeholder="Material" {...field} />
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
                                <FormLabel>Medidas</FormLabel>
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
                                <FormLabel>Concepto</FormLabel>
                                <FormControl>
                                    <Input placeholder="Concepto" {...field} />
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
                                <FormLabel>Cantidad</FormLabel>
                                <FormControl>
                                    <Input placeholder="Cantidad" {...field} />
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
                                        <FormLabel>Precio Unitario</FormLabel>
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