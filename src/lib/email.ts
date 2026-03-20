function getResend() {
  // Dynamic import to avoid Edge Runtime issues
  const { Resend } = require("resend");
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = process.env.EMAIL_FROM || "Glow Pass <hello@myglowpass.com>";
const REPLY_TO = process.env.EMAIL_REPLY_TO || "info@ticketezzy.com";
const ADMIN_EMAIL = "info@ticketezzy.com";

// ─── Brand colors & styles ───
const pink = "#e84393";
const purple = "#6b2fa0";
const dark = "#0d0b1a";
const muted = "#8b8b9e";

function layout(title: string, body: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:${dark};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <!-- Logo -->
    <div style="text-align:center;margin-bottom:32px;">
      <span style="display:inline-block;width:16px;height:16px;border-radius:50%;background:${purple};margin-right:4px;vertical-align:middle;"></span>
      <span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${pink};margin-right:8px;vertical-align:middle;"></span>
      <span style="color:white;font-size:12px;letter-spacing:3px;font-weight:800;text-transform:uppercase;vertical-align:middle;">GLOW PASS</span>
    </div>

    <!-- Card -->
    <div style="background:#1a1730;border:1px solid #2a2745;border-radius:12px;padding:32px;margin-bottom:24px;">
      <h1 style="color:white;font-size:22px;font-weight:800;margin:0 0 20px 0;">${title}</h1>
      ${body}
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding-top:16px;">
      <p style="color:${muted};font-size:11px;margin:0;">Glow Pass — The premium creator network for nightlife venues.</p>
      <p style="color:${muted};font-size:10px;margin:8px 0 0;font-style:italic;">"Access the city. Capture the glow."</p>
    </div>
  </div>
</body>
</html>`;
}

function text(content: string) {
  return `<p style="color:#c4c4d4;font-size:14px;line-height:1.7;margin:0 0 16px;">${content}</p>`;
}

function highlight(label: string, value: string) {
  return `<div style="background:#0d0b1a;border:1px solid #2a2745;border-radius:8px;padding:16px;margin:16px 0;text-align:center;">
    <div style="color:${muted};font-size:10px;text-transform:uppercase;letter-spacing:2px;font-weight:700;margin-bottom:6px;">${label}</div>
    <div style="color:${pink};font-size:24px;font-weight:800;letter-spacing:2px;">${value}</div>
  </div>`;
}

function button(url: string, label: string) {
  return `<div style="text-align:center;margin:24px 0 8px;">
    <a href="${url}" style="display:inline-block;background:${pink};color:white;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">${label}</a>
  </div>`;
}

function divider() {
  return `<div style="border-top:1px solid #2a2745;margin:20px 0;"></div>`;
}

// ═══════════════════════════════════════════
// OUTBOUND — Emails to Users
// ═══════════════════════════════════════════

export async function sendApplicationReceived(email: string, name: string, instagram: string) {
  const html = layout(
    "Application Received ✨",
    text(`Hey <strong style="color:white;">${name}</strong>,`) +
    text(`Thanks for applying to Glow Pass! We've received your application for <strong style="color:${pink};">@${instagram}</strong>.`) +
    text("Our team reviews every application personally. You'll hear back from us within <strong style='color:white;'>48 hours</strong>.") +
    divider() +
    text(`In the meantime, make sure your Instagram profile is <strong style="color:white;">public</strong> and showcases your best content — it helps us match you with the right venues.`) +
    text(`<span style="color:${muted};font-size:12px;">— The Glow Pass Team</span>`)
  );

  return getResend().emails.send({
    from: FROM,
    to: email,
    replyTo: REPLY_TO,
    subject: "We got your application! ✨",
    html,
  });
}

export async function sendCreatorApproved(email: string, name: string, accessCode: string) {
  const html = layout(
    "Welcome to Glow Pass 🎉",
    text(`Hey <strong style="color:white;">${name}</strong>,`) +
    text("Congratulations — you've been accepted into the Glow Pass creator network!") +
    text("Use the access code below to log in and start applying to exclusive events at top venues.") +
    highlight("Your Access Code", accessCode) +
    button(`https://myglowpass.com/login`, "Log In Now") +
    divider() +
    text(`<span style="color:${muted};font-size:12px;">Keep this code safe — it's your key to the network. Never share it publicly.</span>`)
  );

  return getResend().emails.send({
    from: FROM,
    to: email,
    replyTo: REPLY_TO,
    subject: "You're in! Welcome to Glow Pass 🎉",
    html,
  });
}

export async function sendCreatorRejected(email: string, name: string) {
  const html = layout(
    "Application Update",
    text(`Hey <strong style="color:white;">${name}</strong>,`) +
    text("Thank you for your interest in Glow Pass. After reviewing your profile, we've decided not to move forward at this time.") +
    text("This isn't necessarily permanent — as your profile grows, feel free to reapply in the future.") +
    text(`<span style="color:${muted};font-size:12px;">— The Glow Pass Team</span>`)
  );

  return getResend().emails.send({
    from: FROM,
    to: email,
    replyTo: REPLY_TO,
    subject: "Glow Pass — Application Update",
    html,
  });
}

export async function sendVenueApproved(email: string, venueName: string, accessCode: string) {
  const html = layout(
    "Your Venue is Live! 🎉",
    text(`<strong style="color:white;">${venueName}</strong> has been approved on Glow Pass!`) +
    text("You can now create events, accept creators, and manage check-ins from your venue dashboard.") +
    highlight("Your Venue Access Code", accessCode) +
    button(`https://myglowpass.com/login`, "Open Dashboard") +
    divider() +
    text(`<span style="color:${muted};font-size:12px;">Keep this code secure. Only share it with authorized team members.</span>`)
  );

  return getResend().emails.send({
    from: FROM,
    to: email,
    replyTo: REPLY_TO,
    subject: `${venueName} is live on Glow Pass! 🎉`,
    html,
  });
}

export async function sendEventAccepted(email: string, name: string, eventTitle: string, venueName: string, eventDate: string) {
  const html = layout(
    "You're In! 🎊",
    text(`Hey <strong style="color:white;">${name}</strong>,`) +
    text(`Great news — you've been accepted to <strong style="color:${pink};">${eventTitle}</strong> at <strong style="color:white;">${venueName}</strong>.`) +
    highlight("Event Date", eventDate) +
    text("Log in to your dashboard to view your <strong style='color:white;'>QR check-in code</strong>. Show it at the door on the night.") +
    button(`https://myglowpass.com/login`, "View My QR Code") +
    divider() +
    text(`<span style="color:${muted};font-size:12px;">Remember: No-shows receive a strike. If you can't make it, let us know in advance.</span>`)
  );

  return getResend().emails.send({
    from: FROM,
    to: email,
    replyTo: REPLY_TO,
    subject: `You're in! ${eventTitle} at ${venueName} 🎊`,
    html,
  });
}

export async function sendEventRejected(email: string, name: string, eventTitle: string) {
  const html = layout(
    "Event Application Update",
    text(`Hey <strong style="color:white;">${name}</strong>,`) +
    text(`Unfortunately, your application for <strong style="color:${pink};">${eventTitle}</strong> wasn't accepted this time. Spots are limited and venues choose based on profile fit.`) +
    text("Don't worry — keep applying to upcoming events. The more active your profile, the better your chances!") +
    button(`https://myglowpass.com/login`, "Browse Events") +
    text(`<span style="color:${muted};font-size:12px;">— The Glow Pass Team</span>`)
  );

  return getResend().emails.send({
    from: FROM,
    to: email,
    replyTo: REPLY_TO,
    subject: `Event update — ${eventTitle}`,
    html,
  });
}

export async function sendContentVerified(email: string, name: string, eventTitle: string, scoreAdded: number) {
  const html = layout(
    "Content Verified ✅",
    text(`Hey <strong style="color:white;">${name}</strong>,`) +
    text(`Your content for <strong style="color:${pink};">${eventTitle}</strong> has been verified and approved!`) +
    highlight("Content Score Added", `+${scoreAdded}`) +
    text("Keep up the great work — high content scores unlock higher tiers and better perks.") +
    button(`https://myglowpass.com/login`, "View My Profile") +
    text(`<span style="color:${muted};font-size:12px;">— The Glow Pass Team</span>`)
  );

  return getResend().emails.send({
    from: FROM,
    to: email,
    replyTo: REPLY_TO,
    subject: `Content approved! +${scoreAdded} points ✅`,
    html,
  });
}

export async function sendStrikeWarning(email: string, name: string, strikeCount: number, reason: string) {
  const isSuspended = strikeCount >= 3;
  const html = layout(
    isSuspended ? "Account Suspended ⚠️" : `Strike Warning — ${strikeCount}/3`,
    text(`Hey <strong style="color:white;">${name}</strong>,`) +
    text(`You've received a strike for: <strong style="color:#ff6b6b;">${reason}</strong>.`) +
    highlight("Strikes", `${strikeCount} / 3`) +
    (isSuspended
      ? text(`<span style="color:#ff6b6b;font-weight:700;">Your account has been suspended.</span> You've reached 3 strikes. Contact us to discuss reinstatement.`)
      : text(`Please take this seriously. At 3 strikes, your account will be <strong style="color:#ff6b6b;">automatically suspended</strong>.`)) +
    divider() +
    text(`<span style="color:${muted};font-size:12px;">If you believe this is a mistake, reply to this email.</span>`)
  );

  return getResend().emails.send({
    from: FROM,
    to: email,
    replyTo: REPLY_TO,
    subject: isSuspended ? "Your Glow Pass account has been suspended" : `Strike warning — ${strikeCount}/3`,
    html,
  });
}

// ═══════════════════════════════════════════
// INBOUND — Notifications to Admin
// ═══════════════════════════════════════════

export async function notifyAdminNewApplication(name: string, instagram: string, followers: number | string, email: string) {
  const html = layout(
    "New Creator Application 📩",
    text(`A new creator just applied to Glow Pass.`) +
    `<div style="background:#0d0b1a;border:1px solid #2a2745;border-radius:8px;padding:16px;margin:16px 0;">
      <p style="color:white;margin:0 0 8px;font-weight:700;font-size:16px;">${name}</p>
      <p style="color:${pink};margin:0 0 4px;font-size:14px;">@${instagram}</p>
      <p style="color:${muted};margin:0 0 4px;font-size:13px;">${followers} followers</p>
      <p style="color:${muted};margin:0;font-size:12px;">${email}</p>
    </div>` +
    button(`https://myglowpass.com/admin`, "Review Application")
  );

  return getResend().emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `New application: @${instagram} — ${name}`,
    html,
  });
}

export async function notifyAdminNewVenue(venueName: string, location: string, contactName: string, contactEmail: string) {
  const html = layout(
    "New Venue Registration 🏢",
    text(`A new venue just signed up on Glow Pass.`) +
    `<div style="background:#0d0b1a;border:1px solid #2a2745;border-radius:8px;padding:16px;margin:16px 0;">
      <p style="color:white;margin:0 0 8px;font-weight:700;font-size:16px;">${venueName}</p>
      <p style="color:${pink};margin:0 0 4px;font-size:14px;">${location}</p>
      <p style="color:${muted};margin:0 0 4px;font-size:13px;">Contact: ${contactName}</p>
      <p style="color:${muted};margin:0;font-size:12px;">${contactEmail}</p>
    </div>` +
    button(`https://myglowpass.com/admin`, "Review Venue")
  );

  return getResend().emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `New venue: ${venueName} — ${location}`,
    html,
  });
}

export async function notifyAdminContentSubmitted(creatorName: string, instagram: string, eventTitle: string, contentCount: number) {
  const html = layout(
    "Content Submitted 📸",
    text(`<strong style="color:white;">@${instagram}</strong> (${creatorName}) submitted <strong style="color:${pink};">${contentCount} content proof${contentCount > 1 ? "s" : ""}</strong> for <strong style="color:white;">${eventTitle}</strong>.`) +
    button(`https://myglowpass.com/admin`, "Review Content")
  );

  return getResend().emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `Content submitted: @${instagram} — ${eventTitle}`,
    html,
  });
}

export async function notifyAdminContactSales(data: {
  name: string;
  venueName: string;
  email: string;
  phone: string;
  message: string;
}) {
  const html = layout(
    "New Sales Inquiry 💰",
    text(`Someone just filled out the Contact Sales form.`) +
    `<div style="background:#0d0b1a;border:1px solid #2a2745;border-radius:8px;padding:16px;margin:16px 0;">
      <p style="color:white;margin:0 0 6px;font-weight:700;font-size:16px;">${data.name}</p>
      <p style="color:${pink};margin:0 0 4px;font-size:14px;">${data.venueName}</p>
      <p style="color:${muted};margin:0 0 4px;font-size:13px;">${data.email}</p>
      <p style="color:${muted};margin:0 0 12px;font-size:13px;">${data.phone}</p>
      <div style="border-top:1px solid #2a2745;padding-top:12px;">
        <p style="color:#c4c4d4;margin:0;font-size:13px;line-height:1.6;">${data.message}</p>
      </div>
    </div>` +
    text(`<span style="color:${muted};font-size:12px;">Reply directly to this email to respond to ${data.name}.</span>`)
  );

  return getResend().emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    replyTo: data.email,
    subject: `Sales inquiry: ${data.venueName} — ${data.name}`,
    html,
  });
}
