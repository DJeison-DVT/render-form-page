"use client";

import { useToast } from "@/hooks/use-toast";
import { Role } from "@prisma/client";
import { useParams, useSearchParams } from "next/navigation";

export default function Page() {
	const { id } = useParams();

	if (!id || Array.isArray(id)) {
		return <div>Error: ID invalido</div>;
	}

	const searchParams = useSearchParams();
	const role = searchParams.get("role") as Role;
	const { toast } = useToast();

	return <div>{id}</div>;
}
