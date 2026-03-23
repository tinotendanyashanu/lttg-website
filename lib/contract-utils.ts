import { randomUUID } from 'crypto';

export type TemplateVars = {
  client_name?: string;
  business_name?: string;
  service_name?: string;
  service_description?: string;
  amount?: string;
  currency?: string;
  start_date?: string;
  end_date?: string;
  date?: string;
  company_name?: string;
};

/**
 * Replace {{variable}} placeholders in an HTML template string.
 * Unmatched placeholders are left as-is so the admin can notice missing data.
 */
export function interpolateTemplate(html: string, vars: TemplateVars): string {
  return html.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = vars[key as keyof TemplateVars];
    return value !== undefined && value !== '' ? value : match;
  });
}

/**
 * Detect whether stored contract content is HTML or plain text.
 * Used as a backwards-compat fallback for contracts that predate the isHtml field.
 */
export function isHtmlContent(content: string): boolean {
  return content.trim().startsWith('<');
}

/**
 * Generate a unique signing token and a 72-hour expiry timestamp.
 */
export function generateSigningToken(): { token: string; expiresAt: Date } {
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
  return { token, expiresAt };
}

/**
 * Extract all unique {{variable}} names from an HTML template string.
 * Returns variable names in order of first occurrence, deduplicated.
 */
export function extractTemplateVariables(html: string): string[] {
  const matches = html.match(/\{\{(\w+)\}\}/g) || [];
  return [...new Set(matches.map((m) => m.slice(2, -2)))];
}
