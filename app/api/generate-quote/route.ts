// app/api/generate-quote/route.ts
import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import handlebars from "handlebars";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

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

const imageUrls = {
	alquipop: "/alquipop-logo.svg",
	demente: "/demente-logo.png",
};

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);

		const quoteId = searchParams.get("quoteId");
		if (!quoteId) {
			return NextResponse.json(
				{ message: "Quote ID is required" },
				{ status: 400 }
			);
		}

		const quoteInformation = await prisma.quoteInformation.findUnique({
			where: {
				id: quoteId,
			},
			include: {
				quotes: {
					include: {
						entries: true,
					},
					orderBy: {
						createdAt: "desc",
					},
					take: 1,
				},
			},
		});

		if (!quoteInformation) {
			return NextResponse.json(
				{ message: "Quote not found" },
				{ status: 404 }
			);
		}

		const companyKey = quoteInformation.company as keyof typeof imageUrls;
		quoteInformation.company = `${process.env.NEXTAUTH_URL}${imageUrls[companyKey]}`;
		quoteInformation.quotes[0].entries.forEach((entry) => {
			entry.imageUrl = `${process.env.NEXT_PUBLIC_BUCKET_URL}${entry.imageUrl}`;
		});

		console.log("Rendering PDF for quote ID:", quoteId);
		const templatePath = path.resolve(
			process.cwd(),
			"app",
			"templates",
			"quote.hbs"
		);
		const templateHtml = fs.readFileSync(templatePath, "utf8");
		const template = handlebars.compile(templateHtml);
		const html = template(quoteInformation);

		const browser = await puppeteer.launch({
			headless: true,
			args: [
				"--no-sandbox",
				"--disable-setuid-sandbox",
				"--disable-dev-shm-usage",
				"--disable-accelerated-2d-canvas",
				"--disable-gpu",
			],
			executablePath: "/usr/bin/google-chrome-stable", // path to Google Chrome
		});
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
