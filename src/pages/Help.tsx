import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Link2,
  History,
  Wallet,
  Play,
  Crown,
  Code2,
  Code,
  Settings,
  CreditCard,
  Gift,
  RefreshCw,
  ShoppingCart,
  FileText,
  Video,
  Zap,
  BookOpen,
} from 'lucide-react';

export default function Help() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Help & Tutorials</h1>
          </div>
          <p className="text-muted-foreground">
            Learn how to use all DropPay features to accept Pi payments and grow your business
          </p>
        </div>

        {/* Quick Start Guide */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Quick Start Guide
            </CardTitle>
            <CardDescription>Get started with DropPay in 3 simple steps</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg bg-background border border-border">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mb-3">
                  1
                </div>
                <h3 className="font-semibold mb-2">Create Payment Link</h3>
                <p className="text-sm text-muted-foreground">
                  Go to Payment Links and create your first link with a title and amount
                </p>
              </div>
              <div className="p-4 rounded-lg bg-background border border-border">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mb-3">
                  2
                </div>
                <h3 className="font-semibold mb-2">Share with Customers</h3>
                <p className="text-sm text-muted-foreground">
                  Copy your payment link and share it with customers via social media, email, or QR code
                </p>
              </div>
              <div className="p-4 rounded-lg bg-background border border-border">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mb-3">
                  3
                </div>
                <h3 className="font-semibold mb-2">Receive Payments</h3>
                <p className="text-sm text-muted-foreground">
                  Track payments in Transactions and withdraw to your Pi wallet anytime
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Tutorials */}
        <Tabs defaultValue="payment-links" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-2 h-auto">
            <TabsTrigger value="payment-links" className="gap-2">
              <Link2 className="w-4 h-4" />
              <span className="hidden sm:inline">Payment Links</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="gap-2">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Transactions</span>
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="gap-2">
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">Withdrawals</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="gap-2">
              <Code className="w-4 h-4" />
              <span className="hidden sm:inline">Advanced</span>
            </TabsTrigger>
          </TabsList>

          {/* Payment Links Tutorial */}
          <TabsContent value="payment-links" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Creating Payment Links</CardTitle>
                <CardDescription>Learn how to create and customize payment links</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Payment Types
                  </h3>
                  <div className="space-y-3">
                    <div className="p-4 rounded-lg border border-border">
                      <div className="flex items-start gap-3">
                        <Badge variant="default">One-Time</Badge>
                        <div>
                          <p className="font-medium mb-1">Single Payment</p>
                          <p className="text-sm text-muted-foreground">
                            Best for selling products, services, or accepting one-time donations. Customer pays once and transaction is complete.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg border border-border">
                      <div className="flex items-start gap-3">
                        <Badge variant="default">Recurring</Badge>
                        <div>
                          <p className="font-medium mb-1">Subscription Payment</p>
                          <p className="text-sm text-muted-foreground">
                            Perfect for memberships, subscriptions, or recurring services. Set up automatic recurring payments.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg border border-border">
                      <div className="flex items-start gap-3">
                        <Badge variant="default">Checkout</Badge>
                        <div>
                          <p className="font-medium mb-1">Advanced Checkout</p>
                          <p className="text-sm text-muted-foreground">
                            Collect custom information during checkout with questions, manage stock, and enable waitlists.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-primary" />
                    Pricing Types
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="p-4 rounded-lg border border-border">
                      <p className="font-medium mb-1">Free</p>
                      <p className="text-sm text-muted-foreground">
                        Offer free content or services. Great for lead magnets, free trials, or giveaways.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border border-border">
                      <p className="font-medium mb-1">Fixed Price</p>
                      <p className="text-sm text-muted-foreground">
                        Set a specific amount. Standard pricing for products and services.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border border-border">
                      <p className="font-medium mb-1">Donation</p>
                      <p className="text-sm text-muted-foreground">
                        Let customers choose their amount. Add suggested amounts for guidance.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border border-border">
                      <p className="font-medium mb-1">Digital Content</p>
                      <p className="text-sm text-muted-foreground">
                        Upload files that are automatically sent to customers after payment.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">Step-by-Step Guide</h3>
                  <ol className="space-y-3 list-decimal list-inside text-muted-foreground">
                    <li>Click "Create Link" button in Payment Links page</li>
                    <li>Choose your pricing type (Free, One-Time, Recurring, or Donation)</li>
                    <li>Enter a title and description for your payment link</li>
                    <li>Set the amount (if not free or donation)</li>
                    <li>Optional: Upload a file for digital content delivery</li>
                    <li>Optional: Add custom questions for checkout</li>
                    <li>Optional: Set stock limits or enable waitlist</li>
                    <li>Click "Create Link" to generate your unique payment URL</li>
                    <li>Copy the link or QR code to share with customers</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tutorial */}
          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Managing Transactions</CardTitle>
                <CardDescription>Track and manage all your payment transactions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">Transaction Statuses</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                      <Badge className="bg-yellow-500">Pending</Badge>
                      <p className="text-sm text-muted-foreground">
                        Payment initiated but not yet completed on blockchain
                      </p>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                      <Badge className="bg-green-500">Completed</Badge>
                      <p className="text-sm text-muted-foreground">
                        Payment verified on Pi blockchain, funds available for withdrawal
                      </p>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                      <Badge className="bg-red-500">Failed</Badge>
                      <p className="text-sm text-muted-foreground">
                        Payment failed or was cancelled by the customer
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">What You Can Do</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>View all payment transactions in real-time</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Filter by status, date, or payment link</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>See customer Pi usernames and transaction IDs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Verify transactions on Pi blockchain</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Export transaction data for accounting</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Track total revenue and transaction count</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Withdrawals Tutorial */}
          <TabsContent value="withdrawals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Withdrawing Your Funds</CardTitle>
                <CardDescription>Learn how to withdraw Pi to your wallet</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">How Withdrawals Work</h3>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                      <p className="text-sm text-muted-foreground">
                        When customers pay you, the Pi goes directly to DropPay's secure wallet. You can request withdrawals at any time, and we'll transfer the funds to your registered Pi wallet address after verification.
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                          1
                        </div>
                        <div>
                          <p className="font-medium mb-1">Check Available Balance</p>
                          <p className="text-sm text-muted-foreground">
                            View your current balance from completed transactions in the Withdrawals page
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                          2
                        </div>
                        <div>
                          <p className="font-medium mb-1">Request Withdrawal</p>
                          <p className="text-sm text-muted-foreground">
                            Enter the amount you want to withdraw (minimum: π 1.0)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                          3
                        </div>
                        <div>
                          <p className="font-medium mb-1">Admin Approval</p>
                          <p className="text-sm text-muted-foreground">
                            Your request is reviewed and approved by administrators (usually within 24 hours)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                          4
                        </div>
                        <div>
                          <p className="font-medium mb-1">Receive Pi</p>
                          <p className="text-sm text-muted-foreground">
                            Funds are transferred to your registered Pi wallet address
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                    Important Notes:
                  </p>
                  <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                    <li>• Minimum withdrawal: π 1.0</li>
                    <li>• Make sure your Pi wallet address is correct in Settings</li>
                    <li>• Withdrawals are processed manually for security</li>
                    <li>• Track all withdrawal requests and status in the Withdrawals page</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5 text-primary" />
                  Watch Ads & Earn
                </CardTitle>
                <CardDescription>Earn extra Pi by watching video ads</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  DropPay offers an additional way to earn Pi through the Pi Ad Network. Watch short video ads and earn rewards that are added to your balance.
                </p>
                <div>
                  <h4 className="font-semibold mb-2">How it works:</h4>
                  <ol className="space-y-2 list-decimal list-inside text-muted-foreground">
                    <li>Navigate to "Watch Ads & Earn" in the dashboard menu</li>
                    <li>Make sure you're in Pi Browser (ads only work in official Pi app)</li>
                    <li>Click "Watch Ad & Earn" button when ads are available</li>
                    <li>Watch the complete ad (usually 15-30 seconds)</li>
                    <li>Earn π 0.001 - π 0.01 per ad (verified on blockchain)</li>
                    <li>Rewards are added to your balance instantly</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Features Tutorial */}
          <TabsContent value="advanced" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-primary" />
                  Subscription Plans
                </CardTitle>
                <CardDescription>Upgrade your account for more features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 rounded-lg border border-border">
                    <h4 className="font-semibold mb-2">Free Plan</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• 1 payment link</li>
                      <li>• 3 transactions per link</li>
                      <li>• Basic features</li>
                      <li>• Perfect for testing</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg border-2 border-primary bg-primary/5">
                    <Badge className="mb-2">Most Popular</Badge>
                    <h4 className="font-semibold mb-2">Pro Plan - π 10/month</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Unlimited payment links</li>
                      <li>• Unlimited transactions</li>
                      <li>• 0.5% platform fee (for maintenance & future features)</li>
                      <li>• Advanced analytics</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg border border-border">
                    <h4 className="font-semibold mb-2">Enterprise - π 50/month</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Everything in Pro</li>
                      <li>• 0% platform fee</li>
                      <li>• Priority support</li>
                      <li>• Custom integrations</li>
                    </ul>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Visit "Subscription Plan" in the dashboard to upgrade. Payments are processed securely through Pi Network.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-primary" />
                  Widgets & Embeds
                </CardTitle>
                <CardDescription>Add payment buttons to your website</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Embed DropPay payment buttons directly on your website or blog for a seamless checkout experience.
                </p>
                <div>
                  <h4 className="font-semibold mb-2">Available Widget Types:</h4>
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg border border-border">
                      <p className="font-medium">Payment Button</p>
                      <p className="text-sm text-muted-foreground">
                        Add a "Pay with Pi" button anywhere on your site
                      </p>
                    </div>
                    <div className="p-3 rounded-lg border border-border">
                      <p className="font-medium">Donation Widget</p>
                      <p className="text-sm text-muted-foreground">
                        Embed a donation form with suggested amounts
                      </p>
                    </div>
                    <div className="p-3 rounded-lg border border-border">
                      <p className="font-medium">Checkout Modal</p>
                      <p className="text-sm text-muted-foreground">
                        Full checkout experience in a popup modal
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm font-medium mb-2">How to embed:</p>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Go to "Widgets & Embeds" page</li>
                    <li>Select your payment link</li>
                    <li>Choose widget style and customize colors</li>
                    <li>Copy the generated HTML/JavaScript code</li>
                    <li>Paste it anywhere on your website</li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-primary" />
                  API & Webhooks
                </CardTitle>
                <CardDescription>Integrate DropPay into your applications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  For developers: Use our REST API to create payments, check status, and receive real-time notifications via webhooks.
                </p>
                <div>
                  <h4 className="font-semibold mb-2">Getting Started:</h4>
                  <ol className="space-y-2 list-decimal list-inside text-muted-foreground">
                    <li>Navigate to "API & Webhooks" in dashboard</li>
                    <li>Generate your API key (keep it secure!)</li>
                    <li>Add webhook URL for payment notifications</li>
                    <li>Use API endpoints to create payments programmatically</li>
                    <li>Receive webhooks when payments are completed</li>
                  </ol>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm font-medium mb-2">Key Features:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• RESTful API with JSON responses</li>
                    <li>• Secure API key authentication</li>
                    <li>• Real-time webhook notifications</li>
                    <li>• Complete API documentation</li>
                    <li>• Test mode for development</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  Settings
                </CardTitle>
                <CardDescription>Customize your account preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 rounded-lg border border-border">
                    <p className="font-medium mb-1">Business Information</p>
                    <p className="text-sm text-muted-foreground">
                      Update your business name and logo (shown on payment pages)
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border border-border">
                    <p className="font-medium mb-1">Pi Wallet Address</p>
                    <p className="text-sm text-muted-foreground">
                      Set the wallet address where you want to receive withdrawals
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border border-border">
                    <p className="font-medium mb-1">Notification Preferences</p>
                    <p className="text-sm text-muted-foreground">
                      Choose which email notifications you want to receive
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border border-border">
                    <p className="font-medium mb-1">Security Settings</p>
                    <p className="text-sm text-muted-foreground">
                      Manage your account security and authentication preferences
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Support Section */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Need More Help?</CardTitle>
            <CardDescription>We're here to assist you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                <FileText className="w-8 h-8 text-primary mb-3" />
                <h4 className="font-semibold mb-2">Documentation</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Visit our complete API documentation and developer guides
                </p>
                <a href="/docs" className="text-sm text-primary hover:underline">
                  View Documentation →
                </a>
              </div>
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                <Video className="w-8 h-8 text-primary mb-3" />
                <h4 className="font-semibold mb-2">Video Tutorials</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Watch step-by-step video guides on YouTube
                </p>
                <a
                  href="https://youtube.com/@droppay"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Watch Tutorials →
                </a>
              </div>
            </div>
            <div className="p-6 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 text-center">
              <p className="font-medium mb-2">Still have questions?</p>
              <p className="text-sm text-muted-foreground mb-4">
                Contact our support team for personalized assistance
              </p>
              <a
                href="mailto:support@droppay.space"
                className="inline-block px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Contact Support
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
