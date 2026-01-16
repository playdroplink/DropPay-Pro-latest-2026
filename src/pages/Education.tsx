import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { ScrollToTop } from '@/components/ScrollToTop';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { GraduationCap, BookOpen, Users, Award, Video, Lock, ArrowRight, Check } from 'lucide-react';

export default function Education() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-orange-50/50 to-background">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="secondary" className="mb-4">Education & Courses</Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Sell <span className="text-gradient">Online Courses</span> with Pi
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Sell online courses, tutorials, and educational content. Manage student access, course enrollment, and certificate delivery seamlessly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8 py-6" asChild>
                  <Link to="/auth">
                    Start Teaching
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
                  <Link to="/demos/education">View Demo Checkout</Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
                  <Link to="/docs">View API Docs</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Built for Educators</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything you need to sell and deliver online courses
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                {
                  icon: BookOpen,
                  title: 'Course Payments',
                  description: 'Sell individual courses or bundles. Support for one-time purchases, payment plans, and subscription-based access.',
                },
                {
                  icon: Users,
                  title: 'Student Management',
                  description: 'Track enrolled students, monitor progress, and manage access to course materials. View completion rates and engagement.',
                },
                {
                  icon: Award,
                  title: 'Certificate Delivery',
                  description: 'Automatically issue certificates upon course completion. Customizable templates with student names and course details.',
                },
                {
                  icon: Lock,
                  title: 'Lifetime Access',
                  description: 'Grant students permanent access to purchased courses. Support for drip content release and timed module unlocks.',
                },
                {
                  icon: Video,
                  title: 'Content Protection',
                  description: 'Secure delivery of course videos, PDFs, and materials. Prevent unauthorized sharing and downloads.',
                },
                {
                  icon: GraduationCap,
                  title: 'Learning Platform',
                  description: 'Host courses on your site or integrate with existing platforms. Works with LMS systems and custom setups.',
                },
              ].map((feature, idx) => (
                <Card key={idx} className="border-border hover:border-primary/50 transition-all">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-secondary/30">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Launch Your Course Today</h2>
              <p className="text-muted-foreground">Three steps to start selling</p>
            </div>

            <div className="max-w-4xl mx-auto space-y-8">
              {[
                {
                  step: '1',
                  title: 'Create Your Course',
                  description: 'Set up course details, pricing, and curriculum. Upload video lessons, PDFs, and supplementary materials.',
                },
                {
                  step: '2',
                  title: 'Generate Payment Links',
                  description: 'Create payment links for each course. Embed checkout on your site or share links via email and social media.',
                },
                {
                  step: '3',
                  title: 'Grant Access Automatically',
                  description: 'Students get instant access after purchase. Track enrollments, send course materials, and issue certificates.',
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center font-bold text-xl">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Perfect For</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                { title: 'Online Courses', items: ['Video tutorials', 'Masterclasses', 'Bootcamps', 'Certification programs'] },
                { title: 'Digital Content', items: ['eBooks', 'Templates', 'Workbooks', 'Resource libraries'] },
                { title: 'Coaching', items: ['1-on-1 coaching', 'Group programs', 'Workshops', 'Mentorship'] },
              ].map((category, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle>{category.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.items.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-muted-foreground">
                          <Check className="w-4 h-4 text-green-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-br from-orange-50/50 to-background">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Share Your Knowledge?</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join educators already teaching with DropPay
              </p>
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <Link to="/auth">
                  Start Teaching
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
}
