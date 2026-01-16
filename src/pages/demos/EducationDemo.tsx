import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { ScrollToTop } from '@/components/ScrollToTop';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, BookOpen, Check, Award, Clock } from 'lucide-react';

export default function EducationDemo() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <section className="py-12 bg-gradient-to-b from-orange-50/50 to-background">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <Badge variant="secondary" className="mb-4">Demo Checkout</Badge>
              <h1 className="text-4xl font-bold mb-4">Education Checkout Template</h1>
              <p className="text-muted-foreground mb-8">
                Preview how students will enroll in your online courses with instant access and certificates.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto">
              {/* Checkout Card */}
              <Card className="border-2 border-primary/20 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-6 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm opacity-90">Enroll in</p>
                      <p className="font-semibold">Your Learning Platform</p>
                    </div>
                  </div>
                </div>

                {/* Course Preview */}
                <div className="p-6 border-b border-border">
                  <div className="flex gap-4">
                    <div className="w-32 h-20 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-10 h-10 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <Badge variant="secondary" className="mb-2">Best Seller</Badge>
                      <h3 className="text-xl font-bold mb-1">Complete Web Development Masterclass</h3>
                      <p className="text-sm text-muted-foreground">
                        Learn HTML, CSS, JavaScript, React, and Node.js
                      </p>
                    </div>
                  </div>
                </div>

                {/* Course Stats */}
                <div className="p-6 border-b border-border bg-secondary/30">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-lg font-bold">24h</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Video Content</p>
                    </div>
                    <div className="text-center border-x border-border">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                        <span className="text-lg font-bold">12</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Modules</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Award className="w-4 h-4 text-muted-foreground" />
                        <span className="text-lg font-bold">Yes</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Certificate</p>
                    </div>
                  </div>
                </div>

                {/* What You'll Learn */}
                <div className="p-6 border-b border-border">
                  <h4 className="font-semibold mb-4">What You'll Learn</h4>
                  <div className="space-y-2">
                    {[
                      'Build responsive websites from scratch',
                      'Master React.js and modern JavaScript',
                      'Create full-stack applications',
                      'Deploy projects to production',
                      'Build a professional portfolio',
                      'Get job-ready skills'
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Included */}
                <div className="p-6 bg-secondary/30 border-b border-border">
                  <h4 className="font-semibold mb-4">This Course Includes</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      'Lifetime access',
                      'Mobile & desktop',
                      'Certificate included',
                      'Downloadable resources',
                      'Instructor Q&A',
                      'Pi-back guarantee'
                    ].map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                <div className="p-6 border-b border-border">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Course Price</span>
                      <span className="font-medium">π 149.00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <Badge variant="secondary" className="bg-green-100 text-green-700 mb-1">
                          Limited Time Offer
                        </Badge>
                        <p className="text-xs text-muted-foreground">Enroll today and save 50%</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm line-through text-muted-foreground">π 149.00</div>
                        <div className="text-2xl font-bold text-primary">π 74.50</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Button */}
                <div className="p-6">
                  <Button className="w-full h-14 text-lg bg-gradient-to-br from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700">
                    <GraduationCap className="w-5 h-5 mr-2" />
                    Enroll Now π 74.50
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-3">
                    🎓 Instant access • Lifetime updates • 30-day refund • Powered by DropPay
                  </p>
                </div>
              </Card>

              {/* Info Note */}
              <Card className="mt-6 p-4 border-orange-200 bg-orange-50">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> This template grants instant course access after payment. 
                  Automatically delivers certificates upon completion and tracks student progress.
                </p>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
}
