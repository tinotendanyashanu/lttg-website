'use client';

type PrintButtonProps = {
  className?: string;
};

export default function PrintButton({ className }: PrintButtonProps) {
  return (
    <button className={className} onClick={() => window.print()} type="button">
      &#x1F5A8; Print / Save PDF
    </button>
  );
}
