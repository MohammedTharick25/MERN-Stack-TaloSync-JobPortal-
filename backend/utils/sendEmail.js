import { Resend } from "resend";

// Add RESEND_API_KEY to your Render Environment Variables
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (options) => {
  try {
    const data = await resend.emails.send({
      from: "JobPortal <onboarding@resend.dev>", // Use this default sender for testing
      to: options.to,
      subject: options.subject,
      text: options.text,
    });
    return data;
  } catch (error) {
    console.error("Resend Error:", error);
    throw error;
  }
};
