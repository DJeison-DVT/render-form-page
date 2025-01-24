import { Prisma } from "@prisma/client";

export type QuoteInformationWithQuotes = Prisma.QuoteInformationGetPayload<{
	include: {
		quotes: {
			include: {
				entries: true;
			};
		};
	};
}>;
