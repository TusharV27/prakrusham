import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import LoginPopup from "@/components/LoginPopup";
import LocationPopup from "@/components/LocationPopup";
import LanguagePopup from "@/components/LanguagePopup";
import ScrollToTop from "@/components/ScrollToTop.jsx";

export default function FrontendLayout({ children }) {
  return (
    <>
      <Header />
      <CartDrawer />
      <LoginPopup />
      <LocationPopup />
      <LanguagePopup />
      <ScrollToTop />
      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  );
}
