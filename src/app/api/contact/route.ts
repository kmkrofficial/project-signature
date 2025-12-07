import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    try {
        const { name, email, message } = await req.json();

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

        // Debug logging (Remove in production)
        console.log("Debug - Email Config:", {
            user: process.env.EMAIL_USER,
            passLength: process.env.EMAIL_PASS?.length,
            passExists: !!process.env.EMAIL_PASS
        });

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
            to: process.env.EMAIL_TO || process.env.EMAIL_USER, // Default to sender if no specific 'to' address
            subject: `New Portfolio Message from ${name}`,
            text: `
Name: ${name}
Email: ${email}

Message:
${message}
            `,
            html: `
<h3>New Message from Portfolio</h3>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<br/>
<p><strong>Message:</strong></p>
<p>${message.replace(/\n/g, '<br>')}</p>
            `,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ success: true, message: 'Email sent successfully' });
    } catch (error: any) {
        console.error('Error sending email:', error);
        return NextResponse.json(
            { error: 'Failed to send email', details: error.message },
            { status: 500 }
        );
    }
}
