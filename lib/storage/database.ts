"use server";

import { ProposalUploadSchema, RenderUploadSchema } from "@/app/Schemas";
import { prisma } from "@/lib/prisma";
import { QuoteInformation, Role } from "@prisma/client";
import { z } from "zod";
import { sendMessage } from "../messaging";
import { savePDF, upsertImage } from "./gcloud";
import { QuoteInformationWithQuotes } from "../types";

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

async function createQuote(
	quoteInfoId: string,
	data: z.infer<typeof RenderUploadSchema>,
	target: Role,
	senderPhone: string,
	rejectedQuoteId?: number,
	link?: string
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
			if (rejectedQuoteId) {
				await transaction.quote.update({
					where: { id: rejectedQuoteId },
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
			targetPhone = quoteInformation.provider?.phone || "";
		} else {
			throw new Error("Rol no válido para enviar mensaje");
		}

		await sendMessage(targetPhone, MESSAGE_TEMPLATE, {
			1: data.serial,
			2: data.project,
			3: link
				? link
				: `${NEXTAUTH_URL}/renders/confirmation/${quoteInfoId}`,
		});

		return { success: true, quote: newQuote };
	} catch (error) {
		console.error("Error in createQuoteInformation:", error);
		throw new Error("Error al crear la cotización");
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

async function createProviderQuote(
	quoteInfoId: string,
	providerId: string,
	data: z.infer<typeof RenderUploadSchema>,
	options?: { rejectedQuoteId?: number }
) {
	try {
		const user = await prisma.user.findUnique({
			where: {
				id: providerId,
			},
		});
		if (!user) {
			throw new Error("Usuario no encontrado");
		}

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
			options?.rejectedQuoteId,
			`${NEXTAUTH_URL}/renders/confirmation/${quoteInfoId}/provider`
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
		throw new Error("Error al crear la cotización");
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

		const user = await prisma.user.findUnique({
			where: {
				id: providerId,
			},
		});
		if (!user) {
			throw new Error("Usuario no encontrado");
		}

		const provider = await prisma.user.findUnique({
			where: {
				id: providerId,
			},
		});
		if (!provider) {
			throw new Error("Proveedor no encontrado");
		}

		await createQuote(
			quoteInfoId,
			data,
			Role.VALIDATOR,
			data.requestContact,
			options?.rejectedQuoteId,
			`${NEXTAUTH_URL}/renders/confirmation/${quoteInfoId}`
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
	}
}

async function getPendingQuotes(phone: string, userRole: Role) {
	try {
		let quoteInformations;

		if (userRole === Role.SUPERVISOR) {
			quoteInformations = await prisma.quoteInformation.findMany({
				where: { finalizedAt: null },
				include: {
					quotes: {
						include: { entries: true },
						orderBy: { createdAt: "desc" },
						take: 1,
					},
				},
			});
		} else {
			const roleFilter = getRoleFilter(userRole, phone);
			quoteInformations = await prisma.quoteInformation.findMany({
				where: {
					finalizedAt: null,
					...roleFilter,
				},
				include: {
					provider: true,
					approver: true,
					requester: true,
					quotes: {
						orderBy: {
							createdAt: "desc",
						},
						take: 1,
						include: {
							entries: true,
						},
					},
				},
			});
		}

		const filteredQuotes = quoteInformations.filter(
			(quoteInformation) =>
				quoteInformation.quotes.length > 0 &&
				quoteInformation.quotes[0].targetRole === userRole
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

async function getPendingProviderQuotes(phone: string) {
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

		const providerQuotes = await prisma.providerQuotes.findMany({
			where: {
				userId: user.id,
				quoteInformation: {
					providerContact: null,
				},
			},
			include: {
				quoteInformation: {
					include: {
						provider: true,
						approver: true,
						requester: true,
						quotes: {
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

		const filteredQuotes = providerQuotes.filter(
			(providerQuotes) =>
				providerQuotes.quoteInformation.quotes.length === 0 ||
				providerQuotes.quoteInformation.quotes[0].targetRole ===
					Role.PROVIDER
		);

		return {
			success: true,
			quoteInformations: filteredQuotes.map((pq) => pq.quoteInformation),
		};
	} catch (error) {
		console.error("Error in getPendingProviderQuotes:", error);
		throw new Error("Error al obtener las cotizaciones");
	}
}

async function getCompleteQuotes(phone: string) {
	try {
		const user = await prisma.user.findUnique({
			where: {
				phone,
			},
		});

		if (!user) {
			throw new Error("Usuario no encontrado");
		}

		const roleFilter = getRoleFilter(user.role, phone);

		const quoteInformations = await prisma.quoteInformation.findMany({
			where: {
				finalizedAt: { not: null },
				...roleFilter,
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

		return { success: true, quoteInformations };
	} catch (error) {
		console.error("Error in getCompleteQuotes:", error);
		throw new Error("Error al obtener las cotizaciones");
	}
}

const getUsers = async (role?: Role) => {
	const users = await prisma.user.findMany({
		where: {
			role: role ? role : undefined,
		},
	});
	return users;
};

const getUserByPhone = async (phone: string) => {
	const user = await prisma.user.findUnique({
		where: {
			phone,
		},
	});
	return user;
};

export {
	createQuoteInformation,
	getQuoteInformation,
	createQuote,
	finalizeQuote,
	getClients,
	getPendingQuotes,
	getCompleteQuotes,
	getUsers,
	getQuoteProviders,
	createProviderQuote,
	saveProvider,
	getPendingProviderQuotes,
	getUserByPhone,
	updateValidator,
};
