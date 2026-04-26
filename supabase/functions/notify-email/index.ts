import "jsr:@supabase/functions-js/edge-runtime.d.ts";

declare const Deno: any;

// ── Config ──────────────────────────────────────────
const RESEND_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const TO_EMAIL   = 'seyit.mehmet.aladag.work@gmail.com';
const FROM_EMAIL = 'GONICEON <noreply@goniceon.com>';

// ── Handler ─────────────────────────────────────────
Deno.serve(async (req: Request) => {
  try {
    const payload = await req.json();
    const r = payload?.record;           // Supabase webhook payload

    if (!r) {
      return new Response('No record', { status: 400 });
    }

    const adminHtml = `
      <div style="font-family:sans-serif;max-width:560px;margin:auto">
        <div style="background:#09080F;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:#1EFFC2;font-size:1.4rem;margin:0;letter-spacing:-1px">
            🔔 GONICEON<span style="color:#BF5AF2">.</span>
          </h1>
          <p style="color:#7070A0;font-size:.85rem;margin:4px 0 0">Yeni İletişim Formu Mesajı</p>
        </div>
        <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:28px 32px">
          <table style="width:100%;border-collapse:collapse">
            <tr>
              <td style="padding:8px 0;color:#6b7280;font-size:.82rem;width:100px;vertical-align:top">Ad Soyad</td>
              <td style="padding:8px 0;font-weight:600;font-size:.92rem">${r.name}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;font-size:.82rem;vertical-align:top">E-Posta</td>
              <td style="padding:8px 0">
                <a href="mailto:${r.email}" style="color:#1EFFC2;text-decoration:none">${r.email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;font-size:.82rem;vertical-align:top">Konu</td>
              <td style="padding:8px 0">${r.subject ?? '—'}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;font-size:.82rem;vertical-align:top">Mesaj</td>
              <td style="padding:8px 0;line-height:1.6">${r.message.replace(/\n/g, '<br>')}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;font-size:.82rem;vertical-align:top">Tarih</td>
              <td style="padding:8px 0;color:#9ca3af;font-size:.82rem">
                ${new Date(r.created_at).toLocaleString('tr-TR')}
              </td>
            </tr>
          </table>
          <div style="margin-top:20px;padding-top:16px;border-top:1px solid #f3f4f6">
            <a href="mailto:${r.email}?subject=Re: ${encodeURIComponent(r.subject ?? 'Mesajınız')}"
               style="display:inline-block;background:#09080F;color:#1EFFC2;padding:10px 22px;
                      border-radius:8px;text-decoration:none;font-size:.85rem;font-weight:600">
              ↩ Yanıtla
            </a>
          </div>
        </div>
        <p style="text-align:center;color:#9ca3af;font-size:.72rem;margin-top:16px">
          goniceon.dev · GONICEON Portfolio
        </p>
      </div>
    `;

    const autoReplyHtml = `
      <div style="font-family:sans-serif;max-width:560px;margin:auto">
        <div style="background:#09080F;padding:24px 32px;border-radius:12px 12px 0 0;text-align:center;">
          <h1 style="color:#1EFFC2;font-size:1.4rem;margin:0;letter-spacing:-1px">
            GONICEON<span style="color:#BF5AF2">.</span>
          </h1>
        </div>
        <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:28px 32px;color:#374151;line-height:1.6">
          <p style="margin-top:0">Merhaba <strong>${r.name}</strong>,</p>
          <p>Mesajınız tarafımıza başarıyla ulaştı. İlginiz için teşekkür ederiz!</p>
          <p>Ekiplerimiz ilettiğiniz detayları en kısa sürede inceleyip sizinle bu e-posta adresi üzerinden iletişime geçecektir.</p>
          <br/>
          <p style="margin:0;color:#6b7280;font-size:0.9rem">İyi çalışmalar dileriz,</p>
          <p style="margin-top:4px;font-weight:700;color:#09080F;font-size:1rem;">GONICEON Yazılım Ekibi</p>
        </div>
        <p style="text-align:center;color:#9ca3af;font-size:.72rem;margin-top:16px">
          Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayınız.
        </p>
      </div>
    `;

    const adminPromise = fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to:   TO_EMAIL,
        subject: `[GONICEON] ${r.subject ?? 'Yeni Mesaj'} — ${r.name}`,
        html: adminHtml,
      }),
    });

    const userPromise = fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to:   r.email,
        subject: `Mesajınız Bize Ulaştı — GONICEON`,
        html: autoReplyHtml,
      }),
    });

    const [adminRes, userRes] = await Promise.all([adminPromise, userPromise]);

    const adminData = await adminRes.json();
    const userData = await userRes.json();

    return new Response(JSON.stringify({ adminData, userData }), {
      headers: { 'Content-Type': 'application/json' },
      status: adminRes.status === 200 && userRes.status === 200 ? 200 : 500,
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
