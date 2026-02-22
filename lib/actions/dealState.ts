import Deal, { IDeal } from '@/models/Deal';

interface DealStateUpdates {
  dealStatus?: IDeal['dealStatus'];
  paymentStatus?: IDeal['paymentStatus'];
  commissionStatus?: IDeal['commissionStatus'];
  [key: string]: any;
}

export function validateDealStateTransition(currentDeal: IDeal | any, updates: DealStateUpdates): boolean {
  const nextDealStatus = updates.dealStatus || currentDeal.dealStatus;
  const nextPaymentStatus = updates.paymentStatus || currentDeal.paymentStatus;
  const nextCommissionStatus = updates.commissionStatus || currentDeal.commissionStatus;

  // The strict allowed matrix
  const isValid = (
    (nextDealStatus === 'registered' && nextPaymentStatus === 'pending' && nextCommissionStatus === 'Pending') ||
    (nextDealStatus === 'under_review' && nextPaymentStatus === 'pending' && nextCommissionStatus === 'Pending') ||
    (nextDealStatus === 'approved' && nextPaymentStatus === 'pending' && nextCommissionStatus === 'Pending') ||
    (nextDealStatus === 'rejected' && nextPaymentStatus === 'pending' && nextCommissionStatus === 'Pending') ||
    (nextDealStatus === 'closed' && nextPaymentStatus === 'pending' && nextCommissionStatus === 'Pending') ||
    (nextDealStatus === 'closed' && nextPaymentStatus === 'received' && nextCommissionStatus === 'Pending') ||
    (nextDealStatus === 'closed' && nextPaymentStatus === 'received' && nextCommissionStatus === 'Approved') ||
    (nextDealStatus === 'closed' && nextPaymentStatus === 'received' && nextCommissionStatus === 'Paid') ||
    (nextDealStatus === 'rejected' && nextPaymentStatus === 'pending' && nextCommissionStatus === 'Reversed') ||
    (nextDealStatus === 'rejected' && nextPaymentStatus === 'pending' && nextCommissionStatus === 'Refunded')
  );

  if (!isValid) {
    throw new Error(`Invalid deal state transition. Combination of dealStatus='${nextDealStatus}', paymentStatus='${nextPaymentStatus}', commissionStatus='${nextCommissionStatus}' is not allowed.`);
  }

  // Required Guard Rules specifically requested
  if (nextCommissionStatus === 'Approved' && nextPaymentStatus !== 'received') {
    throw new Error("Commission cannot be approved unless paymentStatus is 'received'");
  }
  if (nextCommissionStatus === 'Paid' && currentDeal.commissionStatus !== 'Approved' && nextCommissionStatus !== currentDeal.commissionStatus) {
    // Note: The rule says "Commission cannot be paid unless current commissionStatus === 'approved'".
    // Sometimes we set 'Paid' from 'Paid' during idempotency, but strictly transitioning to 'Paid' needs current === 'Approved'.
    throw new Error("Commission cannot be paid unless current commissionStatus is 'Approved'");
  }
  if (nextPaymentStatus === 'received' && nextDealStatus !== 'closed') {
    throw new Error("Payment cannot be 'received' unless dealStatus is 'closed'");
  }
  if (nextCommissionStatus !== 'Pending' && nextCommissionStatus !== 'Reversed' && nextCommissionStatus !== 'Refunded' && nextDealStatus !== 'closed') {
    throw new Error("Commission cannot exist (be Approved or Paid) if dealStatus is not 'closed'");
  }

  return true;
}

export async function updateDealState(dealId: string, updates: DealStateUpdates): Promise<IDeal> {
  const deal = await Deal.findById(dealId);
  if (!deal) {
    throw new Error('Deal not found');
  }

  validateDealStateTransition(deal, updates);

  // If valid, apply upates
  const updatedDeal = await Deal.findByIdAndUpdate(dealId, updates, { new: true });
  if (!updatedDeal) {
    throw new Error('Failed to update deal state');
  }

  return updatedDeal;
}
