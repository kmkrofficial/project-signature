import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { db } from '@/lib/firebase-admin';

export async function POST(req: Request) {
    try {
        const { name, email, message } = await req.json();

        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'Name, email, and message are required fields.' },
                { status: 400 }
            );
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Please provide a valid email address.' },
                { status: 400 }
            );
        }

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error("Missing email configuration");
            return NextResponse.json(
                { error: 'Server configuration error: Missing email credentials' },
                { status: 500 }
            );
        }

        // Rate Limiting: Check for recent messages from this email in the last 15 minutes
        try {
            const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
            const querySnapshot = await db
                .collection("messages")
                .where("from", "==", email.toLowerCase().trim())
                .where("createdAt", ">", fifteenMinutesAgo)
                .get();

            if (!querySnapshot.empty) {
                return NextResponse.json(
                    { error: 'Rate limit exceeded. Please wait 15 minutes before sending another message.' },
                    { status: 429 }
                );
            }
        } catch (dbError) {
            console.warn("Rate limit check warning:", dbError);
        }

        // Persist message record to Firestore securely via Admin SDK
        try {
            await db.collection("messages").add({
                to: process.env.EMAIL_TO || process.env.EMAIL_USER,
                from: email.toLowerCase().trim(),
                name: name.trim(),
                message: message.trim(),
                createdAt: new Date(),
                read: false,
            });
        } catch (dbError) {
            console.error("Failed to persist message to database:", dbError);
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

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_TO || process.env.EMAIL_USER,
            subject: `New Portfolio Message from ${name.trim()}`,
            text: `
Name: ${name.trim()}
Email: ${email.trim()}

Message:
${message.trim()}
            `,
            html: `
<h3>New Message from Portfolio</h3>
<p><strong>Name:</strong> ${name.trim()}</p>
<p><strong>Email:</strong> ${email.trim()}</p>
<br/>
<p><strong>Message:</strong></p>
<p>${message.trim().replace(/\n/g, '<br>')}</p>
            `,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ success: true, message: 'Email sent successfully' });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error sending email:', errorMessage);
        return NextResponse.json(
            { error: 'Failed to send email', details: errorMessage },
            { status: 500 }
        );
    }
}
