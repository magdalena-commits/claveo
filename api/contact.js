export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, person, email, tel, type, package: pkg } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Nedostaju obavezna polja' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Nevažeća email adresa' });
  }

  const html = `
    <h2>Novi upit s Claveo stranice</h2>
    <table style="border-collapse:collapse;width:100%;font-family:sans-serif;">
      <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5;">Hotel / Grupa</td><td style="padding:8px;">${name}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5;">Kontakt osoba</td><td style="padding:8px;">${person || '—'}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5;">Email</td><td style="padding:8px;">${email}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5;">Telefon</td><td style="padding:8px;">${tel || '—'}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5;">Tip hotela</td><td style="padding:8px;">${type || '—'}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5;">Paket</td><td style="padding:8px;">${pkg || '—'}</td></tr>
    </table>
  `;

  const confirmHtml = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
      <h2 style="color:#1A2B4A;">Hvala na upitu, ${person || name}!</h2>
      <p style="color:#4A5D80;line-height:1.7;">Primili smo vaš upit za <strong>${name}</strong> i javit ćemo vam se unutar <strong>24 sata</strong> s personaliziranim prijedlogom.</p>
      <div style="background:#EBF1FB;border-left:4px solid #3B6FBF;padding:16px 20px;margin:24px 0;border-radius:0 8px 8px 0;">
        <p style="margin:0;color:#1A2B4A;font-weight:600;">Što slijedi?</p>
        <ul style="color:#4A5D80;margin:8px 0 0;padding-left:20px;line-height:1.8;">
          <li>Analiziramo vaš objekt i potrebe</li>
          <li>Pripremamo konkretan prijedlog s cijenama</li>
          <li>Javljamo se unutar 24 sata radnim danom</li>
        </ul>
      </div>
      <p style="color:#7A8EB0;font-size:13px;">S poštovanjem,<br><strong>Magdalena Jaklin</strong><br>LM Komunikacije · Claveo</p>
    </div>
  `;

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
  };

  // Notify Magdalena
  const r1 = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      from: 'Claveo <onboarding@resend.dev>',
      to: [process.env.ADMIN_EMAIL || 'magdalena@lmkomunikacije.com'],
      subject: `Novi upit: ${name}`,
      html: html
    })
  });

  if (!r1.ok) {
    const err = await r1.json();
    return res.status(500).json({ error: err });
  }

  // Confirmation to visitor (best effort)
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      from: 'Claveo <onboarding@resend.dev>',
      to: [email],
      subject: 'Primili smo vaš upit — Claveo',
      html: confirmHtml
    })
  }).catch(() => {});

  res.status(200).json({ ok: true });
}
