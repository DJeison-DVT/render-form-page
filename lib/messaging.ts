"use server";

import twilio from "twilio";

const accountSid = process.env.NODE_TWILIO_ACCOUNT_SID;
const authToken = process.env.NODE_TWILIO_AUTH_TOKEN;

const client = twilio(accountSid, authToken);

export async function sendMessage(target: string, body: string) {
	const message = await client.messages.create({
		body,
		messagingServiceSid: process.env.NODE_TWILIO_MESSAGING_SERVICE_SID,
		from: process.env.NODE_TWILIO_PHONE_NUMBER,
		to: `whatsapp:+521${target}`,
	});

	// console.log(message);
}
