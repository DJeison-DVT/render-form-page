import { Storage } from "@google-cloud/storage";
import crypto from "crypto";

const BUCKET_NAME = "render_forms";

async function generateV4UploadSignedUrl(path: string, contentType: string) {
	const storage = new Storage({
		keyFilename: process.env.KEYFILE_NAME,
	});
	console.log("Generating signed URL for GCP:", path);

	const [url] = await storage
		.bucket(BUCKET_NAME)
		.file(path)
		.getSignedUrl({
			action: "write",
			version: "v4",
			expires: Date.now() + 15 * 60 * 1000,
			contentType,
		});

	console.log("Generated GET signed URL:", url);
	return url;
}

async function fileExistsInBucket(hash: string, extension: string) {
	const storage = new Storage({
		keyFilename: process.env.KEYFILE_NAME,
	});
	const file = storage.bucket(BUCKET_NAME).file(`${hash}${extension}`);
	const [exists] = await file.exists();
	return exists;
}

const hashImage = async (image: File): Promise<string> => {
	const buffer = await image.arrayBuffer(); // Convert File to ArrayBuffer
	const hash = crypto
		.createHash("md5")
		.update(Buffer.from(buffer))
		.digest("hex");
	return hash;
};
const upsertImage = async (image: File) => {
	const fileHash = await hashImage(image);
	const extension = image.name.split(".").pop()?.toLowerCase() || null;
	if (!extension || !["png", "jpg", "jpeg", "webp"].includes(extension)) {
		throw new Error(
			"Extension invalida, solo se permiten png, jpg, jpeg y webp"
		);
	}

	const filePath = `${fileHash}.${extension}`;

	const exists = await fileExistsInBucket(fileHash, `.${extension}`);
	if (exists) {
		return filePath;
	}

	const buffer = await image.arrayBuffer();

	const url = await generateV4UploadSignedUrl(filePath, image.type);
	const response = await fetch(url, {
		method: "PUT",
		headers: {
			"Content-Type": image.type,
		},
		body: Buffer.from(buffer),
	});

	console.log("Uploaded image to GCP:", response.status);
	return filePath;
};

const savePDF = async (pdf: File, path: string) => {
	if (!pdf) throw new Error("No se ha proporcionado un archivo PDF");
	if (pdf.size < 1) throw new Error("El archivo PDF está vacío");

	const buffer = await pdf.arrayBuffer();

	const url = await generateV4UploadSignedUrl(path, "application/pdf");
	const response = await fetch(url, {
		method: "PUT",
		headers: {
			"Content-Type": "application/pdf",
		},
		body: Buffer.from(buffer),
	});

	console.log("Uploaded PDF to GCP:", response.status);
};

export { savePDF, upsertImage };
