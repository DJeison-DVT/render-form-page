"use server";

export async function buildImageURL(imagePath: string) {
	return `${process.env.NEXT_PUBLIC_BUCKET_URL}${imagePath}`;
}
