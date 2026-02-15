import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function sendInviteEmail(email: string, inviteUrl: string) {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "You’ve been invited to TeamOS",
      html: `
        <p>You’ve been invited to join an organization on TeamOS.</p>
        <p><a href="${inviteUrl}">Accept Invitation</a></p>
        <p>This link expires in 48 hours.</p>
      `,
    }).then((response) => {
      if (response.error) {
        console.error("Email failed:", response.error)
        throw new Error("Failed to send invitation email")
      }
    }).catch((error) => {
      console.error("Email failed:", error)
      // throw new Error("Failed to send invitation email")
    })
}
