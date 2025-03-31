// app/api/generate-quote/route.ts
import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import handlebars from "handlebars";
import fs from "fs";
import path from "path";

// Register a helper to format the date
handlebars.registerHelper("formatDate", (dateStr: string) => {
	const date = new Date(dateStr);
	return date.toLocaleDateString("es-MX", {
		day: "2-digit",
		month: "long",
		year: "numeric",
	});
});

// Register a helper to format currency to MXN
handlebars.registerHelper("formatCurrencyMXN", (value: number) => {
	return new Intl.NumberFormat("es-MX", {
		style: "currency",
		currency: "MXN",
	}).format(value);
});

// Register a helper to multiply two numbers
handlebars.registerHelper("multiply", (a: number, b: number) => {
	return a * b;
});

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);

		const data = {
			client: "Cosmic",
			brand: "CPW",
			createdAt: new Date().toISOString(),
			quotes: [
				{
					entries: [
						{
							material: "Botadero",
							concept:
								"Botadero fabricado en Carton Corrugado Sencillo...",
							sizes: "130 x 60 x 50",
							range: 50,
							imageUrl: `/logo.png`,
							unitaryFinalPrice: 123.45,
						},
						{
							material: "Botadero",
							concept:
								"Botadero fabricado en Carton Corrugado Sencillo...",
							sizes: "130 x 60 x 50",
							range: 100,
							imageUrl: `/logo.png`,
							unitaryFinalPrice: 234.56,
						},
						{
							material: "Botadero",
							concept:
								"Botadero fabricado en Carton Corrugado Sencillo...",
							sizes: "130 x 60 x 50",
							range: 150,
							imageUrl: `/logo.png`,
							unitaryFinalPrice: 345.67,
						},
					],
				},
			],
		};

		const templatePath = path.resolve(
			process.cwd(),
			"app",
			"templates",
			"quote.hbs"
		);
		const templateHtml = fs.readFileSync(templatePath, "utf8");
		const template = handlebars.compile(templateHtml);
		const html = template(data);

		const browser = await puppeteer.launch({ headless: true });
		const page = await browser.newPage();
		await page.setContent(html, { waitUntil: "networkidle0" });

		const pdfBuffer = await page.pdf({
			format: "A4",
			landscape: true,
			printBackground: true,
		});

		await browser.close();

		// Return the PDF as a response
		return new NextResponse(pdfBuffer, {
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": 'inline; filename="quote.pdf"',
			},
		});
	} catch (error) {
		console.error("Error generating PDF:", error);
		return NextResponse.json(
			{ message: "Error generating PDF" },
			{ status: 500 }
		);
	}
}
