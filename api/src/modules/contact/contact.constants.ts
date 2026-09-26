// Ids match the marketing site's product slugs (app/src/config/constants/products).
export const ContactRequestTypeLabels = {
    demo: 'Book a demo',
    question: 'General question',
} as const;

export const ContactProductLabels = {
    voice: 'AI voice agent',
    email: 'AI email agent',
    messaging: 'AI messaging agent',
} as const;

export type ContactRequestType = keyof typeof ContactRequestTypeLabels;
export type ContactProduct = keyof typeof ContactProductLabels;

export const ContactRequestTypeIds = Object.keys(ContactRequestTypeLabels) as ContactRequestType[];
export const ContactProductIds = Object.keys(ContactProductLabels) as ContactProduct[];
