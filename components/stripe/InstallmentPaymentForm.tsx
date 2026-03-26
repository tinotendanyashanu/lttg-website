'use client';

interface InstallmentPaymentFormProps {
  amountToCharge: number;
  maxAmount: number;
  currency: string;
}

export default function InstallmentPaymentForm({
  amountToCharge,
  maxAmount,
  currency,
}: InstallmentPaymentFormProps) {
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(n);

  const handleApply = () => {
    const input = document.getElementById('customAmount') as HTMLInputElement;
    if (input?.value) {
      const amount = parseFloat(input.value);
      if (amount > 0 && amount <= maxAmount) {
        window.location.href = `?amount=${amount}`;
      }
    }
  };

  return (
    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-4 space-y-3">
      <div className="flex items-start gap-2">
        <span className="material-icons-outlined text-blue-600 dark:text-blue-400 text-[20px] mt-0.5">
          info
        </span>
        <div>
          <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">Pay in Installments</p>
          <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">
            You can make a partial payment now and pay the rest later.
          </p>
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">
          How much would you like to pay?
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            min="0.01"
            max={maxAmount}
            step="0.01"
            defaultValue={amountToCharge.toFixed(2)}
            id="customAmount"
            placeholder="Custom amount"
            className="flex-1 rounded-lg border border-blue-200 dark:border-blue-800 bg-white dark:bg-[#1c1c1f] text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Apply
          </button>
        </div>
        <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
          Min: {fmt(0.01)} · Max: {fmt(maxAmount)}
        </p>
      </div>
    </div>
  );
}
