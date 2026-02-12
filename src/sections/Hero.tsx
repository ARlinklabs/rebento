import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Download, ExternalLink, Pencil } from 'lucide-react';
import { isValidBentoUrl } from '@/lib/bentoImporter';
import { useDeployedProfile } from '@/hooks/useDeployedProfile';
import { useAuth } from 'arlinkauth/react';

interface WidgetCard {
  id: string;
  image: string;
  position: { x: string; y: string };
  rotation: number;
  scale: number;
  delay: number;
}

const widgetCards: WidgetCard[] = [
  {
    id: 'link',
    image: '/images/widget-link.png',
    position: { x: '8%', y: '15%' },
    rotation: -12,
    scale: 0.9,
    delay: 0.1,
  },
  {
    id: 'instagram',
    image: '/images/widget-instagram.png',
    position: { x: '75%', y: '10%' },
    rotation: 8,
    scale: 0.85,
    delay: 0.2,
  },
  {
    id: 'youtube',
    image: '/images/widget-youtube.png',
    position: { x: '5%', y: '55%' },
    rotation: -8,
    scale: 0.88,
    delay: 0.3,
  },
  {
    id: 'x',
    image: '/images/widget-x.png',
    position: { x: '78%', y: '50%' },
    rotation: 12,
    scale: 0.82,
    delay: 0.4,
  },
  {
    id: 'calendly',
    image: '/images/widget-calendly.png',
    position: { x: '10%', y: '75%' },
    rotation: -5,
    scale: 1,
    delay: 0.5,
  },
  {
    id: 'map',
    image: '/images/widget-map.png',
    position: { x: '70%', y: '72%' },
    rotation: 5,
    scale: 0.95,
    delay: 0.6,
  },
];

type InputMode = 'claim' | 'import';

const Hero = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [inputMode, setInputMode] = useState<InputMode>('claim');
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
  const { hasDeployedProfile, deployedUsername } = useDeployedProfile();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left - rect.width / 2) / rect.width,
          y: (e.clientY - rect.top - rect.height / 2) / rect.height,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleClaim = () => {
    const cleanUsername = inputValue.trim().replace(/^@/, '');
    if (cleanUsername) {
      navigate('/editor', { state: { claimedUsername: cleanUsername } });
    } else {
      navigate('/editor');
    }
  };

  const handleImport = () => {
    if (inputValue.trim() && isValidBentoUrl(inputValue)) {
      navigate('/editor', { state: { importUrl: inputValue.trim() } });
    }
  };

  const handleSubmit = () => {
    if (inputMode === 'claim') {
      handleClaim();
    } else {
      handleImport();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (inputMode === 'claim') {
      // Allow alphanumeric, dots, underscores, hyphens
      setInputValue(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''));
    } else {
      setInputValue(e.target.value);
    }
  };

  const switchMode = (mode: InputMode) => {
    setInputMode(mode);
    setInputValue('');
  };

  const isValidInput =
    inputMode === 'claim'
      ? inputValue.trim().length > 0
      : isValidBentoUrl(inputValue);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-white to-rebento-bg pt-20"
    >
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-30"
          style={{
            background:
              'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)',
            top: '10%',
            left: '20%',
            transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-20"
          style={{
            background:
              'radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)',
            bottom: '20%',
            right: '15%',
            transform: `translate(${mousePosition.x * -15}px, ${mousePosition.y * -15}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        />
      </div>

      {/* Floating Widget Cards */}
      {widgetCards.map((card, index) => (
        <div
          key={card.id}
          className={`absolute transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] hidden md:block ${isVisible ? 'opacity-100' : 'opacity-0'
            }`}
          style={{
            left: card.position.x,
            top: card.position.y,
            transform: `
              translate(${mousePosition.x * (10 + index * 5)}px, ${mousePosition.y * (10 + index * 5)}px)
              rotate(${card.rotation}deg)
              scale(${card.scale})
            `,
            transitionDelay: `${card.delay}s`,
            zIndex: 10,
          }}
        >
          <div
            className={`animate-float ${index % 2 === 0 ? '' : 'animation-delay-1000'}`}
            style={{
              animationDuration: `${4 + index * 0.5}s`,
              animationDelay: `${index * 0.2}s`,
            }}
          >
            <img
              src={card.image}
              alt={`${card.id} widget`}
              className="w-32 md:w-40 lg:w-48 h-auto drop-shadow-float hover:scale-105 transition-transform duration-300"
              style={{
                filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.15))',
              }}
            />
          </div>
        </div>
      ))}

      {/* Main Content */}
      <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
        {/* Heading */}
        <h1
          className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-rebento-text leading-tight mb-4 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          style={{ transitionDelay: '0.2s' }}
        >
          One{' '}
          <span className="relative inline-block">
            <span className="relative z-10 px-3 py-1">link in bio</span>
            <span
              className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-pink-500/20 rounded-lg -rotate-1"
              style={{
                transform: 'rotate(-2deg) scale(1.05)',
              }}
            />
          </span>
        </h1>
        <h2
          className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal text-rebento-text-secondary italic mb-8 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          style={{ transitionDelay: '0.3s' }}
        >
          for everything you do
        </h2>

        {/* Subheading */}
        <p
          className={`text-lg md:text-xl text-rebento-text-secondary mb-8 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          style={{ transitionDelay: '0.4s' }}
        >
          Create your personal page in minutes. Free forever.
        </p>

        {isAuthenticated && hasDeployedProfile && deployedUsername ? (
          /* Logged-in user with deployed profile */
          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-3 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'}`}
            style={{ transitionDelay: '0.5s' }}
          >
            <Button
              onClick={() => navigate(`/${deployedUsername}`)}
              className="px-8 py-6 text-lg font-medium bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-full transition-all flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-5 h-5" />
              View my Profile
            </Button>
            <Button
              onClick={() => navigate('/editor')}
              variant="outline"
              className="px-8 py-6 text-lg font-medium rounded-full border-2 border-gray-200 hover:border-gray-300 transition-all flex items-center justify-center gap-2"
            >
              <Pencil className="w-5 h-5" />
              Edit Profile
            </Button>
          </div>
        ) : (
          /* Not logged in or no deployed profile — show claim/import */
          <>
            {/* Mode Toggle */}
            <div
              className={`flex items-center justify-center gap-3 mb-6 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              style={{ transitionDelay: '0.45s' }}
            >
              <button
                onClick={() => switchMode('claim')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${inputMode === 'claim'
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                Claim Username
              </button>
              <span className="text-sm text-gray-400">or</span>
              <button
                onClick={() => switchMode('import')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${inputMode === 'import'
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                <Download className="w-4 h-4" />
                Import from Bento
              </button>
            </div>

            {/* Input Field */}
            <div
              className={`flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xl mx-auto transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${isVisible
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-0 translate-y-10 scale-95'
                }`}
              style={{ transitionDelay: '0.5s' }}
            >
              <div className="relative w-full">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-rebento-text-secondary font-medium text-sm whitespace-nowrap">
                  {inputMode === 'claim' ? `${(import.meta.env.VITE_BASE_URL || 'https://rebento_arlink.arweave.net').replace(/^https?:\/\//, '')}/` : 'bento.me/'}
                </span>
                <Input
                  type="text"
                  placeholder={inputMode === 'claim' ? 'yourname' : 'username'}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={(e) => e.key === 'Enter' && isValidInput && handleSubmit()}
                  className={`w-full pr-4 py-6 text-lg rounded-full border-2 border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all ${inputMode === 'claim' ? 'pl-[10.5rem]' : 'pl-[6.5rem]'
                    }`}
                />
              </div>
              <Button
                onClick={handleSubmit}
                disabled={!isValidInput && inputMode === 'import'}
                className="w-full sm:w-auto px-8 py-6 text-lg font-medium bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-full transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {inputMode === 'claim' ? (
                  <>
                    {inputValue.trim() ? 'Claim' : 'Get Started'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    Import
                    <Download className="w-5 h-5" />
                  </>
                )}
              </Button>
            </div>

            {/* Bento shutdown notice (only in import mode) */}
            {inputMode === 'import' && (
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-200 mt-6 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-medium text-red-700">
                  Bento shuts down Feb 13 — save your profile now
                </span>
              </div>
            )}
          </>
        )}

        {/* Features list */}
        <div
          className={`flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-rebento-text-secondary transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          style={{ transitionDelay: '0.6s' }}
        >
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Free forever
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            always available
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Drag & drop builder
          </span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
