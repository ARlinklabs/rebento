import { useEffect } from 'react';
import Navbar from '@/sections/Navbar';
import Hero from '@/sections/Hero';
import WidgetShowcase from '@/sections/WidgetShowcase';
import CTASection from '@/sections/CTASection';
import Footer from '@/sections/Footer';
import { useWallet } from '@/context/WalletContext';

function LandingPage() {
  const { address, isConnected } = useWallet();

  useEffect(() => {
    console.log('Landing - Wallet address:', address);
    console.log('Landing - isConnected:', isConnected);
  }, [address, isConnected]);

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
