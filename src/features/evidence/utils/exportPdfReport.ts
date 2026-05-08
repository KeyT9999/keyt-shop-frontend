import type { EvidenceItem, VerdictResult } from '../types';

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatPercent(value: unknown): string {
  return Number.isFinite(value) ? `${Math.round(Number(value) * 100)}%` : 'N/A';
}

function buildEvidenceRows(evidence: EvidenceItem[]): string {
  return evidence
    .map((item, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${escapeHtml(item.title || 'Nguồn không xác định')}</td>
        <td><a href="${escapeHtml(item.url)}">${escapeHtml(item.url || 'N/A')}</a></td>
        <td>${escapeHtml(item.verification)}</td>
        <td>${formatPercent(item.confidence)}</td>
        <td>${escapeHtml(item.snippet || '')}</td>
      </tr>
    `)
    .join('');
}

function buildPrintHtml(query: string, evidence: EvidenceItem[], verdict: VerdictResult | null): string {
  const generatedAt = new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'full',
    timeStyle: 'medium',
  }).format(new Date());

  return `
    <style>
      @media print {
        body * { visibility: hidden; }
        #ec-print-area, #ec-print-area * { visibility: visible; }
        #ec-print-area { position: absolute; inset: 0; padding: 2cm; }
      }
      #ec-print-area { position: fixed; left: -10000px; top: 0; font-family: Georgia, "Times New Roman", serif; color: #111827; }
      #ec-print-area h1 { font-size: 26px; margin: 0 0 8px; }
      #ec-print-area h2 { font-size: 18px; margin: 24px 0 8px; }
      #ec-print-area table { width: 100%; border-collapse: collapse; font-size: 11px; }
      #ec-print-area th, #ec-print-area td { border: 1px solid #1f2937; padding: 8px; vertical-align: top; }
      #ec-print-area th { background: #f3f4f6; text-align: left; }
      #ec-print-area .footer { margin-top: 24px; font-size: 11px; color: #4b5563; }
    </style>
    <h1>KeyT Evidence Checker Report</h1>
    <div>Generated: ${escapeHtml(generatedAt)}</div>
    <h2>Query</h2>
    <p><strong>${escapeHtml(query)}</strong></p>
    <h2>Verdict</h2>
    <p><strong>${escapeHtml(verdict?.verdict || 'N/A')}</strong> - Confidence: ${escapeHtml(verdict?.confidence ?? 'N/A')}%</p>
    ${verdict?.summary ? `<p>${escapeHtml(verdict.summary)}</p>` : ''}
    <h2>Evidence Table</h2>
    <table>
      <thead>
        <tr><th>STT</th><th>Tiêu đề</th><th>URL</th><th>Verification</th><th>Confidence%</th><th>Snippet</th></tr>
      </thead>
      <tbody>${buildEvidenceRows(evidence)}</tbody>
    </table>
    <div class="footer">
      Disclaimer: Báo cáo này hỗ trợ kiểm chứng thông tin và không thay thế đánh giá chuyên môn độc lập.
    </div>
  `;
}

export function exportToPdf(query: string, evidence: EvidenceItem[], verdict: VerdictResult | null): void {
  const existing = document.getElementById('ec-print-area');
  if (existing) existing.remove();

  const printArea = document.createElement('div');
  printArea.id = 'ec-print-area';
  printArea.innerHTML = buildPrintHtml(query, evidence, verdict);
  document.body.appendChild(printArea);

  window.print();
  window.setTimeout(() => printArea.remove(), 300);
}
