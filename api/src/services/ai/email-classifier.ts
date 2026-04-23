import { chatCompleteJson } from './openai.js';

export type EmailCategory = 'Trips' | 'Invoices & Receipts' | 'Learning Material' | 'Rabbinate' | 'Other';
export type TripSubcategory = 'Flights' | 'Hotels' | 'Car Rentals' | 'Travel Insurance' | 'Other';

export interface EmailClassification {
  category: EmailCategory;
  subcategory?: TripSubcategory;
}

const CATEGORY_SYSTEM_PROMPT = `You are an email categorization assistant. Categorize the email into exactly one of:

- "Trips": Emails related to actual travel plans with confirmed or scheduled trips. Covers flight bookings, hotel reservations, car rentals, travel insurance, and any receipts, confirmations, or itineraries tied to a specific trip. Includes travel documents like boarding passes, visas, or permits. EXCLUDES marketing, promotional, newsletters, or general travel inspiration emails.
- "Invoices & Receipts": Billing statements, receipts, or invoices NOT related to travel. Includes product purchases, service payments, utility bills, subscriptions, consulting fees. Excludes receipts for flights, hotels, car rentals, travel insurance, or any travel-related services.
- "Learning Material": Educational content — lecture notes, Torah portions, study guides, academic research, online course materials, learning resources.
- "Rabbinate": Emails from the rabbinate regarding religious duties, events, or responsibilities. Correspondence with clergy, congregational communication, event invitations, emails related to religious roles.
- "Other": Anything that does not clearly fit the above categories.

Return JSON: {"category": "<category>"}`;

const TRIP_SUBCATEGORY_SYSTEM_PROMPT = `You are a travel email classifier. Categorize a travel email into exactly one subcategory:

- "Flights": Flight bookings, cancellations, updates, or confirmations.
- "Hotels": Hotel, Airbnb, or accommodation bookings, confirmations, cancellations.
- "Car Rentals": Car rental bookings, pickup/drop-off details, or car rental confirmations.
- "Travel Insurance": Travel insurance bookings, policies, updates, and claims.
- "Other": Travel-related but not flights, hotels, cars, or insurance (e.g., tour bookings, visa confirmations).

Return JSON: {"subcategory": "<subcategory>"}`;

export async function classifyEmail(
  from: string,
  subject: string,
  body: string,
  attachmentTexts: string[] = [],
): Promise<EmailClassification> {
  const attachments = attachmentTexts
    .map((t, i) => `Attachment ${i}:\n${t.substring(0, 3000)}`)
    .join('\n\n');

  const userContent = `From: ${from}\nSubject: ${subject}\nContent:\n${body}${attachments ? `\n\nAttachment Data:\n${attachments}` : ''}`;

  const result = await chatCompleteJson<{ category: EmailCategory }>(
    'gpt-4o-mini',
    CATEGORY_SYSTEM_PROMPT,
    userContent,
  );

  if (result.category !== 'Trips') {
    return { category: result.category };
  }

  const subResult = await chatCompleteJson<{ subcategory: TripSubcategory }>(
    'gpt-4o-mini',
    TRIP_SUBCATEGORY_SYSTEM_PROMPT,
    userContent,
  );

  return { category: 'Trips', subcategory: subResult.subcategory };
}
