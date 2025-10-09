import { Prisma, Role } from "@prisma/client";

export const RoleTranslations: Record<Role, string> = {
	PETITIONER: "Cuenta Clave",
	VALIDATOR: "Aprobador",
	PROVIDER: "Proveedor",
	SUPERVISOR: "Supervisor",
};

export type QuoteInformationWithQuotes = Prisma.QuoteInformationGetPayload<{
	include: {
		approver: true;
		requester: true;
		provider: true;
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

export interface QuoteInformationFilter {
	finalizedAt?: { not: null };
	serial?: ContainsFilter;
}

export interface QuoteInformationPendingFilter {
	finalizedAt: null;
	providerContact: { not: null };
	serial?: ContainsFilter;
}

export interface ProviderQuoteFilter {
	providerContact: null;
	serial?: ContainsFilter;
}

export interface ContainsFilter {
	contains: string;
	mode: "insensitive";
}

export type RoleFilter = Record<string, unknown>;

// User filter types
export interface UserWhereClause {
	active: boolean;
	role?: Role;
	OR?: Array<{
		name?: ContainsFilter;
		description?: ContainsFilter;
		phone?: ContainsFilter;
	}>;
}

export interface UserUpdateData {
	phone: string;
	name: string;
	email: string;
	role: Role;
	description?: string;
	password?: string;
}
