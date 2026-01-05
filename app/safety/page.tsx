export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg border border-amber-200/50 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Safety & Compliance Information
        </h1>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            AI Disclosure
          </h2>
          <p className="text-gray-600 mb-4">
            The Critical Reasoning Mirror is an AI-powered educational tool, not a human tutor or counselor.
            It is designed to reflect your reasoning back to you for examination — it is not a source of
            truth, medical advice, legal advice, or crisis support.
          </p>
          <p className="text-gray-600">
            This tool uses Claude, an AI assistant developed by Anthropic, to facilitate educational
            conversations about speech science research articles as part of SLHS 303 at California State
            University, East Bay.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Crisis Intervention Protocols
          </h2>
          <p className="text-gray-600 mb-4">
            In compliance with California SB 243, this system includes automated detection of crisis
            language. If the system detects language suggesting suicidal ideation, self-harm, or harm
            to others, it will immediately:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
            <li>Pause the academic conversation</li>
            <li>Provide crisis resource information</li>
            <li>Offer to help connect with professional support</li>
            <li>Log the incident anonymously for compliance reporting</li>
          </ul>
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
            <h3 className="font-semibold text-teal-900 mb-2">Crisis Resources</h3>
            <ul className="text-teal-800 space-y-1">
              <li><strong>National Suicide Prevention Lifeline:</strong> Call or text 988</li>
              <li><strong>Crisis Text Line:</strong> Text HOME to 741741</li>
              <li><strong>CSUEB Counseling Services:</strong> (510) 885-3690</li>
              <li><strong>Emergency Services:</strong> 911</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Data Handling Practices
          </h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>
              <strong>Conversation data:</strong> Submitted conversations are stored in a secure database
              for grading purposes and are accessible only to the course instructor.
            </li>
            <li>
              <strong>Crisis incidents:</strong> When crisis language is detected, an anonymized record
              (timestamp and incident type only — no conversation content or student identifiers) is
              logged for California state compliance reporting.
            </li>
            <li>
              <strong>Session data:</strong> Conversations not submitted for grading are not permanently stored.
            </li>
            <li>
              <strong>No third-party sharing:</strong> Student data is not sold or shared with third parties
              for marketing purposes.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Extended Use Reminders
          </h2>
          <p className="text-gray-600">
            In compliance with California law, this system will remind users to take breaks after
            extended periods of continuous use (3+ hours). Research demonstrates that spaced practice
            is more effective for learning than marathon sessions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Content Restrictions
          </h2>
          <p className="text-gray-600">
            This system is designed exclusively for educational discourse about speech science. It
            includes guardrails preventing generation of sexual content, dangerous information, or
            content inappropriate for educational settings.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Reporting Concerns
          </h2>
          <p className="text-gray-600 mb-4">
            If you have concerns about this system&apos;s safety features, data handling, or any other aspect
            of its operation, please contact:
          </p>
          <ul className="text-gray-600 space-y-1">
            <li><strong>Course Instructor:</strong> matthew.guggemos@csueastbay.edu</li>
            <li><strong>CSUEB IT Security:</strong> itssecurity@csueastbay.edu</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Legal Compliance
          </h2>
          <p className="text-gray-600">
            This system is designed to comply with California SB 243 (Educational AI Safety Requirements),
            effective January 1, 2026. Annual incident reports will be submitted to California&apos;s Office
            of Suicide Prevention as required beginning July 2027.
          </p>
        </section>

        <footer className="mt-12 pt-8 border-t border-amber-200 text-sm text-gray-500">
          <p>Last updated: January 2026</p>
          <p>SLHS 303: Speech and Hearing Science | California State University, East Bay</p>
          <a
            href="/"
            className="inline-block mt-4 text-teal-600 hover:text-teal-700 font-medium"
          >
            &larr; Return to Critical Reasoning Mirror
          </a>
        </footer>
      </div>
    </div>
  )
}
