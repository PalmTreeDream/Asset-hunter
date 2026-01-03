import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || "Palmtreedreamsinc@gmail.com";

export async function notifyWaitlistSignup(email: string, tier: string): Promise<void> {
  if (!resend) {
    console.log(`[Notifications] RESEND_API_KEY not set. Would notify: New waitlist signup - ${email} (${tier})`);
    return;
  }

  try {
    await resend.emails.send({
      from: "Asset Hunter <onboarding@resend.dev>",
      to: NOTIFY_EMAIL,
      subject: `New Waitlist Signup: ${tier.toUpperCase()}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0F1729 0%, #1a2744 100%); padding: 30px; border-radius: 12px; text-align: center;">
            <h1 style="color: #10B77F; margin: 0 0 10px 0; font-size: 24px;">New Waitlist Signup</h1>
            <p style="color: #ffffff; margin: 0; font-size: 16px;">Someone just joined the waitlist!</p>
          </div>
          
          <div style="background: #f8fafc; padding: 24px; border-radius: 12px; margin-top: 20px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">Email</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 14px; font-weight: 600; text-align: right;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">Tier Interest</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #10B77F; font-size: 14px; font-weight: 600; text-align: right;">${tier.charAt(0).toUpperCase() + tier.slice(1).replace('_', ' ')}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #64748b; font-size: 14px;">Time</td>
                <td style="padding: 12px 0; color: #0f172a; font-size: 14px; text-align: right;">${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET</td>
              </tr>
            </table>
          </div>
          
          <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 20px;">
            Asset Hunter Beta - Micro-Private Equity Engine
          </p>
        </div>
      `,
    });
    console.log(`[Notifications] Waitlist signup notification sent for ${email}`);
  } catch (error) {
    console.error("[Notifications] Failed to send waitlist notification:", error);
  }
}

export async function notifyPurchase(
  customerEmail: string,
  planName: string,
  amount: number,
  currency: string
): Promise<void> {
  if (!resend) {
    console.log(`[Notifications] RESEND_API_KEY not set. Would notify: New purchase - ${customerEmail} (${planName})`);
    return;
  }

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);

  try {
    await resend.emails.send({
      from: "Asset Hunter <onboarding@resend.dev>",
      to: NOTIFY_EMAIL,
      subject: `New Purchase: ${planName} - ${formattedAmount}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10B77F 0%, #059669 100%); padding: 30px; border-radius: 12px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 24px;">New Purchase!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px;">Someone just upgraded their account</p>
          </div>
          
          <div style="background: #f8fafc; padding: 24px; border-radius: 12px; margin-top: 20px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">Customer</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 14px; font-weight: 600; text-align: right;">${customerEmail}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">Plan</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #10B77F; font-size: 14px; font-weight: 600; text-align: right;">${planName}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">Amount</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 14px; font-weight: 600; text-align: right;">${formattedAmount}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #64748b; font-size: 14px;">Time</td>
                <td style="padding: 12px 0; color: #0f172a; font-size: 14px; text-align: right;">${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET</td>
              </tr>
            </table>
          </div>
          
          <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 20px;">
            Asset Hunter Beta - Micro-Private Equity Engine
          </p>
        </div>
      `,
    });
    console.log(`[Notifications] Purchase notification sent for ${customerEmail}`);
  } catch (error) {
    console.error("[Notifications] Failed to send purchase notification:", error);
  }
}

export async function notifyNewsletterSignup(email: string): Promise<void> {
  if (!resend) {
    console.log(`[Notifications] RESEND_API_KEY not set. Would notify: New newsletter signup - ${email}`);
    return;
  }

  try {
    await resend.emails.send({
      from: "Asset Hunter <onboarding@resend.dev>",
      to: NOTIFY_EMAIL,
      subject: `New Newsletter Signup`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; border-radius: 12px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 24px;">New Newsletter Subscriber</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px;">Your audience is growing!</p>
          </div>
          
          <div style="background: #f8fafc; padding: 24px; border-radius: 12px; margin-top: 20px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">Email</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 14px; font-weight: 600; text-align: right;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #64748b; font-size: 14px;">Time</td>
                <td style="padding: 12px 0; color: #0f172a; font-size: 14px; text-align: right;">${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET</td>
              </tr>
            </table>
          </div>
          
          <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 20px;">
            Asset Hunter Beta - Micro-Private Equity Engine
          </p>
        </div>
      `,
    });
    console.log(`[Notifications] Newsletter signup notification sent for ${email}`);
  } catch (error) {
    console.error("[Notifications] Failed to send newsletter notification:", error);
  }
}
