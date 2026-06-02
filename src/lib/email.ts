// src/lib/email.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL!;
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

// ─────────────────────────────────────────────
// Donation receipt email
// ─────────────────────────────────────────────
export async function sendDonationReceipt(params: {
  to: string;
  investor_name: string;
  amount_ghs: number;
  campaign_title: string;
  campaign_slug: string;
  reference: string;
}) {
  const { to, investor_name, amount_ghs, campaign_title, campaign_slug, reference } = params;

  await resend.emails.send({
    from: `${APP_NAME} <${FROM}>`,
    to,
    subject: `Your contribution to "${campaign_title}" was received 🙏`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #2d2416;">
        <div style="background: #c97520; padding: 32px; border-radius: 8px 8px 0 0;">
          <h1 style="color: #fff; margin: 0; font-size: 24px;">My Akhirah Project</h1>
        </div>
        <div style="background: #fdf6ee; padding: 32px; border-radius: 0 0 8px 8px;">
          <p style="font-size: 18px;">Assalamu alaikum, ${investor_name},</p>
          <p>JazakAllahu Khayran. Your contribution has been received and will go towards delivering essential items to communities in Northern Ghana.</p>
          
          <div style="background: #fff; border: 1px solid #e6aa5a; border-radius: 6px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0 0 8px;"><strong>Campaign:</strong> ${campaign_title}</p>
            <p style="margin: 0 0 8px;"><strong>Amount:</strong> GHS ${amount_ghs.toFixed(2)}</p>
            <p style="margin: 0;"><strong>Reference:</strong> ${reference}</p>
          </div>

          <p>You can track the progress of this campaign and see the impact report when it is published.</p>
          <a href="${APP_URL}/campaigns/${campaign_slug}" 
             style="display: inline-block; background: #c97520; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 8px;">
            View Campaign
          </a>

          <p style="margin-top: 32px; font-size: 13px; color: #7a6648;">
            My Akhirah Project is a charity initiative dedicated to delivering crucial items to remote communities in Northern Ghana.<br>
            <a href="${APP_URL}" style="color: #c97520;">${APP_URL}</a>
          </p>
        </div>
      </div>
    `,
  });
}

// ─────────────────────────────────────────────
// Campaign funded notification (to admin)
// ─────────────────────────────────────────────
export async function sendCampaignFundedNotification(params: {
  admin_email: string;
  campaign_title: string;
  campaign_id: string;
  total_raised: number;
}) {
  const { admin_email, campaign_title, campaign_id, total_raised } = params;

  await resend.emails.send({
    from: `${APP_NAME} <${FROM}>`,
    to: admin_email,
    subject: `🎉 Campaign fully funded: ${campaign_title}`,
    html: `
      <p>The campaign <strong>${campaign_title}</strong> has reached its fundraising goal!</p>
      <p>Total raised: <strong>GHS ${total_raised.toFixed(2)}</strong></p>
      <p><a href="${APP_URL}/admin/campaigns/${campaign_id}">Manage campaign →</a></p>
    `,
  });
}

// ─────────────────────────────────────────────
// Impact report notification to investors
// ─────────────────────────────────────────────
export async function sendImpactReportNotification(params: {
  to: string;
  investor_name: string;
  campaign_title: string;
  campaign_slug: string;
  report_summary: string;
}) {
  const { to, investor_name, campaign_title, campaign_slug, report_summary } = params;

  await resend.emails.send({
    from: `${APP_NAME} <${FROM}>`,
    to,
    subject: `See the impact of your contribution to "${campaign_title}" 🌟`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto;">
        <p>Assalamu alaikum, ${investor_name},</p>
        <p>Thanks to contributors like you, the <strong>${campaign_title}</strong> campaign has been completed. Here is a summary of the impact:</p>
        <blockquote style="border-left: 3px solid #c97520; padding-left: 16px; color: #5a4a30;">
          ${report_summary}
        </blockquote>
        <a href="${APP_URL}/campaigns/${campaign_slug}" style="color: #c97520;">See the full report with photos →</a>
      </div>
    `,
  });
}
