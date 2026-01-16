import { supabase } from "./client";
import type { Database } from "./types";

type CheckoutLinkRow = Database['public']['Tables']['checkout_links']['Row'];
type CheckoutLinkInsert = Database['public']['Tables']['checkout_links']['Insert'];

export interface CheckoutLink extends CheckoutLinkRow {}

export interface CreateCheckoutLinkInput {
  title: string;
  description: string;
  category: CheckoutLink["category"];
  amount: number;
  currency: string;
  features: string[];
  qr_code_data?: string;
  expire_access?: string;
  stock?: number | null;
  show_on_store_page?: boolean;
  add_waitlist?: boolean;
  ask_questions?: boolean;
  internal_name?: string;
  redirect_after_checkout?: string;
  cancel_redirect_url?: string;
  checkout_image?: string;
}

/**
 * Generate a unique slug for checkout link
 */
export function generateSlug(category: string, title: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const titleSlug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 20);
  return `${category}-${titleSlug}-${timestamp}-${random}`;
}

/**
 * Create a new checkout link
 */
export async function createCheckoutLink(
  merchantId: string,
  data: CreateCheckoutLinkInput
): Promise<CheckoutLink> {
  const slug = generateSlug(data.category, data.title);

  const { data: checkoutLink, error } = await supabase
    .from('checkout_links')
    .insert({
      merchant_id: merchantId,
      title: data.title,
      description: data.description,
      category: data.category,
      slug,
      amount: data.amount,
      currency: data.currency,
      features: data.features,
      qr_code_data: data.qr_code_data,
      expire_access: data.expire_access || "never",
      stock: data.stock,
      show_on_store_page: data.show_on_store_page || false,
      add_waitlist: data.add_waitlist || false,
      ask_questions: data.ask_questions || false,
      internal_name: data.internal_name || "",
      redirect_after_checkout: data.redirect_after_checkout || "",
      cancel_redirect_url: data.cancel_redirect_url || "",
      checkout_image: data.checkout_image || null,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create checkout link: ${error.message}`);
  }

  return checkoutLink as CheckoutLink;
}

/**
 * Get all checkout links for a merchant
 */
export async function getMerchantCheckoutLinks(merchantId: string): Promise<CheckoutLink[]> {
  const { data, error } = await supabase
    .from('checkout_links')
    .select("*")
    .eq("merchant_id", merchantId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch checkout links: ${error.message}`);
  }

  return (data as CheckoutLink[]) || [];
}

/**
 * Get a single checkout link by ID
 */
export async function getCheckoutLinkById(linkId: string): Promise<CheckoutLink | null> {
  const { data, error } = await supabase
    .from('checkout_links')
    .select("*")
    .eq("id", linkId)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows returned
    throw new Error(`Failed to fetch checkout link: ${error.message}`);
  }

  return (data as CheckoutLink) || null;
}

/**
 * Get a checkout link by slug (for payment page)
 */
export async function getCheckoutLinkBySlug(slug: string): Promise<CheckoutLink | null> {
  const { data, error } = await supabase
    .from('checkout_links')
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to fetch checkout link: ${error.message}`);
  }

  return (data as CheckoutLink) || null;
}

/**
 * Update a checkout link
 */
export async function updateCheckoutLink(
  linkId: string,
  merchantId: string,
  data: Partial<CreateCheckoutLinkInput>
): Promise<CheckoutLink> {
  const { data: checkoutLink, error } = await supabase
    .from('checkout_links')
    .update({
      ...(data.title && { title: data.title }),
      ...(data.description && { description: data.description }),
      ...(data.category && { category: data.category }),
      ...(data.amount && { amount: data.amount }),
      ...(data.currency && { currency: data.currency }),
      ...(data.features && { features: data.features }),
      ...(data.qr_code_data && { qr_code_data: data.qr_code_data }),
    })
    .eq("id", linkId)
    .eq("merchant_id", merchantId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update checkout link: ${error.message}`);
  }

  return checkoutLink as CheckoutLink;
}

/**
 * Delete a checkout link
 */
export async function deleteCheckoutLink(linkId: string, merchantId: string): Promise<void> {
  const { error } = await supabase
    .from('checkout_links')
    .delete()
    .eq("id", linkId)
    .eq("merchant_id", merchantId);

  if (error) {
    throw new Error(`Failed to delete checkout link: ${error.message}`);
  }
}

/**
 * Toggle checkout link active status
 */
export async function toggleCheckoutLinkStatus(
  linkId: string,
  merchantId: string,
  isActive: boolean
): Promise<CheckoutLink> {
  const { data: checkoutLink, error } = await supabase
    .from('checkout_links')
    .update({ is_active: isActive })
    .eq("id", linkId)
    .eq("merchant_id", merchantId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update checkout link status: ${error.message}`);
  }

  return checkoutLink as CheckoutLink;
}

/**
 * Increment view count for a checkout link
 */
export async function incrementCheckoutLinkViews(slug: string): Promise<void> {
  const { error } = await supabase.rpc("increment_checkout_views", {
    p_slug: slug,
  });

  if (error) {
    console.error("Failed to increment views:", error);
  }
}

/**
 * Increment conversion count for a checkout link
 */
export async function incrementCheckoutLinkConversions(slug: string): Promise<void> {
  const { error } = await supabase.rpc("increment_checkout_conversions", {
    p_slug: slug,
  });

  if (error) {
    console.error("Failed to increment conversions:", error);
  }
}

/**
 * Get checkout links analytics for a merchant
 */
export async function getMerchantCheckoutLinksAnalytics(merchantId: string) {
  const { data, error } = await sb
    .from(ANALYTICS_VIEW)
    .select("*")
    .eq("merchant_id", merchantId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch analytics: ${error.message}`);
  }

  return data || [];
}

/**
 * Get checkout link statistics
 */
export async function getCheckoutLinkStats(slug: string): Promise<{
  views: number;
  conversions: number;
  conversionRate: number;
} | null> {
  const link = await getCheckoutLinkBySlug(slug);

  if (!link) {
    return null;
  }

  return {
    views: link.views,
    conversions: link.conversions,
    conversionRate: link.views > 0 ? (link.conversions / link.views) * 100 : 0,
  };
}

/**
 * Bulk export checkout links to CSV
 */
export async function exportCheckoutLinksToCSV(merchantId: string): Promise<string> {
  const links = await getMerchantCheckoutLinks(merchantId);

  const headers = [
    "Title",
    "Category",
    "Amount",
    "Currency",
    "Views",
    "Conversions",
    "Conversion Rate",
    "Link",
    "Created At",
  ];

  const rows = links.map((link) => [
    link.title,
    link.category,
    link.amount,
    link.currency,
    link.views,
    link.conversions,
    link.views > 0 ? ((link.conversions / link.views) * 100).toFixed(2) + "%" : "0%",
    `${window.location.origin}/pay/${link.slug}`,
    new Date(link.created_at).toLocaleDateString(),
  ]);

  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

  return csv;
}
