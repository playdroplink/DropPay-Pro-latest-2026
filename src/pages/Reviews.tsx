import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Star, Send, ThumbsUp, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Review {
  id: string;
  rating: number;
  feedback: string;
  email?: string;
  pi_username?: string;
  created_at: string;
}

export default function Reviews() {
  const { isAuthenticated, merchant } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setIsLoadingReviews(true);
      const { data, error } = await (supabase
        .from('reviews' as any)
        .select('*')
        .order('created_at', { ascending: false })) as any;

      if (error) {
        console.warn('Could not load reviews:', error.message);
        setReviews([]);
        return;
      }

      const reviews = (data || []) as Review[];
      setReviews(reviews);

      // Calculate stats
      if (reviews && reviews.length > 0) {
        const total = reviews.length;
        const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1);
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        
        reviews.forEach(r => {
          distribution[r.rating as keyof typeof distribution]++;
        });

        setStats({
          totalReviews: total,
          averageRating: parseFloat(avgRating as string),
          ratingDistribution: distribution
        });
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rating) {
      toast.error('Please select a rating');
      return;
    }

    if (!feedback.trim()) {
      toast.error('Please write some feedback');
      return;
    }

    if (feedback.trim().length < 10) {
      toast.error('Feedback must be at least 10 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData = {
        rating,
        feedback: feedback.trim(),
        email: email.trim() || null,
        pi_username: merchant?.pi_username || null,
        merchant_id: merchant?.id || null,
      };

      const { error } = await (supabase
        .from('reviews' as any)
        .insert(reviewData)) as any;

      if (error) throw error;

      toast.success('Thank you for your feedback! 🙏');
      
      // Reset form
      setRating(0);
      setFeedback('');
      setEmail('');

      // Refresh reviews
      await fetchReviews();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-500';
    if (rating === 3) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getRatingLabel = (rating: number) => {
    const labels: { [key: number]: string } = {
      5: 'Excellent',
      4: 'Good',
      3: 'Average',
      2: 'Poor',
      1: 'Very Poor'
    };
    return labels[rating] || '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-foreground">App Reviews & Feedback</h1>
          <p className="text-muted-foreground text-lg">
            Help us improve! Share your experience with DropPay
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Review Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-2xl">Rate DropPay</CardTitle>
                <CardDescription>Your feedback helps us improve</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitReview} className="space-y-6">
                  {/* Star Rating */}
                  <div className="space-y-2">
                    <Label>How would you rate us? *</Label>
                    <div className="flex gap-2 justify-center py-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-10 h-10 ${
                              (hoverRating || rating) >= star
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-muted-foreground'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    {rating > 0 && (
                      <p className="text-center text-sm text-muted-foreground">
                        {rating} star{rating !== 1 ? 's' : ''} - {getRatingLabel(rating)}
                      </p>
                    )}
                  </div>

                  {/* Feedback */}
                  <div className="space-y-2">
                    <Label htmlFor="feedback">Your Feedback *</Label>
                    <Textarea
                      id="feedback"
                      placeholder="Tell us what you think... (minimum 10 characters)"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="min-h-[120px] resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      {feedback.length}/500 characters
                    </p>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      We'll only use this to follow up on your feedback
                    </p>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isSubmitting || !rating || !feedback.trim()}
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>Submitting...</>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Review
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    {isAuthenticated && merchant
                      ? `Signed in as ${merchant.pi_username || 'User'}`
                      : 'Submit anonymously or sign in for better tracking'}
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right: Reviews & Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Statistics Card */}
            {stats.totalReviews > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Community Rating</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Average Rating */}
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-5xl font-bold text-amber-400">
                        {stats.averageRating.toFixed(1)}
                      </div>
                      <div className="flex gap-1 mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.round(stats.averageRating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-muted-foreground'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Rating Distribution */}
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="flex items-center gap-3">
                        <span className="text-sm font-medium w-12 text-right">
                          {star} <Star className="w-3 h-3 inline fill-amber-400 text-amber-400" />
                        </span>
                        <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-amber-400 h-full transition-all"
                            style={{
                              width: `${
                                stats.totalReviews > 0
                                  ? (stats.ratingDistribution[star as keyof typeof stats.ratingDistribution] /
                                      stats.totalReviews) *
                                    100
                                  : 0
                              }%`
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12">
                          {stats.ratingDistribution[star as keyof typeof stats.ratingDistribution]}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Recent Reviews</h2>

              {isLoadingReviews ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">Loading reviews...</p>
                  </CardContent>
                </Card>
              ) : reviews.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      No reviews yet. Be the first to share your feedback!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {reviews.map((review) => (
                    <Card key={review.id} className="overflow-hidden">
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          {/* Rating & Author */}
                          <div className="flex items-start justify-between">
                            <div className="flex gap-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-muted-foreground'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Rating Label */}
                          <div>
                            <Badge variant="outline">
                              <span className={getRatingColor(review.rating)}>
                                {getRatingLabel(review.rating)}
                              </span>
                            </Badge>
                          </div>

                          {/* Feedback */}
                          <p className="text-foreground leading-relaxed">
                            {review.feedback}
                          </p>

                          {/* Author */}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <ThumbsUp className="w-4 h-4" />
                            <span>
                              {review.pi_username
                                ? `By ${review.pi_username}`
                                : review.email
                                ? `By ${review.email}`
                                : 'Anonymous'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
