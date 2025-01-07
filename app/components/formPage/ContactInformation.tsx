import { z } from "zod";
import { RenderUploadSchema } from "@/app/Schemas";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";

function ContactInformation({
    form,
    fullfilled,
}: {
    form: UseFormReturn<z.infer<typeof RenderUploadSchema>>;
    fullfilled: () => void;
}) {
    const approvalContact = form.watch("approval_contact");
    const requestContact = form.watch("request_contact");

    useEffect(() => {
        if (approvalContact && requestContact) {
            fullfilled();
        }
    }, [approvalContact, requestContact, fullfilled])

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
        </ >
    );
}

export default ContactInformation;