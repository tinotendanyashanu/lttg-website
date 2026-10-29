import { z } from "zod";

const optionalText = (length: number) =>
  z.string().trim().max(length).optional().default("");
const safeWebsite = z
  .string()
  .trim()
  .max(500)
  .refine((value) => {
    if (!value) return true;
    try {
      return ["http:", "https:"].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  }, "Use a full website address beginning with https://.")
  .optional()
  .default("");

export const inquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Please provide your name.")
    .max(60, "Please keep your name under 60 characters."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254)
    .email("Please provide a valid email address."),
  project: optionalText(200).transform(
    (value) => value || "Business software discovery",
  ),
  message: z
    .string()
    .trim()
    .min(10, "Please describe your project in at least 10 characters.")
    .max(5000, "Please keep your brief under 5,000 characters."),
  company: optionalText(120),
  companyWebsite: safeWebsite,
  timeline: optionalText(100),
  budget: optionalText(100),
  consent: z.literal(true, {
    error:
      "Please agree to the use of your details to respond to this inquiry.",
  }),
  faxNumber: optionalText(200),
  source: optionalText(100),
  landingPath: z
    .string()
    .max(500)
    .refine(
      (value) =>
        !value ||
        (value.startsWith("/") &&
          !value.startsWith("//") &&
          !value.includes("?")),
      "Invalid landing path.",
    )
    .optional()
    .default(""),
  utmSource: optionalText(100),
  utmMedium: optionalText(100),
  utmCampaign: optionalText(100),
  referrer: safeWebsite,
});

export function escapeInquiryHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ]!,
  );
}
