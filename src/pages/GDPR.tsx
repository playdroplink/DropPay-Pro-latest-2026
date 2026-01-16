import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import dropPayLogo from '@/assets/droppay-logo.png';

const GDPR = () => {
  const [dataRequestType, setDataRequestType] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  
  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    // This would normally connect to a backend service
    console.log("GDPR request submitted:", {
      type: dataRequestType,
      email,
      message
    });
    
    toast({
      title: "Request Submitted",
      description: "We'll process your request within 30 days as required by GDPR."
    });
    
    // Reset form
    setDataRequestType(null);
    setEmail("");
    setMessage("");
  };

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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-4">GDPR Compliance</h1>
          <p className="text-muted-foreground mb-8">Last updated: December 29, 2025</p>
          
          <div className="mb-8 p-4 border-l-4 border-primary bg-primary/5 rounded-md">
            <p className="mb-3 font-medium text-foreground">EU/UK Data Subject Requests for DropPay</p>
            <p className="text-muted-foreground mb-4">
              If you are located in the UK or the EU, you can submit a GDPR data subject request related to your personal data with DropPay via our privacy partner portal.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="w-full sm:w-auto"
                onClick={() => window.open('https://app.prighter.com/portal/16457313501', '_blank')}
              >
                Open Prighter Portal
              </Button>
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => window.open('https://app.prighter.com/portal/16457313501', '_blank')}
              >
                Submit GDPR Request
              </Button>
            </div>
          </div>
          
          <div className="prose prose-invert max-w-none">
            <div className="my-8 p-4 bg-muted rounded-lg text-sm">
              <p className="font-medium text-foreground">Summary:</p>
              <p className="text-muted-foreground">
                This GDPR Policy explains how DropPay collects, uses, and protects your personal data in accordance with the General Data Protection Regulation (GDPR). 
                We collect only necessary information, process it lawfully, and respect your rights to access, correct, delete, and port your data. 
                You may withdraw consent at any time, and we maintain appropriate security measures to protect your information.
              </p>
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">1. Introduction</h2>
            <p className="text-muted-foreground">
              At DropPay, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This General Data Protection Regulation (GDPR) Policy outlines how we collect, process, and handle personal data 
              of European Union (EU) residents and citizens in compliance with the GDPR.
            </p>
            <p className="text-muted-foreground">
              The GDPR is a regulation that requires businesses to protect the personal data and privacy of EU citizens for transactions that occur within EU member states. 
              This policy applies to all our operations, including our website, products, and services.
            </p>
            
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">2. Data Controller</h2>
            <p className="text-muted-foreground">
              For the purposes of the GDPR, DropPay Inc. is the data controller responsible for your personal information. 
              If you have any questions about this policy or our data practices, please contact us at:
            </p>
            <p className="text-muted-foreground">
              <a href="mailto:support@droppay.space" className="text-primary hover:underline">support@droppay.space</a><br />
              DropPay Inc.<br />
              1234 Privacy Lane<br />
              San Francisco, CA 94105<br />
              USA
            </p>
            
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">3. Principles of Data Processing</h2>
            <div className="space-y-4 mt-6">
              <p className="text-muted-foreground">We process personal data in accordance with the following principles:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong className="text-foreground">Lawfulness, fairness, and transparency</strong>: We process data lawfully, fairly, and in a transparent manner.</li>
                <li><strong className="text-foreground">Purpose limitation</strong>: We collect data for specified, explicit, and legitimate purposes.</li>
                <li><strong className="text-foreground">Data minimization</strong>: We limit data collection to what is necessary for the purposes for which it is processed.</li>
                <li><strong className="text-foreground">Accuracy</strong>: We take reasonable steps to ensure personal data is accurate and kept up to date.</li>
                <li><strong className="text-foreground">Storage limitation</strong>: We keep data for no longer than necessary for the purposes for which it is processed.</li>
                <li><strong className="text-foreground">Integrity and confidentiality</strong>: We process data in a manner that ensures appropriate security.</li>
                <li><strong className="text-foreground">Accountability</strong>: We are responsible for and can demonstrate compliance with these principles.</li>
              </ul>
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">4. Types of Data We Collect</h2>
            <p className="text-muted-foreground">We may collect the following personal data from you:</p>
            <div className="space-y-4 mt-6">
              <div className="p-4 border border-muted rounded-lg">
                <h3 className="text-xl font-bold text-foreground mb-2">Account Data</h3>
                <p className="text-muted-foreground">
                  Information you provide when you create an account with us, such as your name, email address, username, and profile picture.
                </p>
              </div>
              
              <div className="p-4 border border-muted rounded-lg">
                <h3 className="text-xl font-bold text-foreground mb-2">Profile Data</h3>
                <p className="text-muted-foreground">
                  Information you add to your public profile, such as biography, social media links, and other content you choose to share.
                </p>
              </div>
              
              <div className="p-4 border border-muted rounded-lg">
                <h3 className="text-xl font-bold text-foreground mb-2">Usage Data</h3>
                <p className="text-muted-foreground">
                  Information about how you use our website, products, and services, including payment links you create, transactions, and engagement metrics.
                </p>
              </div>
              
              <div className="p-4 border border-muted rounded-lg">
                <h3 className="text-xl font-bold text-foreground mb-2">Technical Data</h3>
                <p className="text-muted-foreground">
                  Information about your device, browser, IP address, time zone, and cookies when you visit our website.
                </p>
              </div>
              
              <div className="p-4 border border-muted rounded-lg">
                <h3 className="text-xl font-bold text-foreground mb-2">Transaction Data</h3>
                <p className="text-muted-foreground">
                  Information related to payments and transactions you make on our platform, including Pi cryptocurrency transactions.
                </p>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">5. Legal Basis for Processing</h2>
            <p className="text-muted-foreground">We process your personal data based on one or more of the following legal grounds:</p>
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-background border border-muted rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-primary mb-2">Consent</h3>
                <p className="text-muted-foreground">Where you have given us explicit consent to process your data for specific purposes.</p>
              </div>
              <div className="p-4 bg-background border border-muted rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-primary mb-2">Contractual Necessity</h3>
                <p className="text-muted-foreground">Where processing is necessary to fulfill our contractual obligations to you.</p>
              </div>
              <div className="p-4 bg-background border border-muted rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-primary mb-2">Legal Obligation</h3>
                <p className="text-muted-foreground">Where processing is necessary for compliance with legal obligations.</p>
              </div>
              <div className="p-4 bg-background border border-muted rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-primary mb-2">Legitimate Interests</h3>
                <p className="text-muted-foreground">Where processing is necessary for our legitimate interests, provided they do not override your rights and interests.</p>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">6. Your Rights Under GDPR</h2>
            <p className="text-muted-foreground">As an EU citizen or resident, you have the following rights regarding your personal data:</p>
            <div className="mt-4 space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="text-xl font-bold text-foreground mb-2">Right to Access</h3>
                <p className="text-muted-foreground">You have the right to request a copy of the personal information we hold about you.</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="text-xl font-bold text-foreground mb-2">Right to Rectification</h3>
                <p className="text-muted-foreground">You have the right to request that we correct any inaccurate or incomplete personal information about you.</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="text-xl font-bold text-foreground mb-2">Right to Erasure (Right to be Forgotten)</h3>
                <p className="text-muted-foreground">You have the right to request the deletion of your personal data when it is no longer necessary for the purposes for which it was collected.</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="text-xl font-bold text-foreground mb-2">Right to Restrict Processing</h3>
                <p className="text-muted-foreground">You have the right to request that we restrict the processing of your personal data under certain circumstances.</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="text-xl font-bold text-foreground mb-2">Right to Data Portability</h3>
                <p className="text-muted-foreground">You have the right to receive your personal data in a structured, commonly used, and machine-readable format.</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="text-xl font-bold text-foreground mb-2">Right to Object</h3>
                <p className="text-muted-foreground">You have the right to object to the processing of your personal data in certain circumstances.</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="text-xl font-bold text-foreground mb-2">Rights Related to Automated Decision-Making</h3>
                <p className="text-muted-foreground">You have the right not to be subject to a decision based solely on automated processing that produces legal effects concerning you.</p>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">7. Exercising Your Rights</h2>
            <p className="text-muted-foreground">
              To exercise any of your rights regarding your personal data, please submit a request through our data subject request form below or contact us at <a href="mailto:support@droppay.space" className="text-primary hover:underline">support@droppay.space</a>.
            </p>
            <p className="text-muted-foreground">
              We will respond to your request within 30 days. In some cases, we may need to verify your identity before processing your request.
            </p>
            
            <div className="p-6 mt-8 bg-muted rounded-lg">
              <h3 className="text-xl font-bold text-foreground mb-4">Data Subject Request Form</h3>
              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Request Type</label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="access" 
                        name="requestType" 
                        className="mr-2" 
                        checked={dataRequestType === 'access'} 
                        onChange={() => setDataRequestType('access')}
                      />
                      <label htmlFor="access" className="text-muted-foreground">Access my data</label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="rectification" 
                        name="requestType" 
                        className="mr-2" 
                        checked={dataRequestType === 'rectification'} 
                        onChange={() => setDataRequestType('rectification')}
                      />
                      <label htmlFor="rectification" className="text-muted-foreground">Correct my data</label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="erasure" 
                        name="requestType" 
                        className="mr-2" 
                        checked={dataRequestType === 'erasure'} 
                        onChange={() => setDataRequestType('erasure')}
                      />
                      <label htmlFor="erasure" className="text-muted-foreground">Delete my data</label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="portability" 
                        name="requestType" 
                        className="mr-2" 
                        checked={dataRequestType === 'portability'} 
                        onChange={() => setDataRequestType('portability')}
                      />
                      <label htmlFor="portability" className="text-muted-foreground">Export my data</label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="restriction" 
                        name="requestType" 
                        className="mr-2" 
                        checked={dataRequestType === 'restriction'} 
                        onChange={() => setDataRequestType('restriction')}
                      />
                      <label htmlFor="restriction" className="text-muted-foreground">Restrict processing of my data</label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">Your Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">Details of Your Request</label>
                  <textarea 
                    id="message" 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)} 
                    rows={4} 
                    className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  ></textarea>
                </div>
                
                <Button type="submit" disabled={!dataRequestType || !email}>Submit Request</Button>
              </form>
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">8. Data Security</h2>
            <p className="text-muted-foreground">
              We implement appropriate technical and organizational measures to ensure a level of security appropriate to the risk, 
              including encryption of personal data, regular security assessments, and secure access controls.
            </p>
            
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">9. Data Transfers</h2>
            <p className="text-muted-foreground">
              We may transfer your personal data to countries outside the European Economic Area (EEA). 
              When we do so, we ensure that appropriate safeguards are in place to protect your data, 
              such as Standard Contractual Clauses approved by the European Commission.
            </p>
            
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">10. Data Breach Notification</h2>
            <p className="text-muted-foreground">
              In the event of a personal data breach, we will notify the relevant supervisory authority within 72 hours of becoming aware of the breach, 
              where feasible. If the breach is likely to result in a high risk to your rights and freedoms, 
              we will notify you without undue delay.
            </p>
            
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">11. Data Protection Officer</h2>
            <p className="text-muted-foreground">
              We have appointed a Data Protection Officer (DPO) responsible for overseeing our data protection strategy and implementation. 
              You can contact our DPO at <a href="mailto:support@droppay.space" className="text-primary hover:underline">support@droppay.space</a>.
            </p>
            
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">12. Complaints</h2>
            <p className="text-muted-foreground">
              If you have concerns about how we process your personal data, please contact us at <a href="mailto:support@droppay.space" className="text-primary hover:underline">support@droppay.space</a>. 
              You also have the right to lodge a complaint with a supervisory authority in the EU member state where you reside, work, or where an alleged infringement of the GDPR has occurred.
            </p>
            
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">13. Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this GDPR Policy from time to time. The date at the top of this policy indicates when it was last updated. 
              We will notify you of any material changes to this policy as required by law.
            </p>
            
            <div className="mt-12 p-4 border border-muted rounded-lg">
              <p className="font-medium text-foreground mb-2">For more information about how we protect your data, please see our:</p>
              <ul className="list-disc ml-6 text-muted-foreground">
                <li>
                  <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                </li>
                <li>
                  <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GDPR;
