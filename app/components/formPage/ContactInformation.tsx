import { z } from "zod";
import { RenderUploadSchema } from "@/app/Schemas";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";

function ContactInformation({
    form,
}: {
    form: UseFormReturn<z.infer<typeof RenderUploadSchema>>;
}) {
    return (
        <>
            <FormField
                control={form.control}
                name="approval_contact"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Approval Contact</FormLabel>
                        <FormControl>
                            <Input placeholder="Approval Contact" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="request_contact"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Request Contact</FormLabel>
                        <FormControl>
                            <Input placeholder="Request Contact" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    );
}

export default ContactInformation;