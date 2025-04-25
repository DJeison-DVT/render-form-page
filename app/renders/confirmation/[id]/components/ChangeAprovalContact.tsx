import {
	UserOption,
	useUsersByRole,
} from "@/app/components/formPage/useUsersByRole";
import { Button } from "@/components/ui/button";
import { QuoteInformation } from "@prisma/client";
import { useEffect, useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatMexicanPhoneNumber } from "@/lib/utils";
import { updateValidator } from "@/lib/storage/database";

interface ChangeAprovalContactProps {
	quoteInformation: QuoteInformation;
	onChange: () => void;
}

export default function ChangeAprovalContact({
	quoteInformation,
	onChange,
}: ChangeAprovalContactProps) {
	const validators: UserOption[] = useUsersByRole("VALIDATOR");
	const [open, setOpen] = useState(false);
	const [validator, setValidator] = useState<UserOption | null>(null);
	const { toast } = useToast();

	useEffect(() => {
		if (validators.length > 0) {
			const currentValidator = validators.find(
				(user) => user.phone === quoteInformation.approvalContact
			);
			if (currentValidator) {
				setValidator(currentValidator);
			}
		}
	}, [validators, quoteInformation.approvalContact]);

	const handleSubmit = async () => {
		if (validator) {
			try {
				await updateValidator(quoteInformation, validator.phone);
				toast({
					title: "Contacto de aprobación cambiado",
					description: `El contacto de aprobación ha sido cambiado a ${
						validator.name
					} ${formatMexicanPhoneNumber(validator.phone)}`,
				});
				setOpen(false);
				onChange();
			} catch (error) {
				const errorMessage = error as Error;
				toast({
					title: "Error al cambiar el contacto de aprobación",
					description: errorMessage.message,
					variant: "destructive",
				});
			}
		}
	};

	return (
		<div className="flex flex-col md:gap-4 gap-2 md:pr-10 pr-0 mx-auto mt-2 md:mt-0">
			<div>Cambiar contacto de aprobación</div>
			<Select
				value={validator?.phone || ""}
				onValueChange={(newPhone: string) => {
					const newValidator = validators.find(
						(user) => user.phone === newPhone
					);
					if (newValidator) {
						setValidator(newValidator);
					}
				}}
			>
				<SelectTrigger className="w-[250px]">
					<SelectValue placeholder="Selecciona un validador" />
				</SelectTrigger>
				<SelectContent>
					{validators.map((user) => (
						<SelectItem key={user.phone} value={user.phone}>
							{user.name} {formatMexicanPhoneNumber(user.phone)}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<Button>Cambiar</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>¿Estás seguro?</DialogTitle>
						<DialogDescription>
							Esta acción cambiará el contacto de aprobación y
							enviará una notificación al nuevo contacto.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button onClick={handleSubmit} type="submit">
							Confirmar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
