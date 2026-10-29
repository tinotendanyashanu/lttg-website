import assert from "node:assert/strict";
import test from "node:test";
import { inquirySchema, escapeInquiryHtml } from "../lib/inquiry-validation";

const valid = {
  name: "  Jane Doe  ",
  email: " Jane+ops@company.technology ",
  message: "Our fleet team reconciles settlement files by hand.",
  consent: true,
};
test("accepts a brief with optional business details omitted and normalizes email", () => {
  const result = inquirySchema.parse(valid);
  assert.equal(result.email, "jane+ops@company.technology");
  assert.equal(result.name, "Jane Doe");
  assert.equal(result.project, "Business software discovery");
});
test("requires explicit consent, a valid email and a useful brief", () => {
  for (const change of [
    { consent: false },
    { consent: undefined },
    { email: "not-an-email" },
    { message: "   " },
    { name: "" },
    { message: "x".repeat(5001) },
  ])
    assert.equal(
      inquirySchema.safeParse({ ...valid, ...change }).success,
      false,
    );
});
test("accepts HTTPS company sites and rejects script and malformed URLs", () => {
  assert.equal(
    inquirySchema.safeParse({
      ...valid,
      companyWebsite: "https://example.com/about",
    }).success,
    true,
  );
  for (const companyWebsite of [
    "javascript:alert(1)",
    "data:text/html,test",
    "ftp://example.com",
    "not a URL",
  ])
    assert.equal(
      inquirySchema.safeParse({ ...valid, companyWebsite }).success,
      false,
    );
});
test("rejects external landing paths and query strings containing private data", () => {
  for (const landingPath of [
    "https://example.com",
    "//example.com",
    "/contact?email=private@example.com",
  ])
    assert.equal(
      inquirySchema.safeParse({ ...valid, landingPath }).success,
      false,
    );
  assert.equal(
    inquirySchema.safeParse({
      ...valid,
      landingPath: "/services/fleet-management-software",
    }).success,
    true,
  );
});
test("strips untrusted status fields so visitors cannot set lead state", () => {
  assert.equal(
    "status" in inquirySchema.parse({ ...valid, status: "won" }),
    false,
  );
});
test("escapes user content before HTML email rendering", () => {
  assert.equal(
    escapeInquiryHtml('<img src="x" onerror="alert(1)"> & \'test\''),
    "&lt;img src=&quot;x&quot; onerror=&quot;alert(1)&quot;&gt; &amp; &#39;test&#39;",
  );
});
