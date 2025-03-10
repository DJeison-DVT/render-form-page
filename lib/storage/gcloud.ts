import { Storage } from "@google-cloud/storage";

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

const savePDF = async (pdf: File, path: string) => {
	if (!pdf) throw new Error("No se ha proporcionado un archivo PDF");
	if (pdf.size < 1) throw new Error("El archivo PDF está vacío");

	console.log("Uploading PDF to GCP:", pdf.name);
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

export { savePDF };
