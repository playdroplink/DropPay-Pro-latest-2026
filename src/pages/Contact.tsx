import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MessageSquare, MapPin, Phone, Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import dropPayLogo from '@/assets/droppay-logo.png';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success('Message sent successfully! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
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
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Get in Touch</h1>
            <p className="text-xl text-muted-foreground">
              Have questions? We'd love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Contact Information Cards */}
            <div className="p-6 rounded-xl border border-border bg-card hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Email Us</h3>
              <p className="text-muted-foreground text-sm mb-3">
                Send us an email and we'll respond within 24 hours.
              </p>
              <a href="mailto:support@droppay.space" className="text-primary hover:underline text-sm">
                support@droppay.space
              </a>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Live Chat</h3>
              <p className="text-muted-foreground text-sm mb-3">
                Chat with our support team in real-time.
              </p>
              <button className="text-primary hover:underline text-sm">
                Start a conversation
              </button>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Support Hours</h3>
              <p className="text-muted-foreground text-sm mb-3">
                Monday - Friday: 9AM - 6PM EST
                <br />
                Weekend: Limited support
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder="How can we help?"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more about your inquiry..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="mt-2 min-h-[150px]"
                  />
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? (
                    <>Sending...</>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Additional Information */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Other Ways to Reach Us</h2>
              
              <div className="space-y-6">
                <div className="p-6 rounded-xl bg-secondary/50 border border-border">
                  <h3 className="font-semibold text-foreground mb-3">Documentation</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Find answers to common questions in our comprehensive documentation.
                  </p>
                  <Link to="/docs" className="text-primary hover:underline text-sm">
                    View Documentation →
                  </Link>
                </div>

                <div className="p-6 rounded-xl bg-secondary/50 border border-border">
                  <h3 className="font-semibold text-foreground mb-3">Sales Inquiries</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Interested in Enterprise plans or custom solutions?
                  </p>
                  <a href="mailto:sales@droppay.space" className="text-primary hover:underline text-sm">
                    sales@droppay.space
                  </a>
                </div>

                <div className="p-6 rounded-xl bg-secondary/50 border border-border">
                  <h3 className="font-semibold text-foreground mb-3">Partnership Opportunities</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Want to partner with DropPay? Let's talk!
                  </p>
                  <a href="mailto:partnerships@droppay.space" className="text-primary hover:underline text-sm">
                    partnerships@droppay.space
                  </a>
                </div>

                <div className="p-6 rounded-xl bg-secondary/50 border border-border">
                  <h3 className="font-semibold text-foreground mb-3">Mrwain Organization</h3>
                  <p className="text-muted-foreground text-sm">
                    DropPay is powered by Droplink and Dropstore under Mrwain Organization. 
                    Building the future of Pi Network ecosystem together.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
