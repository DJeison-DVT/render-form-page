import { Role } from "@prisma/client";
import { z } from "zod";

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = [
	"image/jpeg",
	"image/jpg",
	"image/png",
	"image/webp",
];

export const EntrySchema = z.object({
	image: z.union([
		z
			.any()
			.refine(
				(file) => file?.size <= MAX_FILE_SIZE,
				`El peso de la imagen es de 5MB maximo.`
			)
			.refine(
				(file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
				"Solo se admiten formatos .jpg, .jpeg, .png y .webp."
			),
		z.null(),
	]),
	name: z.string().min(1, "El nombre no puede estar vacío."),
	material: z.string().min(1, "El material no puede estar vacío."),
	materialSubtype: z
		.string()
		.min(1, "El subtipo de material no puede estar vacío."),
	sizes: z.string().min(1, "Las dimensiones no pueden estar vacías."),
	concept: z.string().min(1, "El concepto no puede estar vacío."),
	unitaryPrice: z.preprocess(
		(val) => (val === "" ? 0 : Number(val)),
		z.number().nonnegative().optional()
	),
	unitaryCost: z.preprocess(
		(val) => (val === "" ? 0 : Number(val)),
		z.number().nonnegative().optional()
	),
	range: z.string().min(1, "La cantidad no puede estar vacía."),
});

const uploadSchema = z.object({
	approvalContact: z
		.string()
		.length(10, "El contacto de aprobación debe tener 10 dígitos."),
	requestContact: z
		.string()
		.length(10, "El contacto de solicitud debe tener 10 dígitos."),
	company: z.string(),
	createdByRole: z.nativeEnum(Role),
	client: z.string().nonempty(),
	brand: z.string().nonempty(),
	project: z.string().nonempty(),
	serial: z.string().nonempty(),
});

// Assuming EntrySchema is already defined
export const RenderUploadSchema = uploadSchema.merge(
	z.object({
		entries: z.array(EntrySchema),
		comment: z.string().optional(),
	})
);

export const ProposalUploadSchema = uploadSchema.merge(
	z.object({
		pdf: z
			.any()
			.refine(
				(file) => file?.type === "application/pdf",
				"El archivo debe ser un PDF."
			),
		providers: z
			.array(z.string())
			.refine((value) => value.some((item) => item), {
				message: "Debe seleccionar al menos un proveedor.",
			}),
	})
);

export const EntryUpdateSchema = z.object({
	entries: z.array(EntrySchema),
});

export const userCreationSchema = z.object({
	name: z.string().nonempty(),
	email: z.string().email(),
	role: z.nativeEnum(Role),
	company: z.string().optional(),
	password: z
		.string()
		.min(8, "La contraseña debe tener al menos 8 caracteres."),
	phone: z.string().length(10, "El teléfono debe tener 10 dígitos."),
});

export function initializeEntry() {
	return {
		name: "",
		sizes: "",
		concept: "",
		material: "",
		materialSubtype: "",
		unitaryPrice: 0,
		unitaryCost: 0,
		range: "",
		image: null,
	};
}

export function initializeProposalUpload(phone: string) {
	return {
		approvalContact: process.env.NEXT_PUBLIC_APPROVAL_CONTACT,
		requestContact: phone,
		company: "",
		createdByRole: Role.PETITIONER,
		client: "",
		brand: "",
		project: "",
		serial: "",
		pdf: null,
		providers: [] as string[],
	};
}

export function initializeRenderUpload(phone: string) {
	return {
		approvalContact: process.env.NEXT_PUBLIC_APPROVAL_CONTACT,
		requestContact: phone,
		entries: [initializeEntry()],
		company: "",
		createdByRole: Role.PETITIONER,
		client: "",
		comment: "",
		brand: "",
		project: "",
		serial: "",
	};
}
