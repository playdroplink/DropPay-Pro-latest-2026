import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import dropPayLogo from '@/assets/droppay-logo.png';

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src={dropPayLogo} 
                alt="DropPay Logo" 
                className="w-10 h-10 rounded-xl object-cover"
              />
              <span className="text-xl font-bold text-foreground">DropPay</span>
            </Link>
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto prose prose-invert">
          <h1 className="text-4xl font-bold text-foreground mb-4">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: December 22, 2025</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using DropPay, you accept and agree to be bound by the terms and provision 
              of this agreement. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground">
              DropPay provides a payment gateway platform that enables merchants to accept Pi Network 
              cryptocurrency payments. We offer API access, payment links, checkout widgets, and related 
              services to facilitate digital transactions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. User Accounts</h2>
            <p className="text-muted-foreground mb-4">To use our services, you must:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Have a valid Pi Network account</li>
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Be at least 18 years old or the age of majority in your jurisdiction</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Acceptable Use</h2>
            <p className="text-muted-foreground mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Use the service for any illegal purposes</li>
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use the service to transmit malware or harmful code</li>
              <li>Engage in fraudulent activities</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Fees and Payments</h2>
            <p className="text-muted-foreground">
              DropPay charges platform fees based on your subscription plan to support maintenance, security, and future features. Fees are subject to change 
              with 30 days notice.
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>Free Plan: π0.01/month (minimum), 1 payment link, no platform fee</li>
              <li>Basic Plan: π10/month, 5 payment links, 2% platform fee</li>
              <li>Pro Plan: π20/month, 10 payment links, 2% platform fee</li>
              <li>Enterprise Plan: π50/month, unlimited payment links, 2% platform fee</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. API Usage</h2>
            <p className="text-muted-foreground">
              API access is provided based on your subscription plan. You must:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>Keep your API keys secure and confidential</li>
              <li>Not exceed rate limits specified in your plan</li>
              <li>Not share API keys with unauthorized parties</li>
              <li>Report any security breaches immediately</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Payment Processing</h2>
            <p className="text-muted-foreground">
              All payments are processed through the Pi Network blockchain. DropPay facilitates 
              transactions but does not hold or control your funds. Transaction finality is subject 
              to blockchain confirmation.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Refunds and Disputes</h2>
            <p className="text-muted-foreground">
              Subscription fees are non-refundable. Payment disputes 
              should be resolved directly between merchants and customers. DropPay may assist 
              with dispute resolution but is not liable for transaction outcomes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Service Availability</h2>
            <p className="text-muted-foreground">
              We strive for 99.9% uptime but do not guarantee uninterrupted service. We may 
              perform maintenance with notice when possible. We are not liable for downtime 
              caused by factors beyond our control.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Intellectual Property</h2>
            <p className="text-muted-foreground">
              All content, features, and functionality of DropPay are owned by Mrwain Organization 
              and protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              DropPay is provided "as is" without warranties. We are not liable for indirect, 
              incidental, or consequential damages. Our total liability is limited to the fees 
              paid by you in the past 12 months.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">12. Termination</h2>
            <p className="text-muted-foreground">
              We may suspend or terminate your account for violations of these terms. You may 
              cancel your subscription at any time. Upon termination, you must cease using 
              our API and services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">13. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. Continued use of the 
              service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">14. Contact Information</h2>
            <p className="text-muted-foreground">
              For questions about these Terms of Service, contact us at:
              <br />
              <a href="mailto:legal@droppay.space" className="text-primary hover:underline">
                legal@droppay.space
              </a>
            </p>
          </section>

          <div className="mt-12 p-6 bg-secondary/50 rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              DropPay is powered by Droplink and Dropstore under Mrwain Organization
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
