import { z } from "zod";

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = [
	"image/jpeg",
	"image/jpg",
	"image/png",
	"image/webp",
];

export const EntrySchema = z.object({
	// image: z
	// 	.any()
	// 	.refine(
	// 		(file) => file?.size <= MAX_FILE_SIZE,
	// 		`El peso de la imagen es de 5MB maximo.`
	// 	)
	// 	.refine(
	// 		(file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
	// 		"Only .jpg, .jpeg, .png and .webp formats are supported."
	// 	),
	name: z.string(),
	sizes: z.string(),
	concept: z.string(),
	unitary_price: z.number().optional(),
	range: z.string().optional(),
});

export const RenderUploadSchema = z.object({
	approval_contact: z.string(),
	request_contact: z.string(),
	date: z.string(),
	entries: z.array(EntrySchema),
	company: z.string(),
});
