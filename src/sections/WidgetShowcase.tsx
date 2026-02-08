import { useState, useEffect, useRef } from 'react';
import {
  Youtube,
  Instagram,
  Twitter,
  Globe,
  Linkedin,
  Github,
  Dribbble,
} from 'lucide-react';

interface WidgetItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  color: string;
  bgClass: string;
  username: string;
}

const widgets: WidgetItem[] = [
  {
    id: 'youtube',
    icon: <Youtube className="w-6 h-6" />,
    label: 'YouTube',
    color: '#FF3B30',
    bgClass: 'bg-red-600',
    username: '@rebento',
  },
  {
    id: 'instagram',
    icon: <Instagram className="w-6 h-6" />,
    label: 'Instagram',
    color: '#E4405F',
    bgClass: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400',
    username: '@rebento.me',
  },
  {
    id: 'x',
    icon: <Twitter className="w-6 h-6" />,
    label: 'X / Twitter',
    color: '#1D1D1F',
    bgClass: 'bg-black',
    username: '@rebento',
  },
  {
    id: 'linkedin',
    icon: <Linkedin className="w-6 h-6" />,
    label: 'LinkedIn',
    color: '#0A66C2',
    bgClass: 'bg-blue-600',
    username: 'Rebento',
  },
  {
    id: 'github',
    icon: <Github className="w-6 h-6" />,
    label: 'GitHub',
    color: '#1D1D1F',
    bgClass: 'bg-gray-900',
    username: '@rebento',
  },
  {
    id: 'dribbble',
    icon: <Dribbble className="w-6 h-6" />,
    label: 'Dribbble',
    color: '#EA4C89',
    bgClass: 'bg-pink-500',
    username: '@rebento',
  },
  {
    id: 'behance',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14h-8.027c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988h-6.466v-14.967h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zm-3.466-8.988h3.584c2.508 0 2.906-3-.312-3h-3.272v3zm3.391 3h-3.391v3.016h3.341c3.055 0 2.868-3.016.05-3.016z" />
      </svg>
    ),
    label: 'Behance',
    color: '#1769FF',
    bgClass: 'bg-blue-600',
    username: '@rebento',
  },
];

// Social Card Component matching the actual editor SocialCardContent
function SocialCard({
  widget,
  animationDelay,
}: {
  widget: WidgetItem;
  animationDelay: number;
}) {
  return (
    <div
      className="bg-white rounded-2xl border-2 border-gray-100 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)] flex flex-col h-full animate-fade-in-up"
      style={{ animationDelay: `${animationDelay}s` }}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-white ${widget.bgClass}`}
      >
        {widget.icon}
      </div>
      <p className="font-semibold text-sm text-gray-900">{widget.username}</p>
      <p className="text-xs text-gray-500 mt-0.5">{widget.label}</p>
      <button className="mt-auto px-4 py-2 rounded-full text-xs font-medium bg-gray-900 text-white hover:opacity-90 transition-colors">
        Follow
      </button>
    </div>
  );
}

const WidgetShowcase = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeWidgets, setActiveWidgets] = useState<string[]>([
    'youtube',
    'instagram',
    'x',
    'linkedin',
    'github',
    'dribbble',
  ]);
  const sectionRef = useRef<HTMLDivElement>(null);

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

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const toggleWidget = (widgetId: string) => {
    setActiveWidgets((prev) =>
      prev.includes(widgetId)
        ? prev.filter((id) => id !== widgetId)
        : [...prev, widgetId]
    );
  };

  const activeWidgetData = widgets.filter((w) => activeWidgets.includes(w.id));

  return (
    <section
      ref={sectionRef}
      className="relative py-24 md:py-32 bg-white overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div
            className={`transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`}
          >
            {/* Label */}
            <span className="inline-block text-xs font-semibold tracking-widest text-rebento-text-secondary uppercase mb-4">
              our widget
            </span>

            {/* Heading */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-rebento-text mb-4">
              Drag & Drop
            </h2>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-rebento-text-secondary mb-6">
              Build your page in ~1 minute.
            </p>

            <p className="text-base text-rebento-text-secondary/80">
              Just drag widgets into your canvas and watch the magic happen.
            </p>
          </div>

          {/* Right Content - Phone Mockup with Bento Grid */}
          <div
            className={`relative transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}
            style={{ transitionDelay: '0.2s' }}
          >
            {/* Phone Mockup */}
            <div className="relative mx-auto w-full max-w-sm">
              {/* Phone Frame */}
              <div className="relative bg-rebento-bg rounded-[3rem] p-4 shadow-2xl">
                {/* Screen */}
                <div className="bg-white rounded-[2.5rem] overflow-hidden pb-6">
                  {/* Status Bar */}
                  <div className="flex items-center justify-between px-6 py-3">
                    <span className="text-xs font-medium text-rebento-text">
                      9:41
                    </span>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full bg-rebento-text/20"></div>
                      <div className="w-4 h-4 rounded-full bg-rebento-text/20"></div>
                    </div>
                  </div>

                  {/* Profile Header */}
                  <div className="px-4 pb-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rebento-blue to-purple-500 mx-auto mb-2"></div>
                    <h3 className="font-semibold text-rebento-text">@rebento</h3>
                    <p className="text-sm text-rebento-text-secondary">
                      Your link in bio
                    </p>
                  </div>

                  {/* Bento Grid - matches editor mobile view (2 columns) */}
                  <div
                    className="px-4 grid grid-cols-2 gap-[20px]"
                    style={{ gridAutoRows: '80px' }}
                  >
                    {activeWidgetData.map((widget, index) => (
                      <div
                        key={widget.id}
                        className="col-span-1 row-span-2"
                        style={{ height: '160px' }}
                      >
                        <SocialCard
                          widget={widget}
                          animationDelay={index * 0.1}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Bottom Indicator */}
                  <div className="mt-4 flex justify-center">
                    <div className="w-32 h-1 bg-rebento-text/20 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-rebento-blue/10 rounded-full blur-xl"></div>
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-purple-500/10 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>

        {/* Widget Selector Bar */}
        <div
          className={`mt-16 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          style={{ transitionDelay: '0.4s' }}
        >
          <p className="text-center text-sm text-rebento-text-secondary mb-6">
            Click to toggle widgets
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {widgets.map((widget) => (
              <button
                key={widget.id}
                onClick={() => toggleWidget(widget.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-300 ${
                  activeWidgets.includes(widget.id)
                    ? 'border-rebento-blue bg-rebento-blue/5'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <span style={{ color: widget.color }}>{widget.icon}</span>
                <span
                  className={`text-xs font-medium ${
                    activeWidgets.includes(widget.id)
                      ? 'text-rebento-text'
                      : 'text-rebento-text-secondary'
                  }`}
                >
                  {widget.label.toUpperCase()}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <p
          className={`text-center text-sm text-rebento-text-secondary mt-8 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          style={{ transitionDelay: '0.5s' }}
        >
          This is how your page could look with the same live cards used on
          profile pages.
        </p>
      </div>
    </section>
  );
};

export default WidgetShowcase;
