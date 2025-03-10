import { z } from "zod";
import { ProposalUploadSchema } from "@/app/Schemas";
import { FormField, FormItem } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import Image from "next/image";
import { useEffect } from "react";

function CompanySelection({
	form,
	fullfilled,
}: {
	form: UseFormReturn<z.infer<typeof ProposalUploadSchema>>;
	fullfilled: () => void;
}) {
	const company = form.watch("company");

	useEffect(() => {
		if (company) {
			fullfilled();
		}
	}, [company, fullfilled]);

	return (
		<>
			<FormField
				control={form.control}
				name="company"
				render={({ field }) => (
					<FormItem>
						<ToggleGroup
							type="single"
							variant="outline"
							onValueChange={field.onChange}
							value={field.value}
						>
							<div className="grid grid-cols-2 gap-4 h-fit">
								<ToggleGroupItem
									value="alquipop"
									aria-label="Toggle alquipop"
									className="h-full flex items-center justify-center p-4"
								>
									<Image
										src="/alquipop-logo.svg"
										alt="alquipop"
										width={400}
										height={400}
									/>
								</ToggleGroupItem>
								<ToggleGroupItem
									value="demente"
									aria-label="Toggle demente"
									className="h-full flex items-center justify-center p-4"
								>
									<Image
										src="/demente-logo.png"
										alt="DeMente"
										width={400}
										height={400}
									/>
								</ToggleGroupItem>
							</div>
						</ToggleGroup>
					</FormItem>
				)}
			/>
		</>
	);
}

export default CompanySelection;
