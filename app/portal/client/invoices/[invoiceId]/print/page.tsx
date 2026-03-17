import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

async function getInvoiceForClient(invoiceId: string, accountId: string) {
  await dbConnect();
  const { ClientInvoice } = await import('@/models/ClientInvoice');

  const invoice = await ClientInvoice.findOne({ _id: invoiceId, clientId: accountId }).lean();
  return invoice ? JSON.parse(JSON.stringify(invoice)) : null;
}

export default async function ClientInvoicePrintPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = await params;
  const session = await auth();
  if (!session?.user?.accountId && !session?.user?.id) redirect('/portal/login');

  const invoice = await getInvoiceForClient(invoiceId, session.user.accountId || session.user.id);
  if (!invoice) notFound();

  const currency = invoice.currency || 'USD';
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(n);

  const amountPaid = invoice.amountPaid ?? 0;
  const remaining = invoice.remainingBalance ?? invoice.amount - amountPaid;
  const paidPct = invoice.amount > 0 ? Math.min(100, (amountPaid / invoice.amount) * 100) : 0;

  const STATUS_COLOR: Record<string, string> = {
    paid: '#059669', partially_paid: '#d97706', overdue: '#dc2626',
    cancelled: '#6b7280', draft: '#6b7280', issued: '#2563eb', sent: '#0284c7',
  };
  const statusColor = STATUS_COLOR[invoice.status] ?? '#6b7280';

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Invoice {invoice.invoiceNumber}</title>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; color: #111827; background: #fff; }
          .page { max-width: 800px; margin: 0 auto; padding: 40px 48px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 32px; border-bottom: 2px solid #111827; }
          .brand-name { font-size: 20px; font-weight: 800; }
          .brand-sub { font-size: 11px; color: #9ca3af; margin-top: 2px; }
          .inv-title { font-size: 28px; font-weight: 900; letter-spacing: 2px; }
          .inv-num { font-size: 12px; color: #9ca3af; font-family: monospace; }
          .status-badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; background: ${statusColor}18; color: ${statusColor}; border: 1px solid ${statusColor}40; margin-top: 8px; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin: 32px 0; }
          .meta-section h4 { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #9ca3af; margin-bottom: 8px; }
          .meta-section p { font-size: 14px; font-weight: 600; }
          .meta-section .sub { font-size: 12px; color: #6b7280; font-weight: 400; }
          .dates-row { display: flex; gap: 40px; margin-bottom: 32px; }
          .date-item h4 { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #9ca3af; margin-bottom: 4px; }
          .date-item p { font-size: 13px; font-weight: 600; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          thead tr { background: #f9fafb; }
          th { padding: 10px 14px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #9ca3af; border-bottom: 1px solid #e5e7eb; }
          th.right, td.right { text-align: right; }
          th.center, td.center { text-align: center; }
          td { padding: 12px 14px; border-bottom: 1px solid #f3f4f6; font-size: 13px; color: #374151; }
          tfoot td { border-bottom: none; }
          .total-row td { padding: 14px; font-weight: 800; font-size: 15px; border-top: 2px solid #111827; }
          .payment-section { margin-top: 24px; padding: 20px; background: #f9fafb; border-radius: 12px; }
          .payment-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 16px; }
          .payment-item h4 { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #9ca3af; margin-bottom: 4px; }
          .payment-item p { font-size: 15px; font-weight: 800; }
          .progress-track { height: 6px; background: #e5e7eb; border-radius: 9999px; overflow: hidden; }
          .progress-fill { height: 6px; background: #059669; border-radius: 9999px; }
          .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; font-size: 11px; color: #9ca3af; }
          .print-btn { position: fixed; top: 20px; right: 20px; background: #111827; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
          @media print { .print-btn { display: none !important; } .page { padding: 24px 32px; } }
        `}</style>
      </head>
      <body>
        <button className="print-btn" onClick="window.print()">🖨 Print / Save PDF</button>
        <div className="page">
          <div className="header">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo_transparent.png" alt="LeoTheTechGuy" style={{ height: 36, marginBottom: 6, display: 'block' }} />
              <p className="brand-name">LeoTheTechGuy</p>
              <p className="brand-sub">contact@leothetechguy.com</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p className="inv-title">INVOICE</p>
              <p className="inv-num">{invoice.invoiceNumber}</p>
              <span className="status-badge">{invoice.status.replace('_', ' ')}</span>
            </div>
          </div>

          <div className="meta-grid">
            <div className="meta-section">
              <h4>Issued To</h4>
              <p>{session.user.name || session.user.email}</p>
              <p className="sub">{session.user.email}</p>
            </div>
            <div className="meta-section">
              <h4>Issued By</h4>
              <p>LeoTheTechGuy</p>
              <p className="sub">contact@leothetechguy.com</p>
            </div>
          </div>

          <div className="dates-row">
            <div className="date-item">
              <h4>Issue Date</h4>
              <p>{invoice.issuedAt ? new Date(invoice.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</p>
            </div>
            <div className="date-item">
              <h4>Due Date</h4>
              <p>{invoice.dueAt ? new Date(invoice.dueAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</p>
            </div>
            {invoice.paidAt && (
              <div className="date-item">
                <h4>Paid On</h4>
                <p style={{ color: '#059669' }}>{new Date(invoice.paidAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            )}
          </div>

          {invoice.description && (
            <p style={{ marginBottom: 24, fontSize: 13, color: '#6b7280' }}>{invoice.description}</p>
          )}

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th className="center">Qty</th>
                <th className="right">Unit Price</th>
                <th className="right">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems?.length > 0 ? (
                invoice.lineItems.map((item: any, i: number) => (
                  <tr key={i}>
                    <td>{item.description}</td>
                    <td className="center">{item.quantity}</td>
                    <td className="right">{fmt(item.unitPrice)}</td>
                    <td className="right">{fmt(item.total)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: '#9ca3af', padding: '24px 14px' }}>
                    {invoice.description || 'Professional Services'}
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="total-row">
                <td colSpan={3} style={{ textAlign: 'right' }}>Total Amount</td>
                <td className="right">{fmt(invoice.amount)}</td>
              </tr>
            </tfoot>
          </table>

          {amountPaid > 0 && (
            <div className="payment-section">
              <div className="payment-grid">
                <div className="payment-item"><h4>Invoice Total</h4><p>{fmt(invoice.amount)}</p></div>
                <div className="payment-item"><h4>Amount Paid</h4><p style={{ color: '#059669' }}>{fmt(amountPaid)}</p></div>
                <div className="payment-item"><h4>Balance Due</h4><p style={{ color: remaining > 0 ? '#d97706' : '#059669' }}>{fmt(remaining)}</p></div>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${paidPct}%` }} />
              </div>
            </div>
          )}

          <div className="footer">
            <span>LeoTheTechGuy · contact@leothetechguy.com</span>
            <span>Generated {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
        <script dangerouslySetInnerHTML={{ __html: `document.querySelector('.print-btn').addEventListener('click', () => window.print());` }} />
      </body>
    </html>
  );
}
