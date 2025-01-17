"use server";

import { EntrySchema } from "@/app/Schemas";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

async function createQuoteInformation(
	company: string,
	approvalContact: string,
	requestContact: string,
	entries: z.infer<typeof EntrySchema>[]
) {
	// TODO upload image to storage
	for (const entry of entries) {
		entry.image = "";
	}

	try {
		const quoteInformation = await prisma.quoteInformation.create({
			data: {
				company,
				approvalContact,
				requestContact,
				quotes: {
					create: {
						createdAt: new Date(),
						entries: {
							create: entries.map((entry) => ({
								imageUrl: entry.image,
								name: entry.name,
								sizes: entry.sizes,
								concept: entry.concept,
								range: entry.range,
								unitaryPrice: entry.unitary_price,
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
