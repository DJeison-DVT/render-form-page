import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Search } from "lucide-react";

import Image from "next/image";

interface ZoomableImageProps {
	imageUrl: string;
}

export default function ZoomableImage({ imageUrl }: ZoomableImageProps) {
	return (
		<>
			<Image
				src={imageUrl}
				alt="Selected"
				className="object-cover w-full h-full"
				width={100}
				height={100}
			/>

			<Dialog>
				<DialogTrigger>
					<div className="absolute top-0 right-0 p-2">
						<Search size={16} />
					</div>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Visualización de Imagen</DialogTitle>
					</DialogHeader>
					<Image
						src={imageUrl}
						alt="Selected"
						className="object-cover w-full h-full"
						width={600}
						height={600}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
}
