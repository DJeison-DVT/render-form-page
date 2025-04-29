import * as React from "react";

import { cn } from "@/lib/utils";

interface InputProps extends React.ComponentProps<"input"> {
	icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, icon, ...props }, ref) => {
		return (
			<div className={cn("relative w-full", className)}>
				{icon && (
					<span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
						{icon}
					</span>
				)}

				<input
					ref={ref}
					{...props}
					className={cn(
						"flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-90 md:text-sm",
						className,
						icon && "pl-8"
					)}
				/>
			</div>
		);
	}
);
Input.displayName = "Input";

export { Input };
