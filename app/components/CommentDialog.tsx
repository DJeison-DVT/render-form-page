"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { ReactNode } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { RenderUploadSchema } from "../Schemas";

interface CommentDialogProps {
	rejection?: boolean;
	form: UseFormReturn<z.infer<typeof RenderUploadSchema>>;
	upload: () => void;
	disabled: boolean;
	children: ReactNode;
}

export default function CommentDialog({
	form,
	rejection,
	upload,
	disabled,
	children,
}: CommentDialogProps) {
	return (
		<Dialog>
			<DialogTrigger disabled={!form.formState.isValid}>
				{children}
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{rejection ? "Motivo de rechazo" : "Comentario"}
					</DialogTitle>
				</DialogHeader>
				<FormField
					control={form.control}
					name="comment"
					render={({ field }) => (
						<Textarea
							{...field}
							disabled={disabled}
							placeholder="Escribe aquí tu comentario"
						></Textarea>
					)}
				/>
				<Button onClick={upload} disabled={disabled}>
					{rejection ? "Rechazar" : "Guardar"}
				</Button>
			</DialogContent>
		</Dialog>
	);
}
