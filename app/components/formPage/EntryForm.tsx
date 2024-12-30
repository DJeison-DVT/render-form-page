import { RenderUploadSchema } from "@/app/Schemas";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

function EntryForm({
    field,
    form,
    index,
}: {
    field: any;
    form: UseFormReturn<z.infer<typeof RenderUploadSchema>>;
    index: number;
}) {
    return (
        <div key={field.id} className="mb-4 p-4 border rounded">
            <h4 className="mb-2">Entry {index + 1}</h4>
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
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                            <Input placeholder="Name" {...field} />
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
                        <FormLabel>Sizes</FormLabel>
                        <FormControl>
                            <Input placeholder="Sizes" {...field} />
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
                        <FormLabel>concept</FormLabel>
                        <FormControl>
                            <Input placeholder="Concepto" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name={`entries.${index}.unitary_price`}
                render={({ field: { value, onChange } }) => (
                    <FormItem>
                        <FormLabel>Unitary Price (Optional)</FormLabel>
                        <FormControl>
                            <Input
                                type="number"
                                value={value}
                                placeholder="Unitary Price"
                                onChange={(e) =>
                                    onChange(Number(e.target.value))
                                }
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
                        <FormLabel>Range (Optional)</FormLabel>
                        <FormControl>
                            <Input placeholder="Range" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}

export default EntryForm;