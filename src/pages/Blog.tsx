import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, TrendingUp, Zap, MessageSquare } from 'lucide-react';
import dropPayLogo from '@/assets/droppay-logo.png';

const blogPosts = [
  {
    id: 1,
    title: 'Introducing DropPay: The Future of Pi Payments',
    excerpt: 'Learn how DropPay is revolutionizing the way businesses accept Pi Network payments with our simple, secure platform.',
    date: 'December 20, 2025',
    author: 'Mrwain Team',
    category: 'Product',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80',
  },
  {
    id: 2,
    title: 'Getting Started with Pi Network Payments',
    excerpt: 'A comprehensive guide to integrating Pi Network payments into your application using DropPay API.',
    date: 'December 18, 2025',
    author: 'Development Team',
    category: 'Tutorial',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
  },
  {
    id: 3,
    title: 'Security Best Practices for Payment Integration',
    excerpt: 'Essential security measures every merchant should implement when accepting cryptocurrency payments.',
    date: 'December 15, 2025',
    author: 'Security Team',
    category: 'Security',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80',
  },
  {
    id: 4,
    title: 'Announcing New Features: Webhooks & Analytics',
    excerpt: 'Discover our latest features that help you track and manage your Pi Network transactions more effectively.',
    date: 'December 10, 2025',
    author: 'Product Team',
    category: 'Product',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
  },
  {
    id: 5,
    title: 'The Rise of Pi Network: What Merchants Need to Know',
    excerpt: 'Understanding the Pi Network ecosystem and why it matters for your business.',
    date: 'December 5, 2025',
    author: 'Mrwain Team',
    category: 'Industry',
    image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&q=80',
  },
  {
    id: 6,
    title: 'Case Study: How Businesses Are Thriving with DropPay',
    excerpt: 'Real success stories from merchants who integrated Pi Network payments into their platforms.',
    date: 'December 1, 2025',
    author: 'Marketing Team',
    category: 'Case Study',
    image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80',
  },
];

export default function Blog() {
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
            <h1 className="text-4xl font-bold text-foreground mb-4">DropPay Blog</h1>
            <p className="text-xl text-muted-foreground">
              Updates, tutorials, and insights about Pi Network payments
            </p>
          </div>

          {/* Featured Post */}
          <div className="mb-12">
            <div className="relative h-96 rounded-2xl overflow-hidden group cursor-pointer">
              <img 
                src={blogPosts[0].image} 
                alt={blogPosts[0].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-center gap-4 mb-4">
                  <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    Featured
                  </span>
                  <span className="text-muted-foreground text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {blogPosts[0].date}
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-3">
                  {blogPosts[0].title}
                </h2>
                <p className="text-muted-foreground mb-4">
                  {blogPosts[0].excerpt}
                </p>
                <button className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                  Read More
                </button>
              </div>
            </div>
          </div>

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.slice(1).map((post) => (
              <div 
                key={post.id} 
                className="group cursor-pointer rounded-xl overflow-hidden border border-border bg-card hover:shadow-lg transition-all"
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-background/90 backdrop-blur text-foreground text-xs font-medium">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar className="w-4 h-4" />
                    {post.date}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">By {post.author}</span>
                    <ArrowLeft className="w-4 h-4 rotate-180 text-primary" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Newsletter Section */}
          <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
            <div className="max-w-2xl mx-auto text-center">
              <MessageSquare className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Stay Updated
              </h2>
              <p className="text-muted-foreground mb-6">
                Subscribe to our newsletter for the latest updates, tutorials, and Pi Network insights.
              </p>
              <div className="flex gap-3 max-w-md mx-auto">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:border-primary"
                />
                <button className="px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
