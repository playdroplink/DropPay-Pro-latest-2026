import React, { useState } from "react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DemoCheckoutLink } from "@/components/DemoCheckoutLink";
import {
  ShoppingCart,
  ArrowRight,
  Copy,
  QrCode,
  Share2,
  Package,
  Check,
  MessageSquare,
  Star,
  TrendingUp,
} from "lucide-react";

export default function DemoCheckoutBuilder() {
  const [selectedCategory, setSelectedCategory] = useState<
    "ecommerce" | "saas" | "marketplaces" | "donations" | "gaming" | "education"
  >("ecommerce");

  const categories = [
    {
      id: "ecommerce",
      name: "E-Commerce",
      icon: ShoppingCart,
      color: "from-blue-400 to-blue-600",
      description: "Online stores and product sales",
    },
    {
      id: "saas",
      name: "SaaS",
      icon: TrendingUp,
      color: "from-blue-400 to-blue-600",
      description: "Software subscriptions",
    },
    {
      id: "marketplaces",
      name: "Marketplaces",
      icon: MessageSquare,
      color: "from-purple-400 to-purple-600",
      description: "Multi-vendor platforms",
    },
    {
      id: "donations",
      name: "Donations",
      icon: Star,
      color: "from-red-400 to-red-600",
      description: "Charitable fundraising",
    },
    {
      id: "gaming",
      name: "Gaming",
      icon: Package,
      color: "from-green-400 to-green-600",
      description: "In-game purchases",
    },
    {
      id: "education",
      name: "Education",
      icon: Check,
      color: "from-indigo-400 to-indigo-600",
      description: "Course and content sales",
    },
  ];

  const checkoutExamples: Record<
    string,
    Array<{
      title: string;
      description: string;
      amount: number;
      features: string[];
    }>
  > = {
    ecommerce: [
      {
        title: "Limited Edition Sneakers",
        description: "Premium athletic footwear with exclusive design",
        amount: 150,
        features: [
          "Free shipping worldwide",
          "30-day return policy",
          "Lifetime warranty",
          "Exclusive member access",
        ],
      },
      {
        title: "Designer Handbag",
        description: "Authentic leather luxury bag",
        amount: 450,
        features: [
          "Certificate of authenticity",
          "Premium packaging",
          "Personal styling consultation",
        ],
      },
      {
        title: "Electronics Bundle",
        description: "Complete smart home setup",
        amount: 800,
        features: [
          "Free installation",
          "2-year extended warranty",
          "24/7 tech support",
          "Smart home app access",
        ],
      },
    ],
    saas: [
      {
        title: "Pro Plan - Monthly",
        description: "Advanced analytics and team collaboration",
        amount: 99,
        features: [
          "Up to 10 team members",
          "Advanced analytics",
          "API access",
          "Priority support",
        ],
      },
      {
        title: "Enterprise Annual",
        description: "Full-featured solution for enterprises",
        amount: 2400,
        features: [
          "Unlimited team members",
          "Custom integrations",
          "Dedicated account manager",
          "99.9% uptime SLA",
        ],
      },
      {
        title: "Startup Package",
        description: "Everything new teams need",
        amount: 49,
        features: [
          "Up to 3 team members",
          "Core features",
          "Email support",
          "Community access",
        ],
      },
    ],
    marketplaces: [
      {
        title: "Vendor Premium Listing",
        description: "Featured store with enhanced visibility",
        amount: 250,
        features: [
          "Featured placement",
          "Unlimited products",
          "Advanced analytics",
          "Marketing tools",
        ],
      },
      {
        title: "Seller Commission Reduction",
        description: "50% commission discount for 3 months",
        amount: 500,
        features: [
          "50% lower commissions",
          "3 months access",
          "Seller boost program",
          "Training sessions",
        ],
      },
      {
        title: "Store Setup Service",
        description: "Professional store creation and optimization",
        amount: 300,
        features: [
          "Complete store setup",
          "Product photography",
          "SEO optimization",
          "Launch promotion",
        ],
      },
    ],
    donations: [
      {
        title: "Feed 100 Children",
        description: "Provide meals for a week",
        amount: 500,
        features: [
          "Tax-deductible",
          "Impact report",
          "Donor certificate",
          "Monthly updates",
        ],
      },
      {
        title: "Build a School",
        description: "Contribute to educational infrastructure",
        amount: 5000,
        features: [
          "Named recognition",
          "Annual impact report",
          "School visit access",
          "Certificate of honor",
        ],
      },
      {
        title: "Monthly Supporter",
        description: "Recurring support for our cause",
        amount: 25,
        features: [
          "Monthly donation",
          "Exclusive updates",
          "Impact tracking",
          "Community membership",
        ],
      },
    ],
    gaming: [
      {
        title: "Battle Pass - Season 5",
        description: "Unlock exclusive cosmetics and rewards",
        amount: 12,
        features: [
          "100 battle pass tiers",
          "Exclusive skins",
          "Free monthly rewards",
          "XP boost",
        ],
      },
      {
        title: "Premium Currency Pack",
        description: "5000 premium coins for in-game purchases",
        amount: 50,
        features: [
          "5000 premium coins",
          "Instant delivery",
          "30% bonus coins",
          "Exclusive cosmetics",
        ],
      },
      {
        title: "Founder's Edition",
        description: "Lifetime premium access and exclusive items",
        amount: 200,
        features: [
          "Lifetime premium status",
          "Exclusive founder items",
          "Monthly bonus coins",
          "Priority matchmaking",
        ],
      },
    ],
    education: [
      {
        title: "Complete Python Bootcamp",
        description: "12-week intensive Python programming course",
        amount: 499,
        features: [
          "Live weekly sessions",
          "Career support",
          "Job guarantee",
          "Lifetime access",
        ],
      },
      {
        title: "Advanced JavaScript Course",
        description: "Master modern JavaScript and React",
        amount: 199,
        features: [
          "20+ hours of content",
          "Weekly live Q&A",
          "Certificate of completion",
          "Lifetime updates",
        ],
      },
      {
        title: "MBA Specialization",
        description: "4-month intensive business program",
        amount: 1999,
        features: [
          "Industry mentorship",
          "Project portfolio",
          "Career services",
          "Placement assistance",
        ],
      },
    ],
  };

  const currentCategory = categories.find((c) => c.id === selectedCategory);
  const examples = checkoutExamples[selectedCategory] || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="py-16 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                Demo Payment Links
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Create & Share <span className="text-gradient">Payment Checkouts</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Generate shareable payment links and QR codes for your demos. No account needed.
                Perfect for showcasing your product's checkout experience.
              </p>

              {/* Quick Features */}
              <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <Copy className="w-4 h-4 text-primary" />
                  <span>Copy & Share Links</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm">
                  <QrCode className="w-4 h-4 text-primary" />
                  <span>Generate QR Codes</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm">
                  <Share2 className="w-4 h-4 text-primary" />
                  <span>Share Instantly</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Category Selector */}
        <section className="py-12 bg-secondary/30">
          <div className="container mx-auto px-6">
            <h2 className="text-2xl font-bold mb-6 text-center">Select Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 max-w-6xl mx-auto">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    className="h-auto flex flex-col items-center gap-2 py-4"
                    onClick={() =>
                      setSelectedCategory(
                        category.id as typeof selectedCategory
                      )
                    }
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs text-center">{category.name}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Category Description */}
        {currentCategory && (
          <section className="py-12">
            <div className="container mx-auto px-6">
              <div className="max-w-4xl mx-auto">
                <Card className={`bg-gradient-to-br ${currentCategory.color} text-white border-0`}>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                        <currentCategory.icon className="w-8 h-8" />
                      </div>
                      <div>
                        <CardTitle className="text-3xl text-white">
                          {currentCategory.name}
                        </CardTitle>
                        <CardDescription className="text-white/80">
                          {currentCategory.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </section>
        )}

        {/* Examples Grid */}
        <section className="py-12">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold mb-8 text-center">
              {currentCategory?.name} Checkout Examples
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {examples.map((example, idx) => (
                <DemoCheckoutLink
                  key={idx}
                  title={example.title}
                  description={example.description}
                  amount={example.amount}
                  category={selectedCategory}
                  icon={<ShoppingCart className="w-5 h-5" />}
                  gradient={currentCategory?.color}
                  features={example.features}
                />
              ))}
            </div>
          </div>
        </section>

        {/* How to Use */}
        <section className="py-20 bg-secondary/30">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-12 text-center">How to Use</h2>
              <div className="space-y-8">
                {[
                  {
                    step: "1",
                    title: "Select a Checkout",
                    description: "Choose an example above or customize the amount and details.",
                  },
                  {
                    step: "2",
                    title: "Generate QR Code",
                    description: "Click the QR button to generate a scannable code for your checkout.",
                  },
                  {
                    step: "3",
                    title: "Copy or Share",
                    description: "Copy the link to share via email, messaging apps, or social media.",
                  },
                  {
                    step: "4",
                    title: "Track Results",
                    description: "Share with your audience and track conversion rates from the dashboard.",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-6 items-start">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
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
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl p-12">
              <h2 className="text-3xl font-bold mb-4">Ready to Create Your Payment Links?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Create unlimited payment links and demos with our payment link builder.
              </p>
              <Button size="lg" asChild className="text-lg px-8 py-6">
                <a href="/auth">
                  Create Payment Links
                  <ArrowRight className="ml-2 w-5 h-5" />
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
