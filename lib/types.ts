import { Prisma, Role } from "@prisma/client";

export const RoleTranslations: Record<Role, string> = {
	PETITIONER: "Cuentaclabe",
	VALIDATOR: "Aprobador",
	PROVIDER: "Proveedor",
	SUPERVISOR: "Supervisor",
};

export type QuoteInformationWithQuotes = Prisma.QuoteInformationGetPayload<{
	include: {
		quotes: {
			include: {
				entries: true;
			};
		};
	};
}>;

export type QuoteWithEntries = Prisma.QuoteGetPayload<{
	include: {
		entries: true;
	};
}>;
