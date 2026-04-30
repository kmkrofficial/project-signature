import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(input: string): string {
    return input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const name = typeof body?.name === "string" ? body.name.trim() : "";
        const email = typeof body?.email === "string" ? body.email.trim() : "";
        const message = typeof body?.message === "string" ? body.message.trim() : "";

        // Input validation
        if (!name || name.length > 100) {
            return NextResponse.json({ error: "Invalid name (1-100 chars required)" }, { status: 400 });
        }
        if (!email || email.length > 254 || !EMAIL_REGEX.test(email)) {
            return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
        }
        if (!message || message.length > 5000) {
            return NextResponse.json({ error: "Message must be 1-5000 chars" }, { status: 400 });
        }

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error("Missing email configuration");
            return NextResponse.json(
                { error: 'Server configuration error: Missing email credentials' },
                { status: 500 }
            );
        }

        // Rate Limiting: Check for recent messages from this email
        try {
            const { db } = await import("@/lib/firebase");
            const { collection, query, where, getDocs, Timestamp } = await import("firebase/firestore");

            // Check for messages from this email in the last 15 minutes
            const fifteenMinutesAgo = Timestamp.fromMillis(Date.now() - 15 * 60 * 1000);
            const q = query(
                collection(db, "messages"),
                where("from", "==", email),
                where("createdAt", ">", fifteenMinutesAgo)
            );

            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                return NextResponse.json(
                    { error: 'Rate limit exceeded. Please wait 15 minutes before sending another message.' },
                    { status: 429 }
                );
            }
        } catch (dbError) {
            console.error("Rate limit check failed:", dbError);
            // Proceed cautiously even if DB check fails, or block? 
            // We'll proceed to allow email if DB is down, as failsafe.
        }

        // Clean password: remove spaces and trim
        const cleanPass = process.env.EMAIL_PASS?.replace(/\s+/g, '').trim();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: cleanPass,
            },
        });

        const safeName = escapeHtml(name);
        const safeEmail = escapeHtml(email);
        const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');

        const mailOptions = {
            from: process.env.EMAIL_USER,
            replyTo: email,
            to: process.env.EMAIL_TO || process.env.EMAIL_USER,
            subject: `New Portfolio Message from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
            html: `
<h3>New Message from Portfolio</h3>
<p><strong>Name:</strong> ${safeName}</p>
<p><strong>Email:</strong> ${safeEmail}</p>
<br/>
<p><strong>Message:</strong></p>
<p>${safeMessage}</p>
            `,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ success: true, message: 'Email sent successfully' });
    } catch (error: any) {
        console.error('Error sending email:', error);
        return NextResponse.json(
            { error: 'Failed to send email' },
            { status: 500 }
        );
    }
}
