import { CreateContactRequestDto } from '../dto/create-contact-request.dto';
import { ContactProductLabels, ContactRequestTypeLabels } from '../contact.constants';

const NOT_PROVIDED = 'Not provided';

const escapeHtml = (value: string) =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

// Strips line breaks so visitor input can never add extra email headers.
const singleLine = (value: string) => value.replace(/[\r\n]+/g, ' ').trim();

interface ContactEmailField {
    label: string;
    value: string;
}

function buildFields(dto: CreateContactRequestDto): ContactEmailField[] {
    return [
        { label: 'Request', value: ContactRequestTypeLabels[dto.request_type] },
        { label: 'Name', value: singleLine(dto.name) },
        { label: 'Email', value: singleLine(dto.email) },
        { label: 'Phone', value: dto.phone?.trim() ? singleLine(dto.phone) : NOT_PROVIDED },
        { label: 'Interested in', value: dto.products.map((product) => ContactProductLabels[product]).join(', ') },
    ];
}

export function buildContactEmailSubject(dto: CreateContactRequestDto): string {
    return `${ContactRequestTypeLabels[dto.request_type]}: ${singleLine(dto.name)}`;
}

export function buildContactEmailText(dto: CreateContactRequestDto): string {
    const fields = buildFields(dto).map(({ label, value }) => `${label}: ${value}`);
    const message = dto.message?.trim();
    return [...fields, '', 'Message:', message || NOT_PROVIDED].join('\n');
}

export function buildContactEmailHtml(dto: CreateContactRequestDto): string {
    const rows = buildFields(dto)
        .map(
            ({ label, value }) =>
                `<tr><td style="padding:6px 16px 6px 0;color:#6b6b6b;vertical-align:top;white-space:nowrap">${escapeHtml(label)}</td><td style="padding:6px 0;color:#111">${escapeHtml(value)}</td></tr>`,
        )
        .join('');
    const message = dto.message?.trim();

    return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#111">
<h2 style="margin:0 0 16px;font-size:18px">New website inquiry</h2>
<table style="border-collapse:collapse">${rows}</table>
<h3 style="margin:24px 0 8px;font-size:15px">Message</h3>
<p style="margin:0;white-space:pre-wrap">${escapeHtml(message || NOT_PROVIDED)}</p>
</div>`;
}
