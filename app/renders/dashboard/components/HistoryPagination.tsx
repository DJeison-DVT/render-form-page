"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
	PaginationEllipsis,
} from "@/components/ui/pagination";
import {
	Popover,
	PopoverTrigger,
	PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface HistoryPaginationProps {
	page: number;
	totalPages: number;
	query: string;
}

export default function HistoryPagination({
	page = 1,
	totalPages = 1,
	query,
}: HistoryPaginationProps) {
	const router = useRouter();
	const [jump, setJump] = useState("");

	const baseHref = (p: number) =>
		`/renders/dashboard/history?page=${p}&query=${encodeURIComponent(
			query
		)}`;

	// handler for Enter in quick jump
	const onJump = () => {
		const p = parseInt(jump, 10);
		if (!isNaN(p) && p >= 1 && p <= totalPages) {
			router.push(baseHref(p));
		}
	};

	return (
		<Pagination>
			<PaginationContent>
				{page > 1 && (
					<PaginationItem>
						<PaginationPrevious href={baseHref(page - 1)} />
					</PaginationItem>
				)}

				<PaginationItem>
					<PaginationLink
						href={baseHref(1)}
						aria-current={page === 1 ? "page" : undefined}
						className={cn(page === 1 && "font-semibold")}
					>
						1
					</PaginationLink>
				</PaginationItem>

				{/* Ellipsis with quick jump before current */}
				{page > 2 && (
					<PaginationItem>
						<Popover>
							<PopoverTrigger asChild>
								<span className="cursor-pointer">
									<PaginationEllipsis />
								</span>
							</PopoverTrigger>
							<PopoverContent className="w-32 p-2">
								<Input
									placeholder="Ir a página"
									value={jump}
									onChange={(e) =>
										setJump(e.currentTarget.value)
									}
									onKeyDown={(e) => {
										if (e.key === "Enter") onJump();
									}}
								/>
							</PopoverContent>
						</Popover>
					</PaginationItem>
				)}

				{/* Current page (if not 1 or last) */}
				{page > 1 && page < totalPages && (
					<PaginationItem>
						<PaginationLink
							href={baseHref(page)}
							aria-current="page"
							className="font-semibold"
						>
							{page}
						</PaginationLink>
					</PaginationItem>
				)}

				{/* Ellipsis with quick jump after current */}
				{page < totalPages - 1 && (
					<PaginationItem>
						<Popover>
							<PopoverTrigger asChild>
								<span className="cursor-pointer">
									<PaginationEllipsis />
								</span>
							</PopoverTrigger>
							<PopoverContent className="w-32 p-2">
								<Input
									placeholder="Ir a página"
									value={jump}
									onChange={(e) =>
										setJump(e.currentTarget.value)
									}
									onKeyDown={(e) => {
										if (e.key === "Enter") onJump();
									}}
								/>
							</PopoverContent>
						</Popover>
					</PaginationItem>
				)}

				{totalPages > 1 && (
					<PaginationItem>
						<PaginationLink
							href={baseHref(totalPages)}
							aria-current={
								page === totalPages ? "page" : undefined
							}
							className={cn(
								page === totalPages && "font-semibold"
							)}
						>
							{totalPages}
						</PaginationLink>
					</PaginationItem>
				)}

				{page < totalPages && (
					<PaginationItem>
						<PaginationNext href={baseHref(page + 1)} />
					</PaginationItem>
				)}
			</PaginationContent>
		</Pagination>
	);
}
