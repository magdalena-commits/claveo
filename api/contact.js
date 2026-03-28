export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, person, email, tel, type, package: pkg } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Nedostaju obavezna polja' });
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

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from: 'Claveo <onboarding@resend.dev>',
      to: ['magdalena@lmkomunikacije.com'],
      subject: `Novi upit: ${name}`,
      html: html
    })
  });

  if (!response.ok) {
    const err = await response.json();
    return res.status(500).json({ error: err });
  }

  res.status(200).json({ ok: true });
}
