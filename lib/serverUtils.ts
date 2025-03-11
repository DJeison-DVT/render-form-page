"use server";

export async function buildImageURL(imagePath: string) {
	return `${process.env.BUCKET_URL}${imagePath}`;
}
