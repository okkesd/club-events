"use client";
import {useUI} from "@/i18n/useUI";
export default function PrivacyPage() {
  const {t} = useUI();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 p-6 sm:p-8 [overflow-wrap:anywhere] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t("Privacy Policy")}</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">{t("Last Updated: September 7, 2026")}</p>

        <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t("1. Who We Are")}</h2>
            <p>{t("Evenements is an independent student project developed by computer science students at Galatasaray University. It is not affiliated with or endorsed by the university administration. For any questions about your data, you can reach us at")} <a href="mailto:evenementsadmin@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">evenementsadmin@gmail.com</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t("2. Information We Collect")}</h2>
            <p>{t("We collect the following information:")}</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>{t("Account Data:")}</strong>  {t("Club name, email address, and password (stored encrypted) when you register a club account.")}</li>
              <li><strong>{t("Event Data:")}</strong>  {t("Event titles, descriptions, dates, locations, and cover images uploaded by clubs.")}</li>
              <li><strong>{t("Contact Messages:")}</strong>  {t("Email address and message content submitted through our contact form.")}</li>
              <li><strong>{t("Visitor ID (likes & views):")}</strong>  {t("When you visit or like an event, a persistent identifier (a randomly generated UUID stored in a cookie called")} <strong>visitor_id</strong>{t(") is recorded alongside the action to prevent duplicate counting. This identifier distinguishes repeat visitors for counting purposes and should not be understood as fully anonymous data.")}</li>
              <li><strong>{t("Subscription Data:")}</strong>  {t("If you subscribe to email notifications, your email address and optional preferences (club, category) are stored.")}</li>
              <li><strong>{t("Local Storage Data:")}</strong>  {t("We store your authentication token and theme preference (light/dark/vibrant mode) in your browser's local storage. This data never leaves your device except for the authentication token, which is sent with requests to verify your identity.")}</li>
            </ul>
            <p className="mt-2">{t("We do not use analytics or tracking tools. We do not collect data from users who browse events without registering a club account, other than what is stored locally on your device and the visitor ID used for like and view deduplication.")}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t("3. Legal Basis for Processing")}</h2>
            <p>{t("Under the Turkish Personal Data Protection Law (KVKK, Law No. 6698), we process your personal data on the following legal bases:")}</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>{t("Explicit consent:")}</strong>  {t("You agree to the Terms of Service and this Privacy Policy when you create an account.")}</li>
              <li><strong>{t("Contractual necessity:")}</strong>  {t("Processing your account and event data is necessary to provide the service you signed up for.")}</li>
              <li><strong>{t("Legitimate interest:")}</strong>  {t("Processing contact messages to respond to inquiries and improve the service.")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t("4. How We Use Your Data")}</h2>
            <p>{t("We use your data solely to:")}</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>{t("Provide and maintain the service (authentication, event management).")}</li>
              <li>{t("Allow clubs to create, edit, and manage their events.")}</li>
              <li>{t("Display events to users of the platform.")}</li>
              <li>{t("Respond to contact messages.")}</li>
              <li>{t("Prevent duplicate event likes and view counts using visitor ID deduplication.")}</li>
              <li>{t("Send email notifications to subscribers about new announcements and events.")}</li>
            </ul>
            <p className="mt-2">{t("We do not sell, share, or transfer your personal data to any third parties for marketing or advertising purposes.")}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t("5. Data Storage & Security")}</h2>
            <p>{t("Your data is stored on servers hosted on Amazon Web Services (AWS) EC2. Passwords are stored using industry-standard encryption. While we take reasonable measures to protect your data, no method of transmission over the Internet is 100% secure.")}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t("6. Cross-Border Data Transfers")}</h2>
            <p>{t("Our servers are hosted by Amazon Web Services (AWS), which may store data in data centers located outside of Turkey. By using Evenements, you consent to the transfer of your data to AWS infrastructure in accordance with KVKK Article 9. AWS provides industry-standard security measures and complies with international data protection frameworks.")}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t("7. Data Retention")}</h2>
            <p>{t("We retain your account data for as long as your account is active. Event data is retained for as long as the event exists on the platform. Contact messages are retained indefinitely to help us improve the service. Visitor IDs stored for event likes and views are retained for as long as the associated event exists and are deleted when the event is removed. Subscription data is retained until you unsubscribe. If you request account deletion, we will delete your account data and associated events within 30 days of your request.")}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t("8. Your Rights (KVKK)")}</h2>
            <p>{t("Under the Turkish Personal Data Protection Law (KVKK, Law No. 6698), you have the right to:")}</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>{t("Learn whether your personal data is being processed.")}</li>
              <li>{t("Request information about the processing of your personal data.")}</li>
              <li>{t("Learn the purpose of processing and whether your data is used accordingly.")}</li>
              <li>{t("Know the third parties to whom your data has been transferred.")}</li>
              <li>{t("Request correction of incomplete or inaccurate data.")}</li>
              <li>{t("Request deletion or destruction of your personal data.")}</li>
              <li>{t("Object to any result that is against your interests arising from the analysis of your data exclusively through automated systems.")}</li>
              <li>{t("Claim compensation for damages arising from unlawful processing of your data.")}</li>
            </ul>
            <p className="mt-2">{t("To exercise any of these rights, please contact us at")} <a href="mailto:evenementsadmin@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">evenementsadmin@gmail.com</a>{t(". We will respond to your request within 30 days.")}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t("9. Minimum Age")}</h2>
            <p>{t("Evenements is designed for university students and club representatives. You must be at least 18 years old to create an account. We do not knowingly collect personal data from individuals under 18.")}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t("10. Changes to This Policy")}</h2>
            <p>{t("We may update this Privacy Policy from time to time. We will notify you of any changes by updating the \"Last Updated\" date at the top of this page.")}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
