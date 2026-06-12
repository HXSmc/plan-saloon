// Provider-agnostic notification pipeline. Fired after a successful booking
// write. Ships a console adapter (default, no account needed) + a Resend email
// adapter that activates automatically when RESEND_API_KEY is set. Swap in an
// SMS/WhatsApp adapter later by implementing the same NotifyAdapter shape.

export type BookingNotification = {
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  serviceName: string;
  barberName: string;
  startTime: Date;
  price: number;
};

interface NotifyAdapter {
  send(n: BookingNotification): Promise<void>;
}

function formatWhen(d: Date): string {
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Riyadh",
  });
}

const consoleAdapter: NotifyAdapter = {
  async send(n) {
    console.log(
      [
        "",
        "📅 ─── Booking Confirmation ───────────────",
        `  Customer : ${n.customerName} (${n.customerPhone})`,
        `  Service  : ${n.serviceName} — SAR ${n.price}`,
        `  Barber   : ${n.barberName}`,
        `  When     : ${formatWhen(n.startTime)}`,
        n.customerEmail ? `  Email    : ${n.customerEmail}` : null,
        "───────────────────────────────────────────",
      ]
        .filter(Boolean)
        .join("\n")
    );
  },
};

const resendAdapter: NotifyAdapter = {
  async send(n) {
    if (!n.customerEmail) return;
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const when = formatWhen(n.startTime);
    await resend.emails.send({
      from: process.env.RESEND_FROM ?? "Action Plan <bookings@actionplan.sa>",
      to: n.customerEmail,
      subject: "Your Action Plan Barbershop booking is confirmed ✂️",
      html: `
        <div style="background:#0e1013;color:#f4efe3;font-family:Georgia,serif;padding:32px;border-radius:16px;max-width:480px;margin:auto">
          <div style="font-family:Arial,sans-serif;font-weight:900;font-size:22px">
            <span style="color:#ffd11a;text-shadow:0 0 10px rgba(255,209,26,.6)">A</span>ction plan
            <span style="display:block;font-size:10px;letter-spacing:4px;color:#cfc8b8">BARBERSHOP</span>
          </div>
          <h1 style="color:#ffd11a;margin:24px 0 8px">You're booked!</h1>
          <p style="color:#cfc8b8;margin:0 0 20px">See you soon, ${n.customerName}.</p>
          <table style="width:100%;border-collapse:collapse;color:#f4efe3;font-size:14px">
            <tr><td style="padding:6px 0;color:#cfc8b8">Service</td><td style="text-align:right">${n.serviceName} — SAR ${n.price}</td></tr>
            <tr><td style="padding:6px 0;color:#cfc8b8">Barber</td><td style="text-align:right">${n.barberName}</td></tr>
            <tr><td style="padding:6px 0;color:#cfc8b8">When</td><td style="text-align:right">${when}</td></tr>
          </table>
        </div>`,
    });
  },
};

function activeAdapters(): NotifyAdapter[] {
  const adapters: NotifyAdapter[] = [consoleAdapter];
  if (process.env.RESEND_API_KEY) adapters.push(resendAdapter);
  return adapters;
}

/** Fire all active notification adapters. Never throws — logs and continues. */
export async function notify(n: BookingNotification): Promise<void> {
  await Promise.all(
    activeAdapters().map((a) =>
      a.send(n).catch((err) => console.error("[notify] adapter failed:", err))
    )
  );
}
