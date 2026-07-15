// Single source of truth for site origins and cross-site URLs.
// The main WordPress site is canonical on the apex domain (www 301s to it).
export const SITE_URL = "https://navigator.olimpaveway.com";
export const MAIN_SITE_URL = "https://olimpaveway.com";
export const MAIN_SITE_DISPLAY = "olimpaveway.com";

export const CONSULTATION_URL = `${MAIN_SITE_URL}/personal-guide/`;
export const PRIVACY_POLICY_URL = `${MAIN_SITE_URL}/privacy-policy/`;
export const ALIYAH_GUIDE_URL = `${MAIN_SITE_URL}/complete-guide-to-making-aliyah/`;

// Internal team address that gets a summary every time a lead registers
export const INTERNAL_LEAD_NOTIFICATION_EMAIL = "sslivko@olimpaveway.com";

// How long after the plan email is sent before the user gets the
// "we're here to help" follow-up (see /api/cron/send-follow-ups)
export const FOLLOW_UP_DELAY_DAYS = 3;
