import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PiAuthGuard } from "@/components/auth/PiAuthGuard";
import { ThemeProvider } from "@/components/theme-provider";
import { SplashScreen } from "@/components/SplashScreen";
import { AdminRouteGuard } from "@/components/AdminRouteGuard";
import { ScrollRestoration } from "@/components/ScrollRestoration";
import { useAuth } from "@/contexts/AuthContext";
import { AppContent } from "@/components/AppContent";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import PaymentLinks from "./pages/PaymentLinks";
import Transactions from "./pages/Transactions";
import ApiSettings from "./pages/ApiSettings";
import Settings from "./pages/Settings";
import PayPage from "./pages/PayPage";
import Pricing from "./pages/Pricing";
import Docs from "./pages/Docs";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import GDPR from "./pages/GDPR";
import About from "./pages/About";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import AISupport from "./pages/AISupport";
import Withdrawals from "./pages/Withdrawals";
import AdminWithdrawals from "./pages/AdminWithdrawals";
import AdminAuth from "./pages/AdminAuth";
import Widgets from "./pages/Widgets";
import WatchAds from "./pages/WatchAds";
import Subscription from "./pages/Subscription";
import Help from "./pages/Help";
import Storefront from "./pages/Storefront";
import Reviews from "./pages/Reviews";

import NotFound from "./pages/NotFound";
import TrackRedirect from "./pages/TrackRedirect";
import AdminDashboard from "./pages/AdminDashboard";

import CreateLinkButton from "./pages/payment-buttons/CreateLinkButton";
import MerchantCreateLink from "./pages/MerchantCreateLink";
import MerchantCheckout from "./pages/MerchantCheckout";
import CartCheckout from "./pages/CartCheckout";
import DonateCheckout from "./pages/DonateCheckout";
import SubscribeCheckout from "./pages/SubscribeCheckout";
import CreateCartButton from "./pages/payment-buttons/CreateCartButton";
import CreateDonateButton from "./pages/payment-buttons/CreateDonateButton";
import CreateSubscribeButton from "./pages/payment-buttons/CreateSubscribeButton";
import ECommerce from "./pages/ECommerce";
import SaaS from "./pages/SaaS";
import Marketplaces from "./pages/Marketplaces";
import Donations from "./pages/Donations";
import Gaming from "./pages/Gaming";
import Education from "./pages/Education";
import DroppayMap from "./pages/DroppayMap";
import PiNetworkDebugPanel from "./components/PiNetworkDebugPanel";

import ECommerceDemo from "./pages/demos/ECommerceDemo";
import SaaSDemo from "./pages/demos/SaaSDemo";
import MarketplacesDemo from "./pages/demos/MarketplacesDemo";
import DonationsDemo from "./pages/demos/DonationsDemo";
import GamingDemo from "./pages/demos/GamingDemo";
import EducationDemo from "./pages/demos/EducationDemo";
import { RestaurantDemo } from "./pages/demos/RestaurantDemo";
import { RetailDemo } from "./pages/demos/RetailDemo";
import { ServicesDemo } from "./pages/demos/ServicesDemo";
import DemoCheckoutBuilder from "./pages/DemoCheckoutBuilder";

import { DashboardCreateCheckoutLink } from "./pages/DashboardCreateCheckoutLink";
import { DashboardCheckoutLinks } from "./pages/DashboardCheckoutLinks";

const queryClient = new QueryClient();


const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="droppay-theme">
        <AuthProvider>
          <TooltipProvider>
            <SplashScreen />
            <AppContent />
            <Toaster />
            <Sonner />
            <BrowserRouter future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true
            }}>
              <ScrollRestoration />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/gdpr" element={<GDPR />} />
                <Route path="/about" element={<About />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/ai-support" element={<AISupport />} />
                <Route path="/reviews" element={<Reviews />} />
                <Route path="/dashboard" element={<PiAuthGuard><Dashboard /></PiAuthGuard>} />
                <Route path="/dashboard/links" element={<PiAuthGuard><PaymentLinks /></PiAuthGuard>} />
                <Route path="/dashboard/transactions" element={<PiAuthGuard><Transactions /></PiAuthGuard>} />
                <Route path="/dashboard/api" element={<PiAuthGuard><ApiSettings /></PiAuthGuard>} />
                <Route path="/dashboard/settings" element={<PiAuthGuard><Settings /></PiAuthGuard>} />
                <Route path="/dashboard/withdrawals" element={<PiAuthGuard><Withdrawals /></PiAuthGuard>} />
                <Route path="/dashboard/widgets" element={<PiAuthGuard><Widgets /></PiAuthGuard>} />
                <Route path="/dashboard/watch-ads" element={<PiAuthGuard><WatchAds /></PiAuthGuard>} />
                <Route path="/dashboard/subscription" element={<PiAuthGuard><Subscription /></PiAuthGuard>} />
                <Route path="/dashboard/store" element={<PiAuthGuard><Storefront /></PiAuthGuard>} />
                <Route path="/dashboard/help" element={<PiAuthGuard><Help /></PiAuthGuard>} />
                <Route path="/dashboard/map" element={<PiAuthGuard><DroppayMap /></PiAuthGuard>} />
                <Route path="/dashboard/pi-debug" element={<PiAuthGuard><PiNetworkDebugPanel /></PiAuthGuard>} />
                <Route path="/auth-debug" element={<PiAuthGuard><PiNetworkDebugPanel /></PiAuthGuard>} />
                <Route path="/dashboard/checkout-links" element={<PiAuthGuard><DashboardCheckoutLinks /></PiAuthGuard>} />
                <Route path="/dashboard/checkout-links/create" element={<PiAuthGuard><DashboardCreateCheckoutLink /></PiAuthGuard>} />
                <Route path="/dashboard/help" element={<Help />} />
                <Route path="/admin/auth" element={<AdminAuth />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/withdrawals" element={<AdminRouteGuard><AdminWithdrawals /></AdminRouteGuard>} />
                <Route path="/pay/:slug" element={<PayPage />} />
                <Route path="/track/:slug" element={<TrackRedirect />} />
                <Route path="/docs" element={<Docs />} />
                <Route path="/dashboard/payment-buttons/create-link" element={<PiAuthGuard><CreateLinkButton /></PiAuthGuard>} />
                <Route path="/dashboard/merchant/create-link" element={<PiAuthGuard><MerchantCreateLink /></PiAuthGuard>} />
                <Route path="/m/:code" element={<MerchantCheckout />} />
                <Route path="/cart" element={<CartCheckout />} />
                <Route path="/donate" element={<DonateCheckout />} />
                <Route path="/subscribe" element={<SubscribeCheckout />} />
                <Route path="/dashboard/payment-buttons/create-cart" element={<PiAuthGuard><CreateCartButton /></PiAuthGuard>} />
                <Route path="/dashboard/payment-buttons/create-donate" element={<PiAuthGuard><CreateDonateButton /></PiAuthGuard>} />
                <Route path="/dashboard/payment-buttons/create-subscribe" element={<PiAuthGuard><CreateSubscribeButton /></PiAuthGuard>} />
                <Route path="/use-cases/ecommerce" element={<ECommerce />} />
                <Route path="/use-cases/saas" element={<SaaS />} />
                <Route path="/use-cases/marketplaces" element={<Marketplaces />} />
                <Route path="/use-cases/donations" element={<Donations />} />
                <Route path="/use-cases/gaming" element={<Gaming />} />
                <Route path="/use-cases/education" element={<Education />} />
                <Route path="/demos/ecommerce" element={<ECommerceDemo />} />
                <Route path="/demos/saas" element={<SaaSDemo />} />
                <Route path="/demos/marketplaces" element={<MarketplacesDemo />} />
                <Route path="/demos/donations" element={<DonationsDemo />} />
                <Route path="/demos/gaming" element={<GamingDemo />} />
                <Route path="/demos/education" element={<EducationDemo />} />
                <Route path="/demos/restaurant" element={<RestaurantDemo />} />
                <Route path="/demos/retail" element={<RetailDemo />} />
                <Route path="/demos/services" element={<ServicesDemo />} />
                <Route path="/demos/checkout-builder" element={<DemoCheckoutBuilder />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;