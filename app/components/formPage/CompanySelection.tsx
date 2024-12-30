import { z } from "zod";
import { RenderUploadSchema } from "@/app/Schemas";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";

enum OriginCompany {
    DeMente = "demente",
    Alquipop = "alquipop",
}

function CompanySelection({
    form,
}: {
    form: UseFormReturn<z.infer<typeof RenderUploadSchema>>;
}) {
    return (
        <>
            <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Approval Contact</FormLabel>
                        <FormControl>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    );
}

export default CompanySelection;