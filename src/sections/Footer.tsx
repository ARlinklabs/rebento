import { useState, useEffect, useRef } from 'react';

const Footer = () => {
  const [isVisible, setIsVisible] = useState(false);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <footer
      ref={footerRef}
      className="relative bg-white border-t border-gray-100"
    >
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          className={`flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
        >
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 rounded-full bg-rebento-blue"></div>
              <div className="w-5 h-5 rounded-full bg-rebento-red -ml-2"></div>
              <div className="w-5 h-5 rounded-full bg-rebento-green -ml-2"></div>
            </div>
            <span className="font-semibold text-rebento-text ml-1">Rebento</span>
          </div>

          {/* Powered by Arlink */}
          <a
            href="https://arlink.ar.io"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-rebento-text-secondary hover:text-rebento-text transition-colors"
          >
            Powered by
            <img src="/arlink.svg" alt="Arlink" className="h-4 w-auto" />
            <span className="font-medium">Arlink</span>
          </a>

          {/* Copyright */}
          <p className="text-sm text-rebento-text-secondary">
            © 2026 Rebento. All rights reserved.
          </p>

          {/* Version */}
          <span className="text-[10px] text-rebento-text-secondary/40">
            v0.1.0
          </span>

          {/* Privacy Link */}
          <a
            href="/policy"
            className="text-sm text-rebento-text-secondary hover:text-rebento-text transition-colors"
          >
            Privacy Policy
          </a>
        </div>
      </div>

      {/* Large Brand Text */}
      <div
        className={`relative overflow-hidden transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        style={{ transitionDelay: '0.2s' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-[12vw] md:text-[10vw] lg:text-[8vw] font-bold text-rebento-text/[0.03] leading-none text-center select-none"
            style={{
              transform: 'translateY(30%)',
            }}
          >
            Rebento
          </h2>
        </div>
      </div>


    </footer>
  );
};

export default Footer;
