"use server";

import { RenderUploadSchema } from "@/app/Schemas";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { z } from "zod";
import { sendMessage } from "../messaging";

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
				client: validData.client,
				brand: validData.brand,
				project: validData.project,
				serial: validData.serial,
				quotes: {
					create: {
						createdByRole: validData.createdByRole,
						createdAt: new Date(),
						comment: validData.comment || "",
						entries: {
							create: validData.entries.map((entry) => ({
								concept: entry.concept,
								name: entry.name,
								range: entry.range,
								sizes: entry.sizes,
								material: entry.material,
								materialSubtype: entry.materialSubtype,
								unitaryPrice: entry.unitaryPrice,
								unitaryCost: entry.unitaryCost,
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

		const message = `Cotización creada con folio ${quoteInformation.serial} del proyecto ${quoteInformation.project}\n
		Para aprobarla o rechazarla, ingresa a la plataforma de cotizaciones con la siguiente liga: https://localhost:3000/renders/confirmation/${quoteInformation.id}?role=VALIDATOR`;

		await sendMessage(quoteInformation.approvalContact, message);
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
							material: entry.material,
							materialSubtype: entry.materialSubtype,
							concept: entry.concept,
							range: entry.range,
							unitaryPrice: entry.unitaryPrice,
							unitaryCost: entry.unitaryCost,
							imageUrl: entry.image,
						})),
					},
				},
				include: {
					entries: true,
				},
			}),
		]);

		const message = `La cotización con folio ${data.serial} del proyecto ${
			data.project
		} ha sido actualizada\n
		Para ${
			data.createdByRole == Role.SUPERVISOR
				? "acutalizarla"
				: "verificarla"
		}, ingresa a la plataforma de cotizaciones con la siguiente liga: https://localhost:3000/renders/confirmation/${rejectedQuoteId}?role=${
			data.createdByRole == Role.VALIDATOR ? "PETITIONER" : "VALIDATOR"
		}`;

		await sendMessage(
			data.createdByRole == Role.VALIDATOR
				? data.requestContact
				: data.approvalContact,
			message
		);

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

async function getClients() {
	try {
		const clients = await prisma.quoteInformation.findMany({
			distinct: ["client"],
			select: {
				client: true,
			},
		});
		return { success: true, clients };
	} catch (error) {
		console.error("Error in getClients:", error);
		throw new Error("Error al obtener los clientes");
	}
}

export {
	createQuoteInformation,
	getQuoteInformation,
	createQuote,
	finalizeQuote,
	getClients,
};
