export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Terms of Service</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Last Updated: March 22, 2026</p>

        <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing and using UniEvents, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. Student Project Disclaimer</h2>
            <p><strong>UniEvents is an independent student project developed by computer science students at Galatasaray University.</strong> It is not affiliated with, endorsed by, or officially connected to the Galatasaray University administration. The service is provided &quot;as is&quot; without any guarantees or warranty. We are not responsible for data loss, service interruptions, or the accuracy of event information posted by clubs.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. Eligibility</h2>
            <p>You must be at least 18 years old and a current university student or club representative to create an account. By registering, you represent that you meet these requirements.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">4. Account Security</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. We are not liable for any loss arising from unauthorized access to your account.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">5. User Conduct</h2>
            <p>You agree not to use the platform to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Post content that is unlawful, harmful, threatening, or abusive.</li>
              <li>Impersonate any person, club, or entity.</li>
              <li>Upload viruses or malicious code.</li>
              <li>Spam or solicit other users commercially.</li>
              <li>Post misleading or false event information.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">6. Content Ownership</h2>
            <p>Clubs retain all rights to the images and text they upload. By uploading content, you grant UniEvents a non-exclusive license to display and distribute this content on the platform for as long as the content remains on the service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">7. Limitation of Liability</h2>
            <p>To the fullest extent permitted by applicable law, UniEvents and its developers shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of data, use, or profits, arising out of or in connection with your use of the service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">8. Termination</h2>
            <p>We reserve the right to terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">9. Governing Law</h2>
            <p>These Terms shall be governed and construed in accordance with the laws of the Republic of Turkey, without regard to its conflict of law provisions. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of Istanbul, Turkey.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">10. Changes to These Terms</h2>
            <p>We may update these Terms from time to time. We will notify you of any changes by updating the &quot;Last Updated&quot; date at the top of this page. Continued use of the service after changes constitutes acceptance of the updated Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">11. Contact</h2>
            <p>If you have any questions about these Terms, please contact us at <a href="mailto:evenementsadmin@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">evenementsadmin@gmail.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}