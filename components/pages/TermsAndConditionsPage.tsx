'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function TermsAndConditionsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <FileText className="w-8 h-8 mr-3 text-blue-600" />
            Terms & Conditions
          </CardTitle>
        </CardHeader>
        <CardContent className="prose max-w-none text-gray-700">
          <p className="text-gray-600 mb-6">
            Last updated: December 19, 2024
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using Edubridgepeople (the "Platform"), you agree to be bound by these Terms and Conditions ("Terms"), our Privacy Policy, and all applicable laws and regulations. If you do not agree with any of these Terms, you are prohibited from using or accessing this site.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">2. User Accounts</h2>
              <p>
                To use certain features of the Platform, you may be required to register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding your password and for any activities or actions under your password.
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>You must be at least 13 years old to use the Platform.</li>
                <li>You are solely responsible for your account and the data associated with it.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">3. Student Verification</h2>
              <p>
                Students seeking to claim resources must undergo a verification process by submitting valid student identification. This process is essential for maintaining the integrity and trustworthiness of our community. We reserve the right to approve or deny verification requests at our sole discretion.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">4. Content and Conduct</h2>
              <p>
                You are responsible for all content you post on the Platform, including wisdom posts and resource donations. You agree not to post any content that is:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>Unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, libelous, invasive of another's privacy, hateful, or racially, ethnically, or otherwise objectionable.</li>
                <li>Infringing on any patent, trademark, trade secret, copyright, or other proprietary rights of any party.</li>
                <li>Commercial solicitation or spam.</li>
              </ul>
              <p>
                Edubridgepeople reserves the right to remove any content that violates these Terms or is otherwise objectionable, and to terminate user accounts for such violations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">5. Resource Donations & Claims</h2>
              <p>
                Edubridgepeople acts as a platform to connect donors and students. We do not guarantee the availability, quality, or condition of any resources offered or claimed through the Platform. All interactions and transactions regarding resource sharing are solely between the donor and the student. Edubridgepeople is not responsible for any disputes or issues arising from these interactions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">6. Intellectual Property</h2>
              <p>
                The Platform and its original content, features, and functionality are and will remain the exclusive property of Edubridgepeople and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Edubridgepeople.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">7. Disclaimers</h2>
              <p>
                The Platform is provided on an "AS IS" and "AS AVAILABLE" basis. Edubridgepeople makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties, including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">8. Limitation of Liability</h2>
              <p>
                In no event shall Edubridgepeople or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Edubridgepeople's website, even if Edubridgepeople or an Edubridgepeople authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">9. Governing Law</h2>
              <p>
                These Terms shall be governed and construed in accordance with the laws of [Your Jurisdiction, e.g., the State of California] without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">10. Changes to Terms</h2>
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Platform after those revisions become effective, you agree to be bound by the revised terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">11. Contact Information</h2>
              <p>
                If you have any questions about these Terms, please contact us at: <strong>info@edubridgepeople.com</strong>
              </p>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
