import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import dbConnect from "@/lib/mongodb";
import Contact from "@/models/Contact";
import InquiryRateLimit, { ensureInquiryExpiryIndex } from "@/models/InquiryRateLimit";
import Partner from "@/models/Partner";
import Lead from "@/models/Lead";
import { sendEmail, EmailTemplates, sendAdminNotification } from "@/lib/email";
import { inquirySchema, escapeInquiryHtml } from "@/lib/inquiry-validation";

export async function POST(request: Request) {
  try {
    if (Number(request.headers.get("content-length")) > 20000)
      return NextResponse.json(
        { success: false, message: "Please shorten your project brief." },
        { status: 413 },
      );
    const text = await request.text();
    if (Buffer.byteLength(text, "utf8") > 20000)
      return NextResponse.json(
        { success: false, message: "Please shorten your project brief." },
        { status: 413 },
      );
    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { success: false, message: "Please send a valid project request." },
        { status: 400 },
      );
    }
    // Return a neutral response to automated submissions, without saving or emailing.
    if (
      body &&
      typeof body === "object" &&
      "faxNumber" in body &&
      body.faxNumber
    )
      return NextResponse.json({ success: true }, { status: 201 });
    const parsed = inquirySchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0].message },
        { status: 400 },
      );
    const { faxNumber: _faxNumber, consent: _consent, ...data } = parsed.data;
    await dbConnect();
    await ensureInquiryExpiryIndex();
    const windowMs = 15 * 60 * 1000;
    const bucket = Math.floor(Date.now() / windowMs);
    const ip =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      "unknown";
    for (const key of [`ip:${ip}`, `email:${data.email}`]) {
      const hash = createHash("sha256")
        .update(`${bucket}:${key}`)
        .digest("hex");
      const limit = await InquiryRateLimit.findOneAndUpdate(
        { _id: hash },
        {
          $inc: { count: 1 },
          $setOnInsert: { expiresAt: new Date((bucket + 2) * windowMs) },
        },
        { upsert: true, new: true },
      );
      if (limit.count > 5)
        return NextResponse.json(
          {
            success: false,
            message:
              "Too many requests. Please try again in 15 minutes or email contact@leothetechguy.com.",
          },
          { status: 429, headers: { "Retry-After": "900" } },
        );
    }
    const contact = await Contact.create({
      ...data,
      status: "new",
      consentAt: new Date(),
    });
    const referralCode = (await cookies()).get("leo_partner_ref")?.value;
    if (referralCode) {
      try {
        const partner = await Partner.findOne({ referralCode });
        if (partner) {
          await Lead.create({
            partnerId: partner._id,
            clientName: data.name,
            clientEmail: data.email,
            source: "contact_form",
            status: "new",
          });
          await Partner.findByIdAndUpdate(partner._id, {
            $inc: { "stats.referralLeads": 1 },
          });
        }
      } catch {
        console.error("Contact referral processing failed");
      }
    }
    const mailResults = await Promise.allSettled([
      sendEmail({
        to: data.email,
        subject: "Your project brief has been received",
        html: EmailTemplates.projectInquiryConfirmation(
          escapeInquiryHtml(data.name),
          escapeInquiryHtml(data.project),
        ),
        replyTo: "contact@leothetechguy.com",
      }),
      sendAdminNotification({
        subject: "New business software inquiry",
        text: Object.entries(data)
          .filter(([, value]) => value)
          .map(([key, value]) => `${key}: ${escapeInquiryHtml(value)}`)
          .join("<br />"),
        replyTo: data.email,
      }),
    ]);
    if (
      mailResults.some(
        (result) =>
          result.status === "rejected" ||
          (result.status === "fulfilled" &&
            result.value &&
            "success" in result.value &&
            !result.value.success),
      )
    )
      console.error(
        "Inquiry saved; an email notification could not be delivered",
      );
    return NextResponse.json(
      { success: true, id: contact._id.toString() },
      { status: 201 },
    );
  } catch {
    console.error("Contact submission could not be saved");
    return NextResponse.json(
      {
        success: false,
        message:
          "Your request could not be saved. Please try again or email contact@leothetechguy.com.",
      },
      { status: 500 },
    );
  }
}
