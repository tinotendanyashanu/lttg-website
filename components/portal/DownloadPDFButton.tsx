'use client';

export default function DownloadPDFButton({ invoiceNumber }: { invoiceNumber: string }) {
  const handlePrint = () => {
    const prev = document.title;
    document.title = invoiceNumber;
    window.print();
    document.title = prev;
  };

  return (
    <button
      onClick={handlePrint}
      className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors print:hidden"
    >
      <span className="material-icons-outlined text-[16px]">picture_as_pdf</span>
      Download PDF
    </button>
  );
}
