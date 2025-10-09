"use server";

import { ProposalUploadSchema, RenderUploadSchema } from "@/app/Schemas";
import { prisma } from "@/lib/prisma";
import { QuoteInformation, Role } from "@prisma/client";
import { z } from "zod";
import { sendMessage } from "../messaging";
import { savePDF, upsertImage } from "./gcloud";
import {
	ProviderQuoteFilter,
	QuoteInformationFilter,
	QuoteInformationWithQuotes,
	RoleFilter,
} from "../types";
import { GetUser, GetUserById } from "./users";

const MESSAGE_TEMPLATE = "HX92dca13fd40b55ff25d9e3ffa3e10429";
const PROVIDER_SELECTED_TEMPLATE = "HX33c698bec0b2902e42812d47e5812666";
const NEXTAUTH_URL = process.env.NEXTAUTH_URL;

async function createQuoteInformation(
	data: z.infer<typeof ProposalUploadSchema>
) {
	const parsedData = ProposalUploadSchema.safeParse(data);
	if (!parsedData.success) {
		console.error("Validation Error:", parsedData.error);
		throw new Error("Invalid data provided to createQuoteInformation");
	}

	const requester = await prisma.user.findUnique({
		where: {
			phone: parsedData.data.requestContact,
		},
	});

	if (!requester) {
		throw new Error("Solicitante no encontrado");
	}

	const approver = await prisma.user.findUnique({
		where: {
			phone: parsedData.data.approvalContact,
		},
	});

	if (!approver) {
		throw new Error("Validador no encontrado");
	}

	const validData = parsedData.data;
	const path = `${validData.company}/${validData.serial}.pdf`;
	await savePDF(validData.pdf as File, path);
	const selectedProviderIds = validData.providers;

	try {
		const quoteInformation = await prisma.quoteInformation.create({
			data: {
				company: validData.company,
				estimatedDeliveryDate: validData.estimatedDeliveryDate,
				client: validData.client,
				brand: validData.brand,
				project: validData.project,
				serial: validData.serial,
				pdfUrl: path,
				requester: {
					connect: {
						phone: requester.phone,
					},
				},
				approver: {
					connect: {
						phone: approver.phone,
					},
				},
				ProviderQuotes: {
					create: selectedProviderIds.map((providerId) => ({
						user: {
							connect: {
								id: providerId,
							},
						},
					})),
				},
			},
		});

		const providerPhones = await prisma.user.findMany({
			where: {
				id: {
					in: selectedProviderIds,
				},
			},
			select: {
				phone: true,
			},
		});
		for (const provider of providerPhones) {
			await sendMessage(provider.phone, MESSAGE_TEMPLATE, {
				1: quoteInformation.serial,
				2: quoteInformation.project,
				3: `${NEXTAUTH_URL}/renders/confirmation/${quoteInformation.id}`,
			});
		}
	} catch (error) {
		console.error("Error in createQuoteInformation:", error);
		throw new Error("Error al crear la petición de cotización");
	}
}

async function getQuoteInformation(id: string, single = false) {
	try {
		const quoteInformation = await prisma.quoteInformation.findUnique({
			where: {
				id,
			},
			include: {
				approver: true,
				requester: true,
				provider: true,
				quotes: {
					where: {
						AND: [
							{ providerQuotesUserId: null },
							{ providerQuotesQuoteInformationId: null },
						],
					},
					include: {
						entries: true,
					},
					orderBy: {
						createdAt: "desc",
					},
					...(single && { take: 1 }),
				},
			},
		});

		return { success: true, quoteInformation };
	} catch (error) {
		console.error("Error in getQuoteInformation:", error);
		throw new Error("Error al obtener la cotización");
	}
}

type CreateQuoteOptions = {
	rejectedQuoteId?: number;
	link?: string;
	providerPhone?: string;
};

async function createQuote(
	quoteInfoId: string,
	data: z.infer<typeof RenderUploadSchema>,
	target: Role,
	senderPhone: string,
	options: CreateQuoteOptions = {}
) {
	const parsedData = RenderUploadSchema.safeParse(data);
	if (!parsedData.success) {
		console.error("Validation Error:", parsedData.error);
		throw new Error("Invalid data provided to createQuoteInformation");
	}

	const validData = parsedData.data;

	try {
		const imageUrls: string[] = [];
		for (const entry of validData.entries) {
			if (!entry.imageUrl && entry.image) {
				const url = await upsertImage(entry.image);
				if (url) {
					imageUrls.push(url);
				}
			} else {
				imageUrls.push(entry.imageUrl || "");
			}
		}
		if (imageUrls.length !== validData.entries.length) {
			throw new Error("Error al subir las imágenes");
		}

		const quoteInformation = await prisma.quoteInformation.findUnique({
			where: {
				id: quoteInfoId,
			},
			include: {
				provider: true,
				approver: true,
				requester: true,
			},
		});

		if (!quoteInformation) {
			throw new Error("Cotización no encontrada");
		}

		const { newQuote } = await prisma.$transaction(async (transaction) => {
			if (options.rejectedQuoteId) {
				await transaction.quote.update({
					where: { id: options.rejectedQuoteId },
					data: { rejectedAt: new Date() },
				});
			}

			const newQuote = await transaction.quote.create({
				data: {
					quoteInformation: { connect: { id: quoteInfoId } },
					createdByRole: validData.createdByRole as Role,
					createdBy: { connect: { phone: senderPhone } },
					targetRole: target,
					createdAt: new Date(),
					comment: validData.comment,
					entries: {
						create: validData.entries.map((entry, idx) => ({
							name: entry.name,
							sizes: entry.sizes,
							material: entry.material,
							materialSubtype: entry.materialSubtype,
							concept: entry.concept,
							range: entry.range,
							unitaryPrice: entry.unitaryPrice,
							unitaryCost: entry.unitaryCost,
							unitaryFinalPrice: entry.unitaryFinalPrice,
							imageUrl: imageUrls[idx] || "",
						})),
					},
				},
				include: {
					entries: true,
				},
			});
			return { newQuote };
		});

		let targetPhone = "";
		if (target === Role.PETITIONER) {
			targetPhone = quoteInformation.requester.phone;
		} else if (target === Role.VALIDATOR) {
			targetPhone = quoteInformation.approver.phone;
		} else if (target === Role.PROVIDER) {
			targetPhone =
				quoteInformation.provider?.phone || options.providerPhone || "";
		} else {
			throw new Error("Rol no válido para enviar mensaje");
		}

		await sendMessage(targetPhone, MESSAGE_TEMPLATE, {
			1: data.serial,
			2: data.project,
			3: options.link
				? options.link
				: `${NEXTAUTH_URL}/renders/confirmation/${quoteInfoId}`,
		});

		return { success: true, quote: newQuote };
	} catch (error) {
		console.error("Error in createQuoteInformation:", error);
		if (error instanceof Error) {
			throw new Error(error.message);
		} else {
			throw new Error("Error al crear la cotización");
		}
	}
}

async function updateValidator(
	quoteInfo: QuoteInformation,
	validatorPhone: string
) {
	try {
		const validator = await prisma.user.findUnique({
			where: {
				phone: validatorPhone,
			},
		});

		if (!validator) {
			throw new Error("Usuario no encontrado");
		}

		if (validator.phone === quoteInfo.approvalContact) {
			throw new Error("El validador ya es el contacto de aprobación");
		}

		const quoteInformation = await prisma.quoteInformation.update({
			where: {
				id: quoteInfo.id,
			},
			data: {
				approver: {
					connect: {
						phone: validator.phone,
					},
				},
			},
		});

		await sendMessage(validator.phone, MESSAGE_TEMPLATE, {
			1: quoteInformation.serial,
			2: quoteInformation.project,
			3: `${NEXTAUTH_URL}/renders/confirmation/${quoteInfo.id}`,
		});
		return { success: true, quoteInformation };
	} catch (error) {
		const errorMessage = error as Error;
		if (errorMessage.message === "Usuario no encontrado") {
			throw new Error("Usuario no encontrado");
		}
		if (
			errorMessage.message ===
			"El validador ya es el contacto de aprobación"
		) {
			throw new Error("El validador ya es el contacto de aprobación");
		}
		console.error("Error in updateValidator:", error);
		throw new Error("Error al actualizar el validador");
	}
}

async function getQuoteProviders(id: string) {
	try {
		const quoteInformation = await prisma.quoteInformation.findUnique({
			where: {
				id,
			},
			include: {
				approver: true,
				requester: true,
				ProviderQuotes: {
					include: {
						user: true,
						quote: {
							include: {
								entries: true,
							},
						},
					},
				},
			},
		});

		return { success: true, quoteInformation };
	} catch (error) {
		console.error("Error in getQuoteInformation:", error);
		throw new Error("Error al obtener la cotización");
	}
}

async function getQuoteProvidersCount(id: string) {
	const total = await prisma.quoteInformation.findUnique({
		where: { id },
		include: {
			ProviderQuotes: {
				include: { quote: true },
			},
			_count: {
				select: { ProviderQuotes: true },
			},
		},
	});

	const providerMade = await prisma.quote.count({
		where: {
			quoteInformationId: id,
			createdByRole: "PROVIDER",
			rejectedAt: null,
		},
	});

	return {
		total: total?._count.ProviderQuotes || 0,
		providerMade,
	};
}

async function createProviderQuote(
	quoteInfoId: string,
	providerId: string,
	data: z.infer<typeof RenderUploadSchema>,
	options?: { rejectedQuoteId?: number }
) {
	try {
		const user = await GetUserById(providerId);

		const target =
			data.createdByRole === Role.PROVIDER
				? Role.PETITIONER
				: Role.PROVIDER;

		const result = await createQuote(
			quoteInfoId,
			data,
			target,
			data.createdByRole === Role.PROVIDER
				? user.phone
				: data.requestContact,
			{
				rejectedQuoteId: options?.rejectedQuoteId,
				link: `${NEXTAUTH_URL}/renders/confirmation/${quoteInfoId}/provider`,
				providerPhone: user.phone,
			}
		);

		const quote = result.quote;

		const updatedQuote = await prisma.$transaction(async (transaction) => {
			if (options?.rejectedQuoteId) {
				await transaction.quote.update({
					where: { id: options.rejectedQuoteId },
					data: {
						providerQuotesQuoteInformationId: null,
						providerQuotesUserId: null,
					},
				});
			}
			const updatedQuote = await transaction.quote.update({
				where: {
					id: quote.id,
				},
				data: {
					providerQuotesQuoteInformationId: quoteInfoId,
					providerQuotesUserId: providerId,
				},
			});
			await transaction.providerQuotes.update({
				where: {
					quoteInformationId_userId: {
						quoteInformationId: quoteInfoId,
						userId: user.id,
					},
				},
				data: {
					quoteId: quote.id,
				},
			});
			return updatedQuote;
		});

		return updatedQuote;
	} catch (error) {
		console.error("Error in createProviderQuote:", error);
		if (error instanceof Error) {
			throw new Error(error.message);
		} else {
			throw new Error("Error al crear la cotización");
		}
	}
}

async function saveProvider(
	quoteInfoId: string,
	providerId: string,
	data: z.infer<typeof RenderUploadSchema>,
	options?: { rejectedQuoteId?: number }
) {
	try {
		await prisma.quote.updateMany({
			where: {
				quoteInformationId: quoteInfoId,
			},
			data: {
				rejectedAt: new Date(),
			},
		});

		const provider = await GetUserById(providerId);

		await createQuote(
			quoteInfoId,
			data,
			Role.VALIDATOR,
			data.requestContact,
			{
				rejectedQuoteId: options?.rejectedQuoteId,
				link: `${NEXTAUTH_URL}/renders/confirmation/${quoteInfoId}/provider`,
			}
		);

		await prisma.quoteInformation.update({
			where: {
				id: quoteInfoId,
			},
			data: {
				stage: "NEGOTIATING",
				provider: {
					connect: {
						phone: provider.phone,
					},
				},
			},
		});

		await sendMessage(provider.phone, PROVIDER_SELECTED_TEMPLATE, {
			1: `${data.serial} ${data.project}`,
		});
	} catch (error) {
		console.error("Error in selectProvider:", error);
		throw new Error("Error al seleccionar el proveedor");
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

function getRoleFilter(userRole: string, phone: string) {
	switch (userRole) {
		case "PETITIONER":
			return { requestContact: phone };

		case "APPROVER":
			return { approvalContact: phone };

		case "PROVIDER":
			return { providerContact: phone };
		case "SUPERVISOR":
			return {};
	}
}

async function getPendingQuotes(phone: string, userRole: Role, query: string) {
	try {
		const where: QuoteInformationPendingFilter & RoleFilter = {
			...getRoleFilter(userRole, phone),
			finalizedAt: null,
		};
		if (query.trim()) {
			where.serial = {
				contains: query.trim(),
				mode: "insensitive",
			};
		}

		const quoteInformations = await prisma.quoteInformation.findMany({
			where,
			include: {
				provider: true,
				approver: true,
				requester: true,
				quotes: {
					orderBy: { createdAt: "desc" },
					take: 1,
					include: { entries: true },
				},
			},
		});

		const filteredQuotes =
			userRole === "SUPERVISOR"
				? quoteInformations.filter((qi) => qi.quotes.length > 0)
				: quoteInformations.filter(
						(qi) =>
							qi.quotes.length > 0 &&
							qi.quotes[0].targetRole === userRole
				  );

		return {
			success: true,
			quoteInformations: filteredQuotes as QuoteInformationWithQuotes[],
		};
	} catch (error) {
		console.error("Error in getPendingQuotes:", error);
		throw new Error("Error al obtener las cotizaciones");
	}
}

async function getPendingProviderQuotes(phone: string, query: string) {
	try {
		const user = await prisma.user.findUnique({
			where: {
				phone,
			},
			select: {
				id: true,
			},
		});

		if (!user) {
			throw new Error("Usuario no encontrado");
		}

		const where: ProviderQuoteFilter = { providerContact: null };
		if (query.trim()) {
			where.serial = {
				contains: query.trim(),
				mode: "insensitive",
			};
		}

		const providerQuotes = await prisma.providerQuotes.findMany({
			where: {
				userId: user.id,
				quoteInformation: where,
			},
			include: {
				quoteInformation: {
					include: {
						provider: true,
						approver: true,
						requester: true,
						quotes: {
							where: {
								providerQuotesUserId: user.id,
							},
							orderBy: {
								createdAt: "desc",
							},
							take: 1,
							include: {
								entries: true,
							},
						},
					},
				},
			},
		});

		const filtered = providerQuotes.filter((pq) => {
			const qArr = pq.quoteInformation.quotes;
			return pq.quoteId === null || qArr[0].targetRole === Role.PROVIDER;
		});

		return {
			success: true,
			quoteInformations: filtered.map((pq) => pq.quoteInformation),
		};
	} catch (error) {
		console.error("Error in getPendingProviderQuotes:", error);
		throw new Error("Error al obtener las cotizaciones");
	}
}

async function getCompleteQuotes(
	phone: string,
	query: string,
	page: number = 1,
	role: Role
) {
	try {
		const user = await GetUser(phone);

		const where: QuoteInformationFilter & RoleFilter = {
			...getRoleFilter(user.role, phone),
		};
		if (query.trim()) {
			where.serial = {
				contains: query.trim(),
				mode: "insensitive",
			};
		}
		if (role !== Role.PROVIDER) {
			where.finalizedAt = { not: null };
		}

		const total = await prisma.quoteInformation.count({ where });
		const PAGE_SIZE = 5;
		const skip = (page - 1) * PAGE_SIZE;
		const totalPages = Math.ceil(total / PAGE_SIZE);

		const quoteInformations = await prisma.quoteInformation.findMany({
			where,
			skip,
			take: PAGE_SIZE,
			orderBy: {
				createdAt: "desc",
			},
		});

		return {
			success: true,
			quoteInformations,
			pagination: {
				page,
				pageSize: PAGE_SIZE,
				total,
				totalPages,
			},
		};
	} catch (error) {
		console.error("Error in getCompleteQuotes:", error);
		throw new Error("Error al obtener las cotizaciones");
	}
}

// async function cloneQuoteInformationWithRelations(
// 	originalId: string,
// 	copies = 20
// ) {
// 	// 1) Load the “master” record (with its most recent quote + entries)
// 	const master = await prisma.quoteInformation.findUnique({
// 		where: { id: originalId },
// 		include: {
// 			quotes: {
// 				orderBy: { createdAt: "desc" },
// 				take: 1,
// 				include: { entries: true },
// 			},
// 		},
// 	});
// 	if (!master) {
// 		throw new Error(`QuoteInformation ${originalId} not found`);
// 	}

// 	const clones: QuoteInformation[] = [];

// 	// 2) For each copy, spin up a transaction to create the clone + its quote+entries
// 	for (let i = 1; i <= copies; i++) {
// 		await prisma.$transaction(async (tx) => {
// 			// Clone the QuoteInformation (new UUID auto-generated)
// 			const qi = await tx.quoteInformation.create({
// 				data: {
// 					company: master.company,
// 					estimatedDeliveryDate: master.estimatedDeliveryDate,
// 					client: master.client,
// 					brand: master.brand,
// 					project: master.project,
// 					// append suffix so “serial” stays unique
// 					serial: `${master.serial}-${i}`,
// 					stage: master.stage,
// 					pdfUrl: master.pdfUrl,
// 					approvalContact: master.approvalContact,
// 					requestContact: master.requestContact,
// 					providerContact: master.providerContact,
// 					finalizedAt: master.finalizedAt,
// 				},
// 			});
// 			clones.push(qi);

// 			// If there was a latest quote, clone that too
// 			const [origQuote] = master.quotes;
// 			if (origQuote) {
// 				const newQuote = await tx.quote.create({
// 					data: {
// 						comment: origQuote.comment,
// 						createdByRole: origQuote.createdByRole,
// 						targetRole: origQuote.targetRole,
// 						createdByPhone: origQuote.createdByPhone,
// 						quoteInformationId: qi.id,
// 					},
// 				});

// 				// And clone its entries
// 				for (const e of origQuote.entries) {
// 					await tx.entry.create({
// 						data: {
// 							name: e.name,
// 							imageUrl: e.imageUrl,
// 							material: e.material,
// 							materialSubtype: e.materialSubtype,
// 							sizes: e.sizes,
// 							concept: e.concept,
// 							range: e.range,
// 							unitaryCost: e.unitaryCost,
// 							unitaryPrice: e.unitaryPrice,
// 							unitaryFinalPrice: e.unitaryFinalPrice,
// 							quoteId: newQuote.id,
// 						},
// 					});
// 				}
// 			}
// 		});
// 	}

// 	return clones;
// }

export {
	createQuoteInformation,
	getQuoteInformation,
	createQuote,
	finalizeQuote,
	getClients,
	getPendingQuotes,
	getCompleteQuotes,
	getQuoteProviders,
	createProviderQuote,
	saveProvider,
	getQuoteProvidersCount,
	getPendingProviderQuotes,
	updateValidator,
	// cloneQuoteInformationWithRelations,
};
