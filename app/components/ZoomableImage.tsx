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
				<DialogContent className="max-w-[95vw] max-h-[95vh]">
					<DialogHeader>
						<DialogTitle>Visualización de Imagen</DialogTitle>
					</DialogHeader>
					<div className="max-w-[90vw] max-h-[90vh] overflow-auto">
						<div className="relative w-full h-full min-h-[85vh] ">
							<Image
								src={imageUrl}
								alt="Selected"
								fill
								sizes="(max-width: 90vw) 90vw, (max-height: 90vh) 90vh"
								className="object-contain"
							/>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
