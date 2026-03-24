export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Cookie &amp; Local Storage Policy</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Last Updated: March 24, 2026</p>

        <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">What We Store in Your Browser</h2>
            <p>UniEvents uses your browser&apos;s <strong>local storage</strong> (not traditional cookies) to provide core functionality. Local storage is similar to cookies but the data stays on your device and is not automatically sent to our servers with every request.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">What We Store &amp; Why</h2>
            <ul className="list-disc pl-5 mt-2 space-y-3">
              <li><strong>Authentication token</strong> — Keeps you logged in. This token is sent to our servers with requests that require authentication (e.g., creating or editing events). Without this, you would need to log in on every page visit.</li>
              <li><strong>Theme preference</strong> — Remembers whether you chose light, dark, or vibrant mode. This data never leaves your device.</li>
              <li><strong>Privacy banner preference</strong> — Remembers whether you have acknowledged this notice so we do not show it again.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Third-Party Cookies</h2>
            <p>We do not use any third-party cookies, analytics, or tracking services.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Your Choices</h2>
            <p>You can clear local storage data at any time through your browser settings. Clearing this data will log you out and reset your theme preference. You can also use your browser&apos;s developer tools to inspect exactly what UniEvents stores.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Server-Side Data for Likes</h2>
            <p>When you like an event, your IP address is stored on our servers to prevent duplicate likes. This data is used solely for deduplication — it is not linked to any account, not used for tracking, and is deleted when the event is removed. See our <a href="/legal/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</a> for more details.</p>
          </section>
        </div>
      </div>
    </div>
  );
}