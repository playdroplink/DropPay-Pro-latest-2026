import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is DropPay?",
    answer: "DropPay is a payment gateway that allows you to accept Pi cryptocurrency payments on your website, app, or online store. Create payment links, integrate with our API, or use our widgets to start accepting Pi payments instantly."
  },
  {
    question: "How do I get started?",
    answer: "Simply sign up with your Pi Network account, create your first payment link, and share it with your customers. You can also integrate our API or embed widgets on your website for a seamless checkout experience."
  },
  {
    question: "What are the fees?",
    answer: "DropPay offers flexible pricing plans. The Free plan includes 1 payment link with basic features. Pro plan (π 10/month) offers unlimited links with 0.5% platform fee (for maintenance & future features). Enterprise plan (π 50/month) provides 0% platform fees and advanced features."
  },
  {
    question: "How do I receive payments?",
    answer: "All payments go directly to your Pi wallet address. You can track all transactions in your dashboard and request withdrawals anytime. We verify all payments on the Pi blockchain for security."
  },
  {
    question: "Is it secure?",
    answer: "Yes! All payments are verified on the Pi blockchain. We use secure authentication through Pi Network's official SDK, and all transactions are recorded with blockchain verification for maximum security and transparency."
  },
  {
    question: "Can I use DropPay on mobile?",
    answer: "Yes! DropPay works perfectly in the Pi Browser app on mobile devices. Your customers can make payments directly from their Pi mobile app, and you can manage your dashboard from any device."
  },
  {
    question: "What types of payments can I accept?",
    answer: "DropPay supports various payment types: one-time payments, recurring subscriptions, checkout forms with custom questions, donations with suggested amounts, and even free products with access control."
  },
  {
    question: "Do I need coding knowledge?",
    answer: "Not at all! You can create payment links without any coding. However, we also provide a powerful API and embeddable widgets for developers who want deeper integration with their applications."
  },
  {
    question: "Can I customize my payment pages?",
    answer: "Yes! Add your business name, logo, custom descriptions, redirect URLs, and even upload digital content for automatic delivery after payment. You can also add custom questions to collect information during checkout."
  },
  {
    question: "What happens if a payment fails?",
    answer: "If a payment fails, your customer will be notified immediately. They can retry the payment, and you'll see the failed transaction in your dashboard. All blockchain-verified payments are final and cannot be disputed."
  },
  {
    question: "How do withdrawals work?",
    answer: "You can request withdrawals from your available balance at any time. Withdrawals are processed to your registered Pi wallet address. Track all withdrawal requests in your dashboard, and administrators approve them after verification."
  },
  {
    question: "Is there a transaction limit?",
    answer: "The Free plan limits each payment link to 3 completed transactions. Pro and Enterprise plans offer unlimited transactions. You can upgrade at any time to remove these limits."
  }
];

export function FAQ() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about DropPay and Pi payments
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-border rounded-lg px-6 bg-card hover:shadow-md transition-shadow"
            >
              <AccordionTrigger className="text-left hover:no-underline py-5">
                <span className="font-semibold text-foreground pr-4">
                  {faq.question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 text-center p-6 rounded-lg bg-primary/5 border border-primary/10">
          <p className="text-foreground mb-2">Still have questions?</p>
          <p className="text-muted-foreground text-sm mb-4">
            We're here to help! Reach out to our support team for assistance.
          </p>
          <a
            href="mailto:support@droppay.space"
            className="text-primary hover:underline font-medium"
          >
            support@droppay.space
          </a>
        </div>
      </div>
    </section>
  );
}
