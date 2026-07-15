import { environment } from '../../../environments/environment';

export function buildSafetyReportMailto(subject: string, body: string): string {
  const params = new URLSearchParams({
    subject,
    body,
  });

  return `mailto:${environment.safetySupportEmail}?${params.toString()}`;
}
