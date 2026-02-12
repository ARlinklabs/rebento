import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Download, ExternalLink, Pencil } from 'lucide-react';
import { isValidBentoUrl } from '@/lib/bentoImporter';
import { useDeployedProfile } from '@/hooks/useDeployedProfile';
import { useAuth } from 'arlinkauth/react';

type InputMode = 'claim' | 'import';

const CTASection = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [inputMode, setInputMode] = useState<InputMode>('claim');
  const [isVisible, setIsVisible] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { hasDeployedProfile, deployedUsername } = useDeployedProfile();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
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
      ref={sectionRef}
      className="relative py-24 md:py-32 bg-rebento-bg overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-20"
          style={{
            background:
              'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Label */}
        <span
          className={`inline-block text-xs font-semibold tracking-widest text-pink-500 uppercase mb-6 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        >
          GET STARTED
        </span>

        {isAuthenticated && hasDeployedProfile && deployedUsername ? (
          <>
            {/* Heading */}
            <h2
              className={`text-4xl md:text-5xl lg:text-6xl font-semibold text-rebento-text mb-4 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: '0.1s' }}
            >
              Your page is live.
            </h2>

            <p
              className={`text-lg md:text-xl text-rebento-text-secondary mb-8 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: '0.2s' }}
            >
              Share it with the world or make some changes.
            </p>

            <div
              className={`flex flex-col sm:flex-row items-center justify-center gap-3 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'
              }`}
              style={{ transitionDelay: '0.3s' }}
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
          </>
        ) : (
          <>
            {/* Heading */}
            <h2
              className={`text-4xl md:text-5xl lg:text-6xl font-semibold text-rebento-text mb-4 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: '0.1s' }}
            >
              {inputMode === 'claim' ? 'Claim your name now.' : 'Import your Bento.'}
            </h2>

            {/* Subheading */}
            <p
              className={`text-lg md:text-xl text-rebento-text-secondary mb-8 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: '0.2s' }}
            >
              {inputMode === 'claim'
                ? 'One link for everything you do.'
                : 'Paste your Bento username and we\'ll do the rest.'}
            </p>

            {/* Mode Toggle */}
            <div
              className={`flex items-center justify-center gap-3 mb-6 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: '0.25s' }}
            >
              <button
                onClick={() => switchMode('claim')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  inputMode === 'claim'
                    ? 'bg-pink-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                Claim Username
              </button>
              <span className="text-sm text-gray-400">or</span>
              <button
                onClick={() => switchMode('import')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  inputMode === 'import'
                    ? 'bg-pink-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Download className="w-4 h-4" />
                Import from Bento
              </button>
            </div>

            {/* Input Field */}
            <div
              className={`flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xl mx-auto transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isVisible
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-10 scale-95'
              }`}
              style={{ transitionDelay: '0.3s' }}
            >
              <div
                className={`relative w-full transition-all duration-300 ${
                  isInputFocused ? 'scale-[1.02]' : ''
                }`}
              >
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-rebento-text-secondary font-medium text-sm whitespace-nowrap">
                  {inputMode === 'claim' ? `${(import.meta.env.VITE_BASE_URL || 'https://rebento_arlink.arweave.net').replace(/^https?:\/\//, '')}/` : 'bento.me/'}
                </span>
                <Input
                  type="text"
                  placeholder={inputMode === 'claim' ? 'yourname' : 'username'}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  className={`w-full pr-4 py-6 text-lg rounded-full border-2 transition-all duration-300 ${
                    inputMode === 'claim' ? 'pl-[10.5rem]' : 'pl-[6.5rem]'
                  } ${
                    isInputFocused
                      ? 'border-pink-500 shadow-lg shadow-pink-500/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                />
              </div>
              <Button
                onClick={handleSubmit}
                disabled={!isValidInput && inputMode === 'import'}
                className={`w-full sm:w-auto px-8 py-6 text-lg font-medium rounded-full transition-all duration-300 flex items-center justify-center gap-2 ${
                  isInputFocused || isValidInput
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-lg shadow-pink-500/30'
                    : 'bg-rebento-text-secondary hover:bg-rebento-text'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
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
          </>
        )}
      </div>
    </section>
  );
};

export default CTASection;
