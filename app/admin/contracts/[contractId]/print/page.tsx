import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { getAdminContract } from '@/lib/actions/admin-contracts';
import PrintButton from './PrintButton';
import { isHtmlContent } from '@/lib/contract-utils';

export const dynamic = 'force-dynamic';

export default async function AdminContractPrintPage({
  params,
}: {
  params: Promise<{ contractId: string }>;
}) {
  const session = await auth();
  if (session?.user?.role !== 'admin') redirect('/admin/login');

  const { contractId } = await params;
  const data = await getAdminContract(contractId);
  if (!data) notFound();

  const { contract, client } = data;
  const isHtml = contract.isHtml || isHtmlContent(contract.content || '');

  const generatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const contractDate = contract.createdAt
    ? new Date(contract.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : generatedDate;

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>[ADMIN] {contract.contractNumber} — {contract.title}</title>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            font-size: 14px;
            color: #111827;
            background: #fff;
          }
          .page { max-width: 820px; margin: 0 auto; padding: 40px 56px; }

          /* ── Cover page ── */
          .cover-page {
            min-height: 72vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 60px 48px;
            border-bottom: 3px solid #111827;
            margin-bottom: 40px;
          }
          .cover-logo { height: 48px; margin-bottom: 16px; display: block; }
          .cover-company { font-size: 13px; font-weight: 700; color: #6b7280; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 4px; }
          .cover-email { font-size: 12px; color: #9ca3af; margin-bottom: 48px; }
          .cover-doc-type { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #9ca3af; margin-bottom: 12px; }
          .cover-title { font-size: 32px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; color: #111827; margin-bottom: 48px; line-height: 1.15; }
          .cover-for { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; margin-bottom: 8px; }
          .cover-client { font-size: 20px; font-weight: 800; color: #111827; margin-bottom: 4px; }
          .cover-client-email { font-size: 13px; color: #6b7280; margin-bottom: 32px; }
          .cover-date { font-size: 13px; color: #6b7280; }
          .cover-number { font-size: 11px; font-family: monospace; color: #9ca3af; margin-top: 8px; }

          /* ── Page break ── */
          .page-break { page-break-after: always; }
          @media screen { .page-break { height: 40px; border-bottom: 2px dashed #e5e7eb; margin: 40px 0; } }

          /* ── Document header ── */
          .doc-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #e5e7eb;
            margin-bottom: 32px;
          }
          .doc-header-brand { font-size: 13px; font-weight: 700; color: #111827; }
          .doc-header-title { font-size: 12px; color: #9ca3af; text-align: right; }

          /* ── Contract body HTML styles ── */
          .contract-body { line-height: 1.75; color: #374151; }
          .contract-body h1 { font-size: 20px; font-weight: 800; color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-top: 32px; margin-bottom: 16px; }
          .contract-body h2 { font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #111827; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-top: 36px; margin-bottom: 14px; }
          .contract-body h3 { font-size: 14px; font-weight: 700; color: #374151; margin-top: 24px; margin-bottom: 10px; }
          .contract-body p { font-size: 13px; margin-bottom: 14px; color: #374151; }
          .contract-body ul, .contract-body ol { padding-left: 22px; margin-bottom: 14px; }
          .contract-body li { font-size: 13px; line-height: 1.7; color: #374151; margin-bottom: 6px; }
          .contract-body strong { font-weight: 700; color: #111827; }
          .contract-body em { font-style: italic; }
          .contract-body .cover { min-height: 70vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 60px 48px; border-bottom: 3px solid #111827; margin-bottom: 40px; }
          .contract-body .section { margin-top: 32px; }
          .contract-body .section h2 { border-bottom: 2px solid #eee; padding-bottom: 5px; }
          .contract-body .signature { margin-top: 60px; }
          .contract-body .signature div { margin-top: 40px; }

          /* ── Plain text fallback ── */
          .contract-plain { font-family: monospace; font-size: 13px; white-space: pre-wrap; line-height: 1.7; color: #374151; background: #f9fafb; padding: 24px; border-radius: 8px; border: 1px solid #e5e7eb; }

          /* ── Admin notes (screen only) ── */
          .admin-notes { margin-top: 32px; padding: 16px 20px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; }
          .admin-notes h4 { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #92400e; margin-bottom: 6px; }
          .admin-notes p { font-size: 13px; color: #78350f; }
          @media print { .admin-notes { display: none !important; } }

          /* ── Signature block ── */
          .signature-block {
            margin-top: 64px;
            padding-top: 40px;
            border-top: 2px solid #111827;
          }
          .signature-block h3 { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af; margin-bottom: 32px; }
          .sig-row { display: flex; gap: 48px; margin-bottom: 36px; flex-wrap: wrap; }
          .sig-item { flex: 1; min-width: 160px; }
          .sig-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; margin-bottom: 8px; }
          .sig-value { font-size: 17px; font-weight: 700; color: #111827; font-style: italic; border-bottom: 1px solid #d1d5db; padding-bottom: 6px; min-width: 180px; }
          .sig-blank { font-size: 14px; color: #d1d5db; border-bottom: 1px solid #d1d5db; padding-bottom: 6px; min-width: 180px; }
          .sig-note { font-size: 11px; color: #9ca3af; font-family: monospace; margin-top: 16px; }

          /* ── Footer ── */
          .doc-footer {
            margin-top: 56px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 11px;
            color: #9ca3af;
          }

          /* ── Print button ── */
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
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          }
          .print-btn:hover { background: #374151; }

          @page { size: A4; margin: 20mm; }
          @media print {
            .print-btn { display: none !important; }
            body { padding: 0; }
            .page { padding: 0; }
          }
        `}</style>
      </head>
      <body>
        <PrintButton className="print-btn" />

        <div className="page">
          {/* Cover page */}
          <div className="cover-page">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo_transparent.png"
              alt="LeoTheTechGuy"
              className="cover-logo"
            />
            <p className="cover-company">LeoTheTechGuy</p>
            <p className="cover-email">contact@leothetechguy.com</p>

            <p className="cover-doc-type">{contract.type || 'Contract'}</p>
            <p className="cover-title">{contract.title}</p>

            <p className="cover-for">Prepared for</p>
            <p className="cover-client">{client?.fullName || 'Client'}</p>
            {client?.email && <p className="cover-client-email">{client.email}</p>}

            <p className="cover-date">{contractDate}</p>
            <p className="cover-number">{contract.contractNumber}</p>
          </div>

          <div className="page-break" />

          {/* Document header */}
          <div className="doc-header">
            <p className="doc-header-brand">LeoTheTechGuy</p>
            <div className="doc-header-title">
              <p style={{ fontWeight: 700 }}>{contract.title}</p>
              <p>{contract.contractNumber}</p>
            </div>
          </div>

          {/* Contract body */}
          {contract.content ? (
            isHtml ? (
              <div
                className="contract-body"
                dangerouslySetInnerHTML={{ __html: contract.content }}
              />
            ) : (
              <div className="contract-plain">{contract.content}</div>
            )
          ) : (
            <p style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: 13 }}>No contract content.</p>
          )}

          {/* Admin-only internal notes (hidden on print) */}
          {contract.notes && (
            <div className="admin-notes">
              <h4>Internal Notes (Admin Only — Hidden on Print)</h4>
              <p>{contract.notes}</p>
            </div>
          )}

          {/* Signature block */}
          <div className="signature-block">
            <h3>Electronic Signatures</h3>
            <div className="sig-row">
              <div className="sig-item">
                <p className="sig-label">Client Name</p>
                {contract.signerName ? (
                  <p className="sig-value">{contract.signerName}</p>
                ) : (
                  <p className="sig-blank">&nbsp;</p>
                )}
              </div>
              <div className="sig-item">
                <p className="sig-label">Date Signed</p>
                {contract.signedAt ? (
                  <p className="sig-value">
                    {new Date(contract.signedAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </p>
                ) : (
                  <p className="sig-blank">&nbsp;</p>
                )}
              </div>
              {contract.signatureDataUrl && (
                <div className="sig-item">
                  <p className="sig-label">Drawn Signature</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={contract.signatureDataUrl}
                    alt="Client drawn signature"
                    style={{ maxHeight: 80, maxWidth: 240, border: '1px solid #d1d5db', borderRadius: 4, background: '#fff' }}
                  />
                </div>
              )}
            </div>
            <div className="sig-row">
              <div className="sig-item">
                <p className="sig-label">Company Representative</p>
                <p className="sig-value">LeoTheTechGuy</p>
              </div>
              <div className="sig-item">
                <p className="sig-label">Date</p>
                <p className="sig-value">{contractDate}</p>
              </div>
            </div>
            {contract.signerIp && (
              <p className="sig-note">IP Address on record: {contract.signerIp}</p>
            )}
          </div>

          {/* Footer */}
          <div className="doc-footer">
            <span>LeoTheTechGuy · contact@leothetechguy.com · leothetechguy.com</span>
            <span>Generated {generatedDate}</span>
          </div>
        </div>
      </body>
    </html>
  );
}
