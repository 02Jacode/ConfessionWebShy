// Email layout for the "she said yes" notification.
// Email apps (Gmail, Outlook) ignore most modern CSS, so this uses
// tables and inline styles only, with solid colors as fallbacks.

const C = {
  cream: "#fff6ef",
  blush: "#ffe3e3",
  rose: "#ffd0d6",
  paper: "#fffaf3",
  petal: "#e8364f",
  hibiscus: "#b3122e",
  deep: "#6d0f1f",
  ink: "#3b1218",
  muted: "#8a4a52",
  leaf: "#2f6b3a",
};

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "'Segoe UI', Helvetica, Arial, sans-serif";

const escapeHtml = (text: string) => text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

type Options = {
  // "yes": she tapped "Oo, pwede". "think": she tapped "Pag-iisipan ko muna".
  // "no": she tapped "Hindi talaga". "slow": she tapped "Masyadong mabilis".
  // "message": a letter she wrote.
  kind: "yes" | "think" | "no" | "slow" | "message";
  message: string;
  sentAt: string;
};

// Thin line with a flower in the middle, used as a section divider
const divider = (icon: string) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
    <tr>
      <td width="45%" style="border-bottom:1px solid ${C.rose};font-size:0;line-height:0">&nbsp;</td>
      <td width="10%" align="center" style="font-size:18px;line-height:1;padding:0 8px">${icon}</td>
      <td width="45%" style="border-bottom:1px solid ${C.rose};font-size:0;line-height:0">&nbsp;</td>
    </tr>
  </table>`;

export function buildEmail({ kind, message, sentAt }: Options) {
  const COPY = {
    yes: {
      subject: "She said YES! 🌺",
      eyebrow: "Your answer is here",
      title: "She said yes!",
      subtitle: "She tapped &ldquo;Oo, pwede&rdquo; on your gumamela page",
      preheader: "She said yes to you!",
      note: "Pwede ka na raw manligaw. 🌺<br>Good luck!",
      plainNote: 'She tapped "Oo, pwede". Pwede ka na raw manligaw. Good luck!',
    },
    think: {
      subject: "She's thinking about it 🤔",
      eyebrow: "Your answer is here",
      title: "She needs a little time",
      subtitle: "She tapped &ldquo;Pag-iisipan ko muna&rdquo; on your gumamela page",
      preheader: "Hindi pa yes, pero hindi rin no.",
      note: "Hindi pa yes, pero hindi rin no. 🌱<br>Be patient, gumamelas bloom in their own time.",
      plainNote:
        'She tapped "Pag-iisipan ko muna". Hindi pa yes, pero hindi rin no. Be patient, gumamelas bloom in their own time.',
    },
    no: {
      subject: "She answered: Hindi talaga",
      eyebrow: "Your answer is here",
      title: "She said no",
      subtitle: "She tapped &ldquo;Hindi talaga&rdquo; on your gumamela page",
      preheader: "Not the answer you hoped for, but you were brave.",
      note: "Hindi ito ang sagot na hinihintay mo. 🌱<br>Pero matapang ka sa pagsabi, and that matters.",
      plainNote:
        'She tapped "Hindi talaga". Hindi ito ang sagot na hinihintay mo, pero matapang ka sa pagsabi, and that matters.',
    },
    slow: {
      subject: "She answered: Masyadong mabilis 🌱",
      eyebrow: "Your answer is here",
      title: "She wants to take it slow",
      subtitle: "She tapped &ldquo;Masyadong mabilis&rdquo; on your gumamela page",
      preheader: "Not a no, just slower.",
      note: "Hindi no, dahan-dahan lang daw. 🌱<br>Get to know each other more, at her pace.",
      plainNote:
        'She tapped "Masyadong mabilis". Hindi no, dahan-dahan lang daw. Get to know each other more, at her pace.',
    },
    message: {
      subject: "A message from her 💌",
      eyebrow: "A new letter for you",
      title: "She wrote to you",
      subtitle: "May bagong mensahe galing sa kanya",
      preheader: message.slice(0, 90),
      note: "",
      plainNote: "",
    },
  }[kind];
  const { subject, eyebrow, title, subtitle, preheader } = COPY;

  const letter = kind === "message"
    ? `<p style="margin:0 0 14px;font-family:${SERIF};font-size:20px;font-style:italic;color:${C.hibiscus}">Dear Jacob,</p>
       <p style="margin:0;font-family:${SERIF};font-size:18px;line-height:1.75;color:${C.ink}">
         ${escapeHtml(message).replace(/\n/g, "<br>")}
       </p>
       <p style="margin:22px 0 0;font-family:${SERIF};font-size:18px;font-style:italic;color:${C.hibiscus};text-align:right">
         &mdash; her &#9825;
       </p>`
    : `<p style="margin:0;font-family:${SERIF};font-size:19px;line-height:1.6;font-style:italic;color:${C.muted};text-align:center">
         ${COPY.note}
       </p>`;

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:${C.blush}">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.blush};background-image:linear-gradient(180deg,${C.blush},${C.cream});border-collapse:collapse">
    <tr>
      <td align="center" style="padding:36px 12px 28px">

        <!-- Petal border on top of the card -->
        <p style="margin:0 0 14px;font-size:20px;letter-spacing:10px;line-height:1">🌺🌸🌺</p>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;border-collapse:separate;background:#ffffff;border-radius:28px;overflow:hidden;box-shadow:0 18px 40px rgba(179,18,46,0.18)">

          <!-- Header -->
          <tr>
            <td align="center" style="background:${C.hibiscus};background-image:linear-gradient(135deg,${C.petal} 0%,${C.hibiscus} 55%,${C.deep} 100%);padding:40px 28px 34px">
              <p style="margin:0 0 12px;font-family:${SANS};font-size:11px;font-weight:bold;letter-spacing:3px;text-transform:uppercase;color:${C.rose}">${eyebrow}</p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:separate;margin:0 auto">
                <tr>
                  <td align="center" width="88" height="88" style="width:88px;height:88px;border-radius:44px;background:#ffffff;font-size:48px;line-height:88px">🌺</td>
                </tr>
              </table>
              <h1 style="margin:18px 0 8px;font-family:${SERIF};font-size:32px;line-height:1.2;font-weight:normal;color:#ffffff">${title}</h1>
              <p style="margin:0;font-family:${SANS};font-size:15px;line-height:1.5;color:${C.blush}">${subtitle}</p>
            </td>
          </tr>

          <!-- Letter -->
          <tr>
            <td style="padding:30px 24px 6px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate">
                <tr>
                  <td style="background:${C.paper};border:1px dashed ${C.rose};border-radius:18px;padding:26px 24px">
                    ${letter}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider + time -->
          <tr>
            <td style="padding:24px 28px 30px">
              ${divider("🧸")}
              <p style="margin:16px 0 0;font-family:${SANS};font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:${C.muted};text-align:center">Received</p>
              <p style="margin:4px 0 0;font-family:${SERIF};font-size:16px;color:${C.ink};text-align:center">${sentAt}</p>
            </td>
          </tr>

          <!-- Bottom band -->
          <tr>
            <td align="center" style="background:${C.cream};border-top:1px solid ${C.blush};padding:18px 24px">
              <p style="margin:0;font-family:${SERIF};font-size:14px;font-style:italic;color:${C.hibiscus}">
                Like the gumamela, bloom every day. &#9825;
              </p>
            </td>
          </tr>
        </table>

        <p style="margin:18px 0 0;font-family:${SANS};font-size:12px;color:${C.muted}">
          Sent from your gumamela page 🌺🧸
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    title,
    "",
    kind === "message" ? `Dear Jacob,\n\n${message}\n\n— Shy ♡` : COPY.plainNote,
    "",
    `Received: ${sentAt}`,
  ].join("\n");

  return { subject, html, text };
}
