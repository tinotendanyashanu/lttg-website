'use client';

export default function PrintButton({ className }: { className?: string }) {
  return (
    <button className={className} onClick={() => window.print()}>
      🖨️ Print / Save as PDF
    </button>
  );
}
