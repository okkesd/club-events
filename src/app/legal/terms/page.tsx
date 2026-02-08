import React from 'react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Terms of Service</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing and using UniEvents, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. Student Project Disclaimer</h2>
            <p><strong>UniEvents is a student-run project.</strong> It is provided "as is" without any guarantees or warranty. We are not officially affiliated with the university administration. We are not responsible for data loss, service interruptions, or the accuracy of event information posted by clubs.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. User Conduct</h2>
            <p>You agree not to use the platform to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Post content that is unlawful, harmful, threatening, or abusive.</li>
              <li>Impersonate any person or entity.</li>
              <li>Upload viruses or malicious code.</li>
              <li>Spam or solicit other users commercially.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">4. Content Ownership</h2>
            <p>Clubs retain all rights to the images and text they upload. However, by uploading content, you grant UniEvents a license to display and distribute this content on the platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">5. Termination</h2>
            <p>We reserve the right to terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
          </section>
        </div>
      </div>
    </div>
  );
}