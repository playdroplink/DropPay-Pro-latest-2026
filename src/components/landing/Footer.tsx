import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, ExternalLink, ArrowUp } from 'lucide-react';
import dropPayLogo from '@/assets/droppay-logo.png';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { EcosystemModal } from '@/components/EcosystemModal';
import { PlatformFeeModal } from '@/components/PlatformFeeModal';
import { PublicReleaseAnnouncement } from '@/components/modals/PublicReleaseAnnouncement';
import { Badge } from '@/components/ui/badge';

export function Footer() {
  const [licenseOpen, setLicenseOpen] = useState(false);
  const [isOfficialStatementModalOpen, setIsOfficialStatementModalOpen] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

              <li>
                <Button 
                  variant="link" 
                  className="px-0 text-muted-foreground hover:text-primary transition-colors justify-start h-auto font-normal"
                  asChild
                >
                  <a 
                    href="https://support.help.minepi.com/servicedesk/customer/portal/1/article/33038" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1"
                  >
                    Community Wiki
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </Button>
              </li>
  return (
    <footer className="bg-gradient-to-b from-background to-muted/30 py-16 border-t border-border overflow-x-hidden">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Back to Top Button */}
        <div className="flex justify-end mb-8">
          <Button
            onClick={scrollToTop}
            variant="outline"
            size="sm"
            className="gap-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
          >
            <ArrowUp className="w-4 h-4" />
            Back to Top
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              <div className="relative">
                <img 
                  src={dropPayLogo} 
                  alt="DropPay Logo" 
                  className="w-12 h-12 rounded-xl object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 rounded-xl bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <span className="text-2xl font-bold text-foreground">DropPay</span>
            </Link>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              The simplest way to accept Pi cryptocurrency payments. Secure, fast, and built for the future of decentralized commerce.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">Trusted by merchants</Badge>
              <Badge variant="outline" className="text-xs">Pi Network Verified</Badge>
            </div>
          </div>

          {/* Product Section */}
          <div>
            <h4 className="font-bold text-lg text-foreground mb-6 flex items-center gap-2">
              Product
              <div className="w-8 h-0.5 bg-primary rounded-full" />
            </h4>
            <ul className="space-y-4">
              <li>
                <Button
                  variant="link"
                  className="px-0 text-muted-foreground hover:text-primary transition-colors justify-start h-auto font-normal"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Features
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  className="px-0 text-muted-foreground hover:text-primary transition-colors justify-start h-auto font-normal"
                  onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Pricing
                </Button>
              </li>
              <li>
                <Button variant="link" className="px-0 text-muted-foreground hover:text-primary transition-colors justify-start h-auto font-normal" asChild>
                  <Link to="/docs" className="flex items-center gap-2">
                    API Docs
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </Button>
              </li>
              <li>
                <Button variant="link" className="px-0 text-muted-foreground hover:text-primary transition-colors justify-start h-auto font-normal" asChild>
                  <Link to="/ai-support">
                    AI Support
                  </Link>
                </Button>
              </li>
              <li>
                <Button variant="link" className="px-0 text-muted-foreground hover:text-primary transition-colors justify-start h-auto font-normal" asChild>
                  <Link to="/dashboard/help">
                    Help & Support
                  </Link>
                </Button>
              </li>
            </ul>
          </div>

          {/* Company Section */}
          <div>
            <h4 className="font-bold text-lg text-foreground mb-6 flex items-center gap-2">
              Company
              <div className="w-8 h-0.5 bg-primary rounded-full" />
            </h4>
            <ul className="space-y-4">
              <li>
                <Button variant="link" className="px-0 text-muted-foreground hover:text-primary transition-colors justify-start h-auto font-normal" asChild>
                  <Link to="/about">
                    About
                  </Link>
                </Button>
              </li>
              <li>
                <Button variant="link" className="px-0 text-muted-foreground hover:text-primary transition-colors justify-start h-auto font-normal" asChild>
                  <Link to="/blog">
                    Blog
                  </Link>
                </Button>
              </li>
              <li>
                <Button variant="link" className="px-0 text-muted-foreground hover:text-primary transition-colors justify-start h-auto font-normal" asChild>
                  <Link to="/contact">
                    Contact
                  </Link>
                </Button>
              </li>
              <li>
                <Button variant="link" className="px-0 text-muted-foreground hover:text-primary transition-colors justify-start h-auto font-normal" asChild>
                  <Link to="/reviews">
                    Reviews
                  </Link>
                </Button>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h4 className="font-bold text-lg text-foreground mb-6 flex items-center gap-2">
              Legal
              <div className="w-8 h-0.5 bg-primary rounded-full" />
            </h4>
            <ul className="space-y-4">
              <li>
                <Button variant="link" className="px-0 text-muted-foreground hover:text-primary transition-colors justify-start h-auto font-normal" asChild>
                  <Link to="/privacy">
                    Privacy Policy
                  </Link>
                </Button>
              </li>
              <li>
                <Button variant="link" className="px-0 text-muted-foreground hover:text-primary transition-colors justify-start h-auto font-normal" asChild>
                  <Link to="/terms">
                    Terms of Service
                  </Link>
                </Button>
              </li>
              <li>
                <Button 
                  variant="link" 
                  className="px-0 text-muted-foreground hover:text-primary transition-colors justify-start h-auto font-normal"
                  asChild
                >
                  <Link to="/gdpr">
                    GDPR Compliance
                  </Link>
                </Button>
              </li>
              <li>
                <PublicReleaseAnnouncement 
                  trigger={
                    <Button variant="link" className="px-0 text-muted-foreground hover:text-primary transition-colors justify-start h-auto font-normal">
                      Public Announcement
                    </Button>
                  }
                />
              </li>
              <li>
                <PlatformFeeModal>
                  <Button variant="link" className="px-0 text-muted-foreground hover:text-primary transition-colors justify-start h-auto font-normal">
                    Platform Fee Transparency
                  </Button>
                </PlatformFeeModal>
              </li>
              <li>
                <Button 
                  variant="link" 
                  className="px-0 text-muted-foreground hover:text-primary transition-colors justify-start h-auto font-normal"
                  onClick={() => setIsOfficialStatementModalOpen(true)}
                >
                  Official Statement
                </Button>
              </li>
              <li>
                <Button 
                  variant="link" 
                  className="px-0 text-muted-foreground hover:text-primary transition-colors justify-start h-auto font-normal"
                  asChild
                >
                  <a 
                    href="https://support.help.minepi.com/servicedesk/customer/portal/1/article/33038" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1"
                  >
                    Community Wiki
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </Button>
              </li>
              <li>
                <Button 
                  variant="link" 
                  className="px-0 text-muted-foreground hover:text-primary transition-colors justify-start h-auto font-normal"
                  asChild
                >
                  <a 
                    href="https://minepi.com/wp-content/uploads/2025/11/MiCA-Whitepaper-Pi-1.pdf" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1"
                  >
                    MiCA Whitepaper
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </Button>
              </li>
              <li>
                <Dialog open={licenseOpen} onOpenChange={setLicenseOpen}>
                  <DialogTrigger asChild>
                    <Button variant="link" className="px-0 text-muted-foreground hover:text-primary transition-colors justify-start h-auto font-normal">
                      Software License
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Software License</DialogTitle>
                      <DialogDescription className="space-y-4 text-left text-muted-foreground">
                        <p>Copyright (C) 2025 MRWAIN ORGANIZATION</p>
                        <p>
                          Permission is hereby granted by the application software developer ("Software Developer"), free of charge, to any person obtaining a copy of this application, software and associated documentation files (the "Software"), which was developed by the Software Developer for use on Pi Network, whereby the purpose of this license is to permit the development of derivative works based on the Software, including the right to use, copy, modify, merge, publish, distribute, sub-license, and/or sell copies of such derivative works and any Software components incorporated therein, and to permit persons to whom such derivative works are furnished to do so, in each case, solely to develop, use and market applications for the official Pi Network.
                        </p>
                        <p>
                          For purposes of this license, Pi Network shall mean any application, software, or other present or future platform developed, owned or managed by Pi Community Company, and its parents, affiliates or subsidiaries, for which the Software was developed, or on which the Software continues to operate. However, you are prohibited from using any portion of the Software or any derivative works thereof in any manner (a) which infringes on any Pi Network intellectual property rights, (b) to hack any of Pi Network’s systems or processes or (c) to develop any product or service which is competitive with the Pi Network.
                        </p>
                        <p>
                          The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
                        </p>
                        <p>
                          THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE AUTHORS, PUBLISHERS, OR COPYRIGHT HOLDERS OF THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO BUSINESS INTERRUPTION, LOSS OF USE, DATA OR PROFITS) HOWEVER CAUSED AND UNDER ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE) ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
                        </p>
                        <p>Pi, Pi Network and the Pi logo are trademarks of the Pi Community Company.</p>
                        <p>Copyright (C) 2025 MRWAIN ORGANIZATION</p>
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </li>
            </ul>
          </div>
        </div>

        {/* Ecosystem Section */}
        <div className="mt-16 pt-8 border-t border-border">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">Explore the Drop Ecosystem</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover our suite of interconnected platforms designed to empower creators, merchants, and communities in the Pi Network.
            </p>
          </div>
          <EcosystemModal />
        </div>

        {/* Bottom Section */}
        <div className="mt-16 pt-8 border-t border-border">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="text-center lg:text-left">
              <p className="text-muted-foreground mb-2">
                © {new Date().getFullYear()} DropPay. All rights reserved.
              </p>
              <p className="text-sm text-muted-foreground">
                Powered by{' '}
                <Button variant="link" className="px-1 text-primary font-medium h-auto" asChild>
                  <a 
                    href="https://droplink.space/auth" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1"
                  >
                    Droplink <ExternalLink className="w-3 h-3" />
                  </a>
                </Button>
                {' '}and{' '}
                <Button variant="link" className="px-1 text-primary font-medium h-auto" asChild>
                  <a 
                    href="https://dropshops.space/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1"
                  >
                    Dropstore <ExternalLink className="w-3 h-3" />
                  </a>
                </Button>
                <br className="hidden lg:block" />
                <span className="text-xs block lg:inline mt-2 lg:mt-0">under Mrwain Organization</span>
              </p>
            </div>
            
            <div className="flex flex-col items-center lg:items-end gap-3">
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">
                  Secure Platform
                </Badge>
                <Badge variant="outline" className="text-xs">
                  24/7 Support
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Global Reach
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Official Statement Modal */}
        {isOfficialStatementModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-hidden">
            <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden shadow-xl flex flex-col w-full">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between flex-shrink-0">
                <div className="min-w-0 flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 truncate">Official Statement - DropPay Platform</h2>
                  <p className="text-sm text-gray-600 mt-1">Legal declarations and platform compliance information</p>
                </div>
                <button
                  onClick={() => setIsOfficialStatementModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0 ml-4"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="overflow-y-auto flex-1 p-6 space-y-6 text-sm text-gray-700 leading-relaxed">
                
                {/* Platform Declaration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Platform Declaration</h3>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <p className="font-semibold text-orange-800">DropPay is an officially registered Pi Network application.</p>
                    <p className="mt-2 text-orange-700">
                      This platform operates in full compliance with Pi Network's developer guidelines and mainnet requirements. All Pi transactions are processed through official Pi Network protocols.
                    </p>
                  </div>
                </div>

                {/* Compliance Section */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Regulatory Information</h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <h4 className="font-semibold text-orange-800 flex items-center gap-2">
                        🛡️ Security & Privacy
                      </h4>
                      <ul className="mt-2 text-orange-700 space-y-1 list-disc list-inside">
                        <li>GDPR compliant data processing</li>
                        <li>End-to-end encrypted transactions</li>
                        <li>No personal data sold to third parties</li>
                        <li>Secure wallet integration protocols</li>
                      </ul>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <h4 className="font-semibold text-orange-800 flex items-center gap-2">
                        ⚖️ Legal Framework
                      </h4>
                      <ul className="mt-2 text-orange-700 space-y-1 list-disc list-inside">
                        <li>Operating under digital commerce regulations</li>
                        <li>KYC/AML compliance for merchant accounts</li>
                        <li>Consumer protection standards</li>
                        <li>International e-commerce guidelines</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Pi Network Integration */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">🔗 Pi Network Integration</h3>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h4 className="font-semibold text-orange-800">Authorized Pi Network Application</h4>
                    <p className="mt-2 text-orange-700">
                      DropPay is built using official Pi Network SDKs and APIs. All payment processing utilizes the Pi Network's secure blockchain infrastructure. We maintain strict adherence to Pi Network's terms of service and developer agreements.
                    </p>
                    <div className="mt-3 inline-block bg-orange-200 px-3 py-1 rounded-full">
                      <span className="text-orange-800 font-semibold">Connected to Pi Mainnet</span>
                    </div>
                  </div>
                </div>

                {/* User Rights */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">👤 User Rights & Protections</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <h4 className="font-semibold text-gray-800">Data Ownership</h4>
                      <p className="text-gray-600">You retain full ownership of your payment data and transaction history</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Platform Independence</h4>
                      <p className="text-gray-600">Export your data and migrate at any time</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Fair Usage</h4>
                      <p className="text-gray-600">Transparent pricing with no hidden fees</p>
                    </div>
                  </div>
                </div>

                {/* Official Contact */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">📞 Official Contact</h3>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div className="space-y-2">
                      <p><strong>Legal Entity:</strong> MrWain Organization</p>
                      <p><strong>Platform:</strong> DropPay</p>
                      <p><strong>Support:</strong> <a href="mailto:support@droppay.space" className="text-orange-600 hover:text-orange-700 hover:underline">support@droppay.space</a></p>
                      <p><strong>Legal Inquiries:</strong> <a href="mailto:legal@droppay.space" className="text-orange-600 hover:text-orange-700 hover:underline">legal@droppay.space</a></p>
                      <p><strong>Official Website:</strong> <a href="https://droppay.space" className="text-orange-600 hover:text-orange-700 hover:underline">droppay.space</a></p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200 mt-6">
                  <div className="text-center">
                    <p className="font-bold text-lg text-orange-900">© 2025 MrWain Organization</p>
                    <p className="text-sm text-orange-800 mt-2">DropPay Platform - All Rights Reserved</p>
                    <p className="mt-4 text-xs text-orange-700">
                      Last Updated: January 9, 2026 | Version 2.0
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex justify-end gap-3 flex-shrink-0">
                <button
                  onClick={() => setIsOfficialStatementModalOpen(false)}
                  className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-secondary transition-colors whitespace-nowrap"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
}
