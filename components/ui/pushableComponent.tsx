import { ReactNode } from "react";

const PushableComponent = ({
	children,
	onClick,
}: {
	children: ReactNode;
	onClick?: () => void;
}) => {
	return (
		<div
			onClick={onClick}
			className="hover:bg-slate-200 rounded-full p-1 cursor-pointer transition-colors duration-300 ease-in-out"
		>
			{children}
		</div>
	);
};

export default PushableComponent;
