"use server";

import { RenderUploadSchema } from "@/app/Schemas";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { z } from "zod";

async function createQuoteInformation(
	data: z.infer<typeof RenderUploadSchema>
) {
	const parsedData = RenderUploadSchema.safeParse(data);

	if (!parsedData.success) {
		console.error("Validation Error:", parsedData.error);
		throw new Error("Invalid data provided to createQuoteInformation");
	}

	const validData = parsedData.data;

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
								unitaryPrice: entry.unitary_price,
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

export { createQuoteInformation, getQuoteInformation };
