import { Link } from 'react-router-dom';
import { ArrowLeft, Users, Target, Award, Heart, Zap, Lock, Globe, Code } from 'lucide-react';
import dropPayLogo from '@/assets/droppay-logo.png';

export default function About() {
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

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-background py-16 border-b border-border">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-foreground mb-4">About DropPay</h1>
            <p className="text-xl text-muted-foreground">
              Building the universal Pi Network payments layer for apps, sites, and stores everywhere—secure, fast, and Pi-native from day one.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto space-y-16">

          {/* Mission Section */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Our Mission</h2>
            </div>
            <p className="text-muted-foreground text-lg leading-relaxed space-y-3">
              <span className="block">DropPay’s mission is to be the trusted Pi Network payment processor for every channel—apps, websites, online stores, and connected experiences. We remove friction so builders can launch and scale with Pi-native checkout in minutes.</span>
              <span className="block">We focus on reliability, security, and compliance-first patterns, letting you accept real Pi on mainnet without card rails, FX markups, or hidden fees.</span>
            </p>
          </section>

          {/* Vision Section */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Our Vision</h2>
            </div>
            <p className="text-muted-foreground text-lg leading-relaxed space-y-3">
              <span className="block">We’re building for the Open Network future: DropPay as the gateway that bridges Pi mainnet to every digital surface—mobile apps, web, kiosks, and marketplaces.</span>
              <span className="block">As Pi moves toward open mainnet and mass adoption, DropPay will provide the connective tissue: secure auth, seamless payments, and merchant tooling that scales from solo creators to global platforms.</span>
            </p>
          </section>

          {/* Why DropPay */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Why DropPay</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
                <h3 className="font-semibold text-foreground mb-2">The Problem</h3>
                <p className="text-sm text-muted-foreground">Traditional payment stacks depend on card rails, add fixed fees, slow settlements, and create friction. Crypto rails often add gas volatility.</p>
              </div>
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <h3 className="font-semibold text-foreground mb-2">The Pi-Native Solution</h3>
                <p className="text-sm text-muted-foreground">DropPay uses Pi directly—no card networks, no FX markups, no gas spikes. Users pay in Pi; merchants receive Pi instantly with predictable 2% fees.</p>
              </div>
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
                <h3 className="font-semibold text-foreground mb-2">What You Get</h3>
                <p className="text-sm text-muted-foreground">Mainnet Pi payments, compliant auth, fast settlement, transparent pricing, and tooling that plugs into apps, sites, and stores.</p>
              </div>
            </div>
          </section>

          {/* Divider */}
          <div className="border-t border-border" />

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Architecture at a Glance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-border bg-card/50">
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Client</h3>
                    <p className="text-sm text-muted-foreground">Pi Browser + JS SDK (v2.0), `Pi.authenticate`, `Pi.createPayment`, `Pi.Ads` for rewarded engagement.</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border border-border bg-card/50">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Edge</h3>
                    <p className="text-sm text-muted-foreground">Supabase functions for approve/complete with `Authorization: Key` to Pi API v2.</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border border-border bg-card/50">
                <div className="flex items-start gap-3">
                  <Code className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Data</h3>
                    <p className="text-sm text-muted-foreground">Supabase DB for merchants, links, transactions, subscriptions; storage for digital deliveries.</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border border-border bg-card/50">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Verification</h3>
                    <p className="text-sm text-muted-foreground">Blockchain verification (`/verify-payment`) to confirm txid on Pi mainnet.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Divider */}
          <div className="border-t border-border" />

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Trust, Security, and Compliance</h2>
            <div className="p-6 rounded-lg border border-border bg-card/50">
            <ul className="space-y-3 text-muted-foreground leading-relaxed">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span>Pi-native auth with required scopes (`username`, `payments`, `wallet_address`); tokens not stored beyond session needs.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span>Edge functions use server-held `PI_API_KEY` with `Authorization: Key` per Pi docs; no secrets on client.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span>Payments approved and completed server-side; txid verified against Pi blockchain for integrity.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span>Clear fees: 2% paid by the customer at checkout; merchants receive full listed Pi amount.</span>
              </li>
            </ul>
            </div>
          </section>

          {/* Divider */}
          <div className="border-t border-border" />

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">What DropPay Enables</h2>
            <div className="p-6 rounded-lg border border-border bg-card/50">
            <ul className="space-y-3 text-muted-foreground leading-relaxed">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span>Pi checkouts for apps, web stores, link-in-bio, and marketplaces.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span>Instant Pi settlements without card rails or FX drag.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span>Rewarded Pi ads (where supported) to boost engagement and offset costs.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span>Subscriptions and digital delivery via payment links and checkout links.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span>Merchant analytics, conversion tracking, and webhook/API connectivity.</span>
              </li>
            </ul>
            </div>
          </section>

          {/* Divider */}
          <div className="border-t border-border" />

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Roadmap Toward Open Mainnet</h2>
            <div className="p-6 rounded-lg border border-border bg-card/50">
            <ul className="space-y-3 text-muted-foreground leading-relaxed">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span>Deeper SDK integrations as Pi opens more capabilities (app-to-user flows, expanded features).</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span>Additional verification and reconciliation tooling for high-volume merchants.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span>Richer developer surfaces: webhooks, dashboards, and test harnesses for Pi Browser.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span>Globalization: localized flows, multi-language UI, and regional compliance guidance.</span>
              </li>
            </ul>
            </div>
          </section>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Values Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Heart className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Our Values</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-lg border border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors">
                <h3 className="font-semibold text-foreground mb-2">Simplicity</h3>
                <p className="text-muted-foreground">
                  We make complex blockchain technology simple and accessible for everyone.
                </p>
              </div>
              <div className="p-6 rounded-lg border border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors">
                <h3 className="font-semibold text-foreground mb-2">Security</h3>
                <p className="text-muted-foreground">
                  Your data and transactions are protected with industry-leading security measures.
                </p>
              </div>
              <div className="p-6 rounded-lg border border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors">
                <h3 className="font-semibold text-foreground mb-2">Innovation</h3>
                <p className="text-muted-foreground">
                  We continuously evolve our platform to meet the needs of modern businesses.
                </p>
              </div>
              <div className="p-6 rounded-lg border border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors">
                <h3 className="font-semibold text-foreground mb-2">Transparency</h3>
                <p className="text-muted-foreground">
                  Clear pricing, honest communication, and no hidden fees.
                </p>
              </div>
            </div>
          </section>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Team Section */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Our Organization</h2>
            </div>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6 space-y-3">
              <span className="block">DropPay is built by the Mrwain Organization, a Pi-first collective focused on utility, adoption, and trusted infrastructure.</span>
              <span className="block">We align with Pi Network’s vision to empower global commerce and community apps with native Pi payments, keeping experiences simple while honoring Pi’s security and compliance standards.</span>
            </p>
            <div className="p-6 rounded-lg bg-secondary/50 border border-border">
              <h3 className="font-semibold text-foreground mb-3">Mrwain Organization Products</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span><strong className="text-foreground">DropPay</strong> - Pi Network payment gateway and processor for apps, sites, and stores</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span><strong className="text-foreground">Droplink</strong> - URL and connectivity layer for growth and routing</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span><strong className="text-foreground">Dropstore</strong> - Pi-native digital marketplace</span>
                </li>
              </ul>
            </div>
          </section>

          <div className="border-t border-border pt-12" />
          <div className="p-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20 text-center">
            <p className="text-muted-foreground mb-4">
              Ready to start accepting Pi payments?
            </p>
            <Link 
              to="/auth" 
              className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
