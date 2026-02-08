import Navbar from '@/sections/Navbar';
import Hero from '@/sections/Hero';
import WidgetShowcase from '@/sections/WidgetShowcase';
import CTASection from '@/sections/CTASection';
import Footer from '@/sections/Footer';

function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <WidgetShowcase />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

export default LandingPage;
