/**
 * Veltra WhatsApp Configuration
 * Real WhatsApp Business number for sales, support, and patient communication.
 */

export const WHATSAPP_NUMBER = "+8619859039183";
export const WHATSAPP_NUMBER_CLEAN = "8619859039183"; // without + for wa.me links

/**
 * Build a WhatsApp deep link with pre-filled message.
 * Opens WhatsApp app (mobile) or WhatsApp Web (desktop).
 */
export function buildWhatsAppLink(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER_CLEAN}`;
  if (message) {
    return `${base}?text=${encodeURIComponent(message)}`;
  }
  return base;
}

/**
 * Pre-built WhatsApp links for common scenarios.
 */
export const WHATSAPP_LINKS = {
  // Sales — for clinic owners / doctors interested in Veltra
  sales: buildWhatsAppLink(
    "Hi Veltra team 👋\n\nI'd like to learn more about Veltra for my clinic. Can you walk me through the demo?\n\nClinic name: \nSpecialty: \nLocation: "
  ),
  
  // Support — for existing customers
  support: buildWhatsAppLink(
    "Hi Veltra support 👋\n\nI need help with:\n\n"
  ),
  
  // Demo request — from landing page
  demo: buildWhatsAppLink(
    "Hi Veltra 👋\n\nI just saw your website and I'm interested in a live demo. When are you available?\n\nMy clinic: \nMy role: "
  ),
  
  // Direct — no pre-filled message
  direct: buildWhatsAppLink(),
  
  // Patient outreach — for the demo (simulated patient messages)
  patient: (patientName: string, message: string) =>
    buildWhatsAppLink(`Hi ${patientName}, this is Veltra Clinic. ${message}`),
};

/**
 * Open WhatsApp in a new tab.
 */
export function openWhatsApp(link: string = WHATSAPP_LINKS.sales) {
  if (typeof window !== "undefined") {
    window.open(link, "_blank", "noopener,noreferrer");
  }
}
