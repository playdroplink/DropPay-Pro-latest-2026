import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export default function TrackRedirect() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      handleTracking();
    }
  }, [slug]);

  const handleTracking = async () => {
    try {
      // Get tracking link
      const { data: trackingLink, error: linkError } = await (supabase as any)
        .from('tracking_links')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (linkError || !trackingLink) {
        setError('Tracking link not found');
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      // Increment visit count
      await (supabase as any).rpc('increment_tracking_visits', { link_id: trackingLink.id });

      // Log tracking event
      const userAgent = navigator.userAgent;
      const deviceType = /mobile/i.test(userAgent) ? 'mobile' : /tablet/i.test(userAgent) ? 'tablet' : 'desktop';

      await (supabase as any).from('tracking_events').insert({
        tracking_link_id: trackingLink.id,
        event_type: 'visit',
        user_agent: userAgent,
        device_type: deviceType,
        referrer: document.referrer || null,
      });

      // Redirect to destination
      window.location.href = (trackingLink as any).destination_url;
    } catch (error) {
      console.error('Error handling tracking:', error);
      setError('An error occurred');
      setTimeout(() => navigate('/'), 3000);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive mb-2">{error}</p>
          <p className="text-muted-foreground text-sm">Redirecting to homepage...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
