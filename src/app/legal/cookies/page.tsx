"use client";
import {useUI} from "@/i18n/useUI";
export default function CookiesPage() {
  const {t} = useUI();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 p-6 sm:p-8 [overflow-wrap:anywhere] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t("Cookie & Local Storage Policy")}</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">{t("Last Updated: September 7, 2026")}</p>

        <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t("What We Store in Your Browser")}</h2>
            <p>{t("Evenements uses your browser's")} <strong>{t("local storage")}</strong>  {t("and a")} <strong>{t("visitor identifier cookie")}</strong>  {t("for the purposes described below. Local storage data stays on your device and is not automatically sent to our servers with every request. Closing the notice only hides it; it does not grant consent or change which storage is used.")}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t("What We Store & Why")}</h2>
            <ul className="list-disc pl-5 mt-2 space-y-3">
              <li><strong>{t("Authentication token")}</strong>  {t("— Keeps you logged in. This token is sent to our servers with requests that require authentication (e.g., creating or editing events). Without this, you would need to log in on every page visit.")}</li>
              <li><strong>{t("Theme preference")}</strong>  {t("— Remembers whether you chose light, dark, or vibrant mode. This data never leaves your device.")}</li>
              <li><strong>{t("Privacy banner preference")}</strong> (<code>cookie_notice_dismissed_v1</code>{t(") — Remembers that you closed this notice. It is not a record of consent. Older versions used a key named")} <code>cookie_consent</code>{t("; that value is not treated as consent either.")}</li>
            <li><strong>{t("Remembered email")}</strong> (<code>notify_email</code>{t(") — Saved when you select the remember option in the event notification form. You can remove it by submitting the form with that option unchecked or clearing browser storage.")}</li>
            </ul>
            <p className="mt-2">{t("Local storage has no automatic expiry in this app. The authentication token is removed on sign-out; other preferences remain until removed or browser storage is cleared.")}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t("Visitor Identifier Cookie")}</h2>
            <p>{t("We use the following HTTP cookies on your device:")}</p>
            <ul className="list-disc pl-5 mt-2 space-y-3">
              <li><strong>visitor_id</strong>  {t("— A randomly generated identifier (UUID), set automatically on page visits and sent to this site with requests. It is used for repeat-like and view-count checks. It expires after one year or when you clear your browser cookies. A persistent identifier can distinguish repeat visits; it should not be understood as fully anonymous data.")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t("Language preference")}</h2>
            <p>{t("We also store your selected interface language in the app_locale cookie for one year. It is sent to this site to display pages in your chosen language. You can change it at any time using the language selector.")}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t("Third-Party Cookies")}</h2>
            <p>{t("The application does not embed third-party advertising or analytics scripts. External links may take you to services with their own privacy and cookie policies.")}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t("Your Choices")}</h2>
            <p>{t("You can block cookies or clear cookies and local storage through your browser settings. Blocking the visitor cookie may affect repeat-like and view-count checks. Clearing it does not delete records already held on the server. Clearing this data will log you out and reset your theme preference. You can also use your browser's developer tools to inspect exactly what Evenements stores.")}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t("Server-Side Data for Likes & Views")}</h2>
            <p>{t("When you like an event or view an event page, your visitor ID (from the")} <strong>visitor_id</strong>  {t("cookie) is stored on our servers to prevent duplicate counting. The identifier is sent to the event service for these checks. For questions about server-side records or deletion, contact")} <a href="mailto:evenementsadmin@gmail.com" className="text-blue-600 dark:text-blue-400 underline">evenementsadmin@gmail.com</a>{t(". See our")} <a href="/legal/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">{t("Privacy Policy")}</a>  {t("for more details.")}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
