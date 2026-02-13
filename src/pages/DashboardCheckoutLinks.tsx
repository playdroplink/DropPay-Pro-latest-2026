import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  Edit2,
  Trash2,
  Copy,
  Share2,
  QrCode,
  MoreHorizontal,
  Plus,
  TrendingUp,
  Crown,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { getMerchantCheckoutLinks, deleteCheckoutLink } from "@/integrations/supabase/checkout_links";
import { buildCheckoutQr } from "@/lib/qr";

interface CheckoutLink {
  id: string;
  title: string;
  description: string;
  category: string;
  amount: number;
  currency: string;
  slug?: string;
  link?: string;
  createdAt?: string;
  conversions: number;
  views: number;
  isActive: boolean;
}

const CATEGORY_COLORS = {
  ecommerce: "from-blue-400 to-blue-600",
  saas: "from-blue-400 to-blue-600",
  marketplaces: "from-purple-400 to-purple-600",
  donations: "from-red-400 to-red-600",
  gaming: "from-green-400 to-green-600",
  education: "from-indigo-400 to-indigo-600",
  restaurant: "from-amber-400 to-amber-600",
  retail: "from-pink-400 to-pink-600",
  services: "from-teal-400 to-teal-600",
};

const CATEGORY_LABELS = {
  ecommerce: "E-Commerce",
  saas: "SaaS",
  marketplaces: "Marketplaces",
  donations: "Donations",
  gaming: "Gaming",
  education: "Education",
  restaurant: "Restaurant",
  retail: "Retail Store",
  services: "Local Services",
};

export function DashboardCheckoutLinks() {
  const navigate = useNavigate();
  const { merchant } = useAuth();
  const { canCreateLink, remainingLinks, plan, linkCount } = useSubscription();
  const [links, setLinks] = useState<CheckoutLink[]>([]);
  const [selectedLink, setSelectedLink] = useState<CheckoutLink | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [isQrGenerating, setIsQrGenerating] = useState(false);

  const planName = plan?.name || 'Free';

  useEffect(() => {
    const loadLinks = async () => {
      if (!merchant) {
        navigate("/auth");
        return;
      }

      try {
        const data = await getMerchantCheckoutLinks(merchant.id);
        setLinks(
          data.map((link: any) => ({
            id: link.id,
            title: link.title,
            description: link.description,
            category: link.category,
            amount: link.amount,
            currency: link.currency || "Pi",
            slug: link.slug,
            link: `${window.location.origin}/pay/${link.slug}`,
            createdAt: link.created_at,
            conversions: link.conversions || 0,
            views: link.views || 0,
            isActive: link.is_active,
          }))
        );
      } catch (error) {
        console.error("Error loading checkout links:", error);
        toast.error("Failed to load checkout links");
      }
    };

    loadLinks();
  }, [merchant, navigate]);

  const handleCopyLink = (link?: string) => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard!");
  };

  const handleShareLink = async (link: CheckoutLink) => {
    const shareUrl = link.link || `${window.location.origin}/pay/${link.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: link.title,
          text: link.description,
          url: shareUrl,
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          handleCopyLink(shareUrl);
        }
      }
    } else {
      handleCopyLink(shareUrl);
    }
  };

  const handleDownloadQR = async (link: CheckoutLink) => {
    const shareUrl = link.link || `${window.location.origin}/pay/${link.slug}`;
    try {
      const qrPng = await buildCheckoutQr(shareUrl);
      const element = document.createElement("a");
      element.href = qrPng;
      element.download = `${link.slug || link.id}-qr.png`;
      element.click();
      toast.success("QR code downloaded!");
    } catch (error) {
      console.error("Failed to generate QR code", error);
      toast.error("Unable to generate QR code right now");
    }
  };

  const handleViewLink = (link: CheckoutLink) => {
    const url = link.link || `${window.location.origin}/pay/${link.slug}`;
    window.open(url, "_blank");
  };

  const handleEditLink = (link: CheckoutLink) => {
    navigate(`/dashboard/checkout-links/${link.id}/edit`, { state: { link } });
  };

  const handleDeleteClick = (link: CheckoutLink) => {
    setSelectedLink(link);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedLink && merchant) {
      try {
        await deleteCheckoutLink(selectedLink.id, merchant.id);
        setLinks(links.filter((l) => l.id !== selectedLink.id));
        toast.success("Checkout link deleted!");
      } catch (error) {
        console.error("Error deleting link:", error);
        toast.error("Failed to delete link");
      }
    }
    setShowDeleteConfirm(false);
    setSelectedLink(null);
  };

  const handleShowQR = async (link: CheckoutLink) => {
    setSelectedLink(link);
    setShowQRModal(true);
    setIsQrGenerating(true);
    setQrPreview(null);

    const shareUrl = link.link || `${window.location.origin}/pay/${link.slug}`;
    try {
      const qrPng = await buildCheckoutQr(shareUrl);
      setQrPreview(qrPng);
    } catch (error) {
      console.error("Failed to render QR", error);
      toast.error("Unable to render QR code");
    } finally {
      setIsQrGenerating(false);
    }
  };

  const totalViews = links.reduce((sum, link) => sum + (link.views || 0), 0);
  const totalConversions = links.reduce((sum, link) => sum + (link.conversions || 0), 0);
  const conversionRate =
    totalViews > 0 ? ((totalConversions / totalViews) * 100).toFixed(2) : "0";

  return (
    <DashboardLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Checkout Links</h1>
          <p className="text-muted-foreground">Manage and track your payment checkout links</p>
          <div className="flex items-center gap-2 mt-1">
            <Crown className={`w-4 h-4 ${
              planName === 'Free' ? 'text-muted-foreground' :
              planName === 'Basic' ? 'text-blue-500' :
              (planName === 'Growth' || planName === 'Pro') ? 'text-purple-500' : 'text-blue-500'
            }`} />
            <span className="text-sm text-muted-foreground">
              {planName} Plan - {remainingLinks !== null ? `${remainingLinks} remaining` : 'Unlimited'} 
            </span>
          </div>
        </div>
        <Button 
          onClick={() => navigate("/dashboard/checkout-links/create")}
          disabled={!canCreateLink}
        >
          <Plus className="w-4 h-4 mr-2" />
          {canCreateLink ? 'Create New Link' : 'Upgrade to Create More'}
        </Button>
      </div>

      {/* Stats */}
      {links.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Links
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{links.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalViews}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Conversions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalConversions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Conversion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversionRate}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Links Table */}
      {links.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Your Checkout Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Conversions</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {links.map((link) => (
                    <TableRow key={link.id}>
                      <TableCell className="font-medium">
                        <div>
                          <p className="font-semibold">{link.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {link.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`bg-gradient-to-r ${CATEGORY_COLORS[link.category as keyof typeof CATEGORY_COLORS]}`}
                        >
                          {CATEGORY_LABELS[link.category as keyof typeof CATEGORY_LABELS]}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">
                        {link.amount} {link.currency}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {link.views}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-green-600">
                          <TrendingUp className="w-4 h-4" />
                          {link.conversions}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {link.createdAt ? new Date(link.createdAt).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleViewLink(link)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Link
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCopyLink(link.link)}>
                              <Copy className="w-4 h-4 mr-2" />
                              Copy Link
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleShareLink(link)}>
                              <Share2 className="w-4 h-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleShowQR(link)}>
                              <QrCode className="w-4 h-4 mr-2" />
                              View QR Code
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadQR(link)}>
                              <QrCode className="w-4 h-4 mr-2" />
                              Download QR
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditLink(link)}>
                              <Edit2 className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(link)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-12 text-center">
            <div className="text-muted-foreground mb-4">
              <p className="text-lg font-semibold mb-2">No checkout links yet</p>
              <p>Create your first checkout link to get started</p>
            </div>
            <Button onClick={() => navigate("/dashboard/checkout-links/create")}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Link
            </Button>
          </CardContent>
        </Card>
      )}
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Checkout Link?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{selectedLink?.title}"? This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* QR Code Modal */}
      {showQRModal && selectedLink && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => {
            setShowQRModal(false);
            setQrPreview(null);
            setSelectedLink(null);
            setIsQrGenerating(false);
          }}
        >
          <Card className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle>{selectedLink.title}</CardTitle>
              <CardDescription>QR Code</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="bg-white p-4 rounded-lg border-2 w-72 h-72 flex items-center justify-center">
                {isQrGenerating && <p className="text-sm text-muted-foreground">Generating QR...</p>}
                {!isQrGenerating && qrPreview && (
                  <img src={qrPreview} alt="QR Code" className="w-64 h-64" />
                )}
              </div>
              <div className="w-full space-y-2">
                <Button
                  onClick={() => selectedLink && handleDownloadQR(selectedLink)}
                  className="w-full"
                  disabled={isQrGenerating}
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Download QR Code
                </Button>
                <Button
                  onClick={() => {
                    setShowQRModal(false);
                    setQrPreview(null);
                    setSelectedLink(null);
                    setIsQrGenerating(false);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}
