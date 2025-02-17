"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
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
import { Upload } from "lucide-react";

interface CommentDialogProps {
	rejection?: boolean;
	form: UseFormReturn<z.infer<typeof RenderUploadSchema>>;
	upload: () => void;
	disabled: boolean;
}

export default function CommentDialog({
	form,
	rejection,
	upload,
	disabled,
}: CommentDialogProps) {
	return (
		<Dialog>
			<DialogTrigger disabled={!form.formState.isValid}>
				<div
					className={`cursor-pointer bg-gray-800/90 text-white rounded-full hover:bg-gray-700/90 transition w-12 h-12 flex justify-center items-center text-xl ${
						form.formState.isValid
							? ""
							: "opacity-50 pointer-events-none"
					}`}
				>
					<Upload />
				</div>
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
