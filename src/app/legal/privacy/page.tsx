import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Privacy Policy</h1>
        
        <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1. Information We Collect</h2>
            <p>We collect the following information when you register:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Personal Data:</strong> Name, Email address, and Password (encrypted).</li>
              <li><strong>Club Data:</strong> Club descriptions, logos, and event images.</li>
              <li><strong>Usage Data:</strong> Information on how you access the site (e.g., browser type).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. How We Use Your Data</h2>
            <p>We use your data solely to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Provide and maintain the service.</li>
              <li>Allow you to manage your club and events.</li>
              <li>Notify you about changes to our service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. Data Security</h2>
            <p>The security of your data is important to us, but remember that no method of transmission over the Internet is 100% secure. We use standard encryption for passwords and secure database connections.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">4. Third-Party Services</h2>
            <p>We may use third-party Service Providers to monitor and analyze the use of our Service (e.g., AWS) or to host images (e.g., AWS).</p>
          </section>
        </div>
      </div>
    </div>
  );
}