export const sendEmail = async (options) => {
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: "Job Portal",
          email: "talosync@gmail.com", // Use the email you used to sign up for Brevo
        },
        to: [{ email: options.to }],
        subject: options.subject,
        textContent: options.text,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Brevo API Error:", data);
    }
    return data;
  } catch (error) {
    console.error("Email processing error:", error);
  }
};
