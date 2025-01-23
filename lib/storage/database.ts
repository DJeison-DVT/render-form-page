"use server";

import { RenderUploadSchema } from "@/app/Schemas";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { z } from "zod";

const upsertImage = async (image: string) => {};

async function createQuoteInformation(
	data: z.infer<typeof RenderUploadSchema>
) {
	const parsedData = RenderUploadSchema.safeParse(data);

	if (!parsedData.success) {
		console.error("Validation Error:", parsedData.error);
		throw new Error("Invalid data provided to createQuoteInformation");
	}

	const validData = parsedData.data;

	for (const entry of validData.entries) {
		if (entry.image) {
			await upsertImage(entry.image);
		}
	}

	try {
		const quoteInformation = await prisma.quoteInformation.create({
			data: {
				company: validData.company,
				approvalContact: validData.approvalContact,
				requestContact: validData.requestContact,
				quotes: {
					create: {
						createdByRole: validData.createdByRole,
						createdAt: new Date(),
						entries: {
							create: validData.entries.map((entry) => ({
								concept: entry.concept,
								name: entry.name,
								range: entry.range,
								sizes: entry.sizes,
								unitaryPrice: entry.unitaryPrice,
								imageUrl: entry.image,
							})),
						},
					},
				},
			},
			include: {
				quotes: {
					include: {
						entries: true,
					},
				},
			},
		});
	} catch (error) {
		console.error("Error in createQuoteInformation:", error);
		throw new Error("Error al crear la cotización");
	}
}

async function getQuoteInformation(id: string) {
	try {
		const quoteInformation = await prisma.quoteInformation.findUnique({
			where: {
				id,
			},
			include: {
				quotes: {
					include: {
						entries: true,
					},
					orderBy: {
						createdAt: "desc",
					},
					take: 1,
				},
			},
		});

		return { success: true, quoteInformation };
	} catch (error) {
		console.error("Error in getQuoteInformation:", error);
		throw new Error("Error al obtener la cotización");
	}
}

async function createQuote(
	quoteInfoId: string,
	rejectedQuoteId: number,
	data: z.infer<typeof RenderUploadSchema>
) {
	const parsedData = RenderUploadSchema.safeParse(data);

	if (!parsedData.success) {
		console.error("Validation Error:", parsedData.error);
		throw new Error("Invalid data provided to createQuoteInformation");
	}

	const validData = parsedData.data;

	for (const entry of validData.entries) {
		if (entry.image) {
			await upsertImage(entry.image);
		}
	}
	try {
		const [updatedQuote, newQuote] = await prisma.$transaction([
			prisma.quote.update({
				where: { id: rejectedQuoteId },
				data: { rejectedAt: new Date() },
			}),
			prisma.quote.create({
				data: {
					quoteInformationId: quoteInfoId,
					createdByRole: validData.createdByRole as Role,
					createdAt: new Date(),
					entries: {
						create: validData.entries.map((entry) => ({
							name: entry.name,
							sizes: entry.sizes,
							concept: entry.concept,
							range: entry.range,
							unitaryPrice: entry.unitaryPrice,
							imageUrl: entry.image,
						})),
					},
				},
				include: {
					entries: true,
				},
			}),
		]);

		return { success: true, quote: newQuote };
	} catch (error) {
		console.error("Error in createQuoteInformation:", error);
		throw new Error("Error al crear la cotización");
	}
}

async function finalizeQuote(id: string) {
	try {
		await prisma.quoteInformation.update({
			where: {
				id,
			},
			data: {
				finalizedAt: new Date(),
			},
		});
	} catch (error) {
		console.error("Error in finalizeQuote:", error);
		throw new Error("Error al finalizar la cotización");
	}
}

export {
	createQuoteInformation,
	getQuoteInformation,
	createQuote,
	finalizeQuote,
};
