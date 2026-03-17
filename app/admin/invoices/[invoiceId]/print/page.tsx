import { notFound } from 'next/navigation';
import dbConnect from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

async function getInvoiceData(invoiceId: string) {
  await dbConnect();
  const { ClientInvoice } = await import('@/models/ClientInvoice');
  const { Account } = await import('@/models/Account');

  const invoice = await ClientInvoice.findById(invoiceId).lean();
  if (!invoice) return null;

  const client = await Account.findById(
    (invoice as any).clientId,
    'fullName email clientProfile',
  ).lean();

  return {
    invoice: JSON.parse(JSON.stringify(invoice)),
    client: client ? JSON.parse(JSON.stringify(client)) : null,
  };
}

export default async function InvoicePrintPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = await params;
  const data = await getInvoiceData(invoiceId);
  if (!data) notFound();

  const { invoice, client } = data;
  const currency = invoice.currency || 'USD';
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(n);

  const amountPaid = invoice.amountPaid ?? 0;
  const remaining = invoice.remainingBalance ?? invoice.amount - amountPaid;
  const paidPct = invoice.amount > 0 ? Math.min(100, (amountPaid / invoice.amount) * 100) : 0;

  const STATUS_COLOR: Record<string, string> = {
    paid:           '#059669',
    partially_paid: '#d97706',
    overdue:        '#dc2626',
    cancelled:      '#6b7280',
    draft:          '#6b7280',
    issued:         '#2563eb',
    sent:           '#0284c7',
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
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 14px;
            color: #111827;
            background: #fff;
            padding: 0;
          }
          .page {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 48px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-bottom: 32px;
            border-bottom: 2px solid #111827;
          }
          .brand-name { font-size: 20px; font-weight: 800; color: #111827; }
          .brand-sub  { font-size: 11px; color: #9ca3af; margin-top: 2px; }
          .invoice-title { font-size: 28px; font-weight: 900; color: #111827; letter-spacing: 2px; }
          .invoice-num   { font-size: 12px; color: #9ca3af; font-family: monospace; }

          .meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 32px;
            margin: 32px 0;
          }
          .meta-section h4 { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #9ca3af; margin-bottom: 8px; }
          .meta-section p  { font-size: 14px; font-weight: 600; color: #111827; }
          .meta-section .sub { font-size: 12px; color: #6b7280; font-weight: 400; }

          .dates-row { display: flex; gap: 40px; margin-bottom: 32px; }
          .date-item h4 { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #9ca3af; margin-bottom: 4px; }
          .date-item p  { font-size: 13px; font-weight: 600; color: #111827; }

          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          thead tr { background: #f9fafb; }
          th { padding: 10px 14px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #9ca3af; border-bottom: 1px solid #e5e7eb; }
          th.right, td.right { text-align: right; }
          th.center, td.center { text-align: center; }
          td { padding: 12px 14px; border-bottom: 1px solid #f3f4f6; font-size: 13px; color: #374151; }
          tfoot td { border-bottom: none; }
          .total-row td { padding: 14px; font-weight: 800; font-size: 15px; border-top: 2px solid #111827; }

          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: .06em;
            background: ${statusColor}18;
            color: ${statusColor};
            border: 1px solid ${statusColor}40;
          }

          .payment-section { margin-top: 24px; padding: 20px; background: #f9fafb; border-radius: 12px; }
          .payment-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 16px; }
          .payment-item h4 { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #9ca3af; margin-bottom: 4px; }
          .payment-item p  { font-size: 15px; font-weight: 800; }
          .progress-track { height: 6px; background: #e5e7eb; border-radius: 9999px; overflow: hidden; }
          .progress-fill  { height: 6px; background: #059669; border-radius: 9999px; }

          .payment-history { margin-top: 24px; }
          .payment-history h3 { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #9ca3af; margin-bottom: 12px; }

          .notes { margin-top: 32px; padding: 16px 20px; border-left: 3px solid #e5e7eb; }
          .notes h4 { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #9ca3af; margin-bottom: 6px; }
          .notes p  { font-size: 13px; color: #4b5563; }

          .footer {
            margin-top: 48px;
            padding-top: 24px;
            border-top: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 11px;
            color: #9ca3af;
          }

          .print-btn {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #111827;
            color: #fff;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          @media print {
            .print-btn { display: none !important; }
            body { padding: 0; }
            .page { padding: 24px 32px; }
          }
        `}</style>
      </head>
      <body>
        <button className="print-btn" onClick="window.print()">
          &#x1F5A8; Print / Save PDF
        </button>

        <div className="page">
          {/* Header */}
          <div className="header">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo_transparent.png"
                alt="LeoTheTechGuy"
                style={{ height: 36, marginBottom: 6, display: 'block' }}
              />
              <p className="brand-name">LeoTheTechGuy</p>
              <p className="brand-sub">contact@leothetechguy.com</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p className="invoice-title">INVOICE</p>
              <p className="invoice-num">{invoice.invoiceNumber}</p>
              <span className="status-badge" style={{ marginTop: 8, display: 'inline-block' }}>
                {invoice.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Bill To / Dates */}
          <div className="meta-grid">
            <div className="meta-section">
              <h4>Bill To</h4>
              <p>{client?.fullName || 'Unknown Client'}</p>
              <p className="sub">{client?.email || ''}</p>
              {client?.clientProfile?.phone && (
                <p className="sub">{client.clientProfile.phone}</p>
              )}
              {client?.clientProfile?.companyName && (
                <p className="sub">{client.clientProfile.companyName}</p>
              )}
            </div>
            <div className="meta-section">
              <h4>From</h4>
              <p>LeoTheTechGuy</p>
              <p className="sub">contact@leothetechguy.com</p>
              <p className="sub">leothetechguy.com</p>
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

          {/* Description */}
          {invoice.description && (
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 13, color: '#6b7280' }}>{invoice.description}</p>
            </div>
          )}

          {/* Line Items */}
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

          {/* Payment progress */}
          {amountPaid > 0 && (
            <div className="payment-section">
              <div className="payment-grid">
                <div className="payment-item">
                  <h4>Invoice Total</h4>
                  <p>{fmt(invoice.amount)}</p>
                </div>
                <div className="payment-item">
                  <h4>Amount Paid</h4>
                  <p style={{ color: '#059669' }}>{fmt(amountPaid)}</p>
                </div>
                <div className="payment-item">
                  <h4>Balance Due</h4>
                  <p style={{ color: remaining > 0 ? '#d97706' : '#059669' }}>{fmt(remaining)}</p>
                </div>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${paidPct}%` }} />
              </div>
            </div>
          )}

          {/* Payment History */}
          {invoice.paymentHistory?.length > 0 && (
            <div className="payment-history">
              <h3>Payment History</h3>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Method</th>
                    <th className="right">Amount</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.paymentHistory.map((p: any, i: number) => (
                    <tr key={i}>
                      <td>{p.recordedAt ? new Date(p.recordedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                      <td style={{ textTransform: 'capitalize' }}>{p.method || '—'}</td>
                      <td className="right" style={{ fontWeight: 700 }}>{fmt(p.amount)}</td>
                      <td style={{ color: '#6b7280' }}>{p.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Notes */}
          {invoice.notes && (
            <div className="notes">
              <h4>Notes</h4>
              <p>{invoice.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="footer">
            <span>LeoTheTechGuy · contact@leothetechguy.com</span>
            <span>Generated {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

        <script dangerouslySetInnerHTML={{ __html: `
          document.querySelector('.print-btn').addEventListener('click', function() {
            window.print();
          });
        ` }} />
      </body>
    </html>
  );
}
