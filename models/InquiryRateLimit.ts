import mongoose, { Schema } from "mongoose";

// Shared across server instances. Buckets expire automatically, and raw IPs
// are never stored. A fixed window bounds submission bursts without a vendor.
const InquiryRateLimitSchema = new Schema({
  _id: { type: String, required: true },
  count: { type: Number, required: true, default: 0 },
  expiresAt: { type: Date, required: true, expires: 0 },
});
const InquiryRateLimit =
  mongoose.models.InquiryRateLimit ||
  mongoose.model("InquiryRateLimit", InquiryRateLimitSchema);
export default InquiryRateLimit;

let expiryIndex: Promise<unknown> | undefined;
export async function ensureInquiryExpiryIndex() {
  // Production can disable Mongoose autoIndex. Create the TTL index once per
  // process, and retry after transient failures rather than retaining a rejection.
  expiryIndex ??= InquiryRateLimit.collection
    .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
    .catch((error) => {
      expiryIndex = undefined;
      throw error;
    });
  await expiryIndex;
}
