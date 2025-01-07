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
	unitary_price: z.number().optional(),
	range: z.string().min(1, "La cantidad no puede estar vacía."),
});

export const RenderUploadSchema = z.object({
	approval_contact: z.string(),
	request_contact: z.string(),
	date: z.string(),
	entries: z.array(EntrySchema),
	company: z.string(),
});

export function initializeEntry() {
	return {
		name: "",
		sizes: "",
		concept: "",
		unitary_price: 0,
		range: "",
		image: null,
	};
}

export function initializeRenderUpload() {
	return {
		approval_contact: "",
		request_contact: "",
		date: "",
		entries: [initializeEntry()],
		company: "",
	};
}
