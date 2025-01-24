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
	sizes: z.string().min(1, "Las dimensiones no pueden estar vacías."),
	concept: z.string().min(1, "El concepto no puede estar vacío."),
	unitaryPrice: z.preprocess(
		(val) => (val === "" ? 0 : Number(val)),
		z.number().nonnegative().optional()
	),
	range: z.string().min(1, "La cantidad no puede estar vacía."),
});

export const RenderUploadSchema = z.object({
	approvalContact: z
		.string()
		.length(10, "El contacto de aprobación debe tener 10 dígitos."),
	requestContact: z
		.string()
		.length(10, "El contacto de solicitud debe tener 10 dígitos."),
	date: z.string(),
	entries: z.array(EntrySchema),
	company: z.string(),
	createdByRole: z.nativeEnum(Role),
	client: z.string().nonempty(),
	brand: z.string().nonempty(),
	project: z.string().nonempty(),
	serial: z.string().nonempty(),
});

export function initializeEntry() {
	return {
		name: "",
		sizes: "",
		concept: "",
		unitaryPrice: 0,
		range: "",
		image: null,
	};
}

export function initializeRenderUpload() {
	return {
		approvalContact: "",
		requestContact: "",
		date: "",
		entries: [initializeEntry()],
		company: "",
		createdByRole: Role.PETITIONER,
		client: "",
		brand: "",
		project: "",
		serial: "",
	};
}
