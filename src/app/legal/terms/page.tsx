"use client";
import {useUI} from "@/i18n/useUI";
export default function TermsPage() {
  const {t} = useUI();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 p-6 sm:p-8 [overflow-wrap:anywhere] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t("Terms of Service")}</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">{t("Last Updated: March 22, 2026")}</p>

        <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t("1. Acceptance of Terms")}</h2>
            <p>{t("By accessing and using Evenements, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.")}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t("2. Student Project Disclaimer")}</h2>
            <p><strong>{t("Evenements is an independent student project developed by computer science students at Galatasaray University.")}</strong>  {t("It is not affiliated with, endorsed by, or officially connected to the Galatasaray University administration. The service is provided \"as is\" without any guarantees or warranty. We are not responsible for data loss, service interruptions, or the accuracy of event information posted by clubs.")}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t("3. Eligibility")}</h2>
            <p>{t("You must be at least 18 years old and a current university student or club representative to create an account. By registering, you represent that you meet these requirements.")}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t("4. Account Security")}</h2>
            <p>{t("You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. We are not liable for any loss arising from unauthorized access to your account.")}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t("5. User Conduct")}</h2>
            <p>{t("You agree not to use the platform to:")}</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>{t("Post content that is unlawful, harmful, threatening, or abusive.")}</li>
              <li>{t("Impersonate any person, club, or entity.")}</li>
              <li>{t("Upload viruses or malicious code.")}</li>
              <li>{t("Spam or solicit other users commercially.")}</li>
              <li>{t("Post misleading or false event information.")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t("6. Content Ownership")}</h2>
            <p>{t("Clubs retain all rights to the images and text they upload. By uploading content, you grant Evenements a non-exclusive license to display and distribute this content on the platform for as long as the content remains on the service.")}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t("7. Limitation of Liability")}</h2>
            <p>{t("To the fullest extent permitted by applicable law, Evenements and its developers shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of data, use, or profits, arising out of or in connection with your use of the service.")}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t("8. Termination")}</h2>
            <p>{t("We reserve the right to terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms.")}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t("9. Governing Law")}</h2>
            <p>{t("These Terms shall be governed and construed in accordance with the laws of the Republic of Turkey, without regard to its conflict of law provisions. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of Istanbul, Turkey.")}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t("10. Changes to These Terms")}</h2>
            <p>{t("We may update these Terms from time to time. We will notify you of any changes by updating the \"Last Updated\" date at the top of this page. Continued use of the service after changes constitutes acceptance of the updated Terms.")}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t("11. Contact")}</h2>
            <p>{t("If you have any questions about these Terms, please contact us at")} <a href="mailto:evenementsadmin@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">evenementsadmin@gmail.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
