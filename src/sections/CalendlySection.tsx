import { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, ChevronRight } from 'lucide-react';

const timeSlots = [
  { time: '9:00 AM', date: 'Feb 3' },
  { time: '10:30 AM', date: 'Feb 3' },
  { time: '12:30 PM', date: 'Feb 3' },
  { time: '2:30 PM', date: 'Feb 3' },
];

const CalendlySection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);
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
            <span className="inline-block text-xs font-semibold tracking-widest text-rebento-blue uppercase mb-4">
              Calendly integration
            </span>

            {/* Heading */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-rebento-text mb-6 leading-tight">
              Turn profile views into clients.
            </h2>

            {/* Description */}
            <p className="text-lg text-rebento-text-secondary leading-relaxed">
              Connect Calendly once and turn your profile into a booking page. 
              Fewer clicks, higher conversion, more meetings.
            </p>
          </div>

          {/* Right Content - Calendly Cards */}
          <div
            className={`relative transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}
            style={{ transitionDelay: '0.2s' }}
          >
            <div className="relative">
              {/* Background Cards (Stack Effect) */}
              <div
                className="absolute top-4 left-4 right-0 bottom-0 bg-rebento-blue/10 rounded-3xl transform rotate-2"
                style={{
                  transform: 'rotate(3deg) translateY(10px)',
                }}
              />
              <div
                className="absolute top-2 left-2 right-0 bottom-0 bg-rebento-blue/20 rounded-3xl transform rotate-1"
                style={{
                  transform: 'rotate(1.5deg) translateY(5px)',
                }}
              />

              {/* Main Card */}
              <div className="relative bg-rebento-blue rounded-3xl p-6 md:p-8 shadow-float overflow-hidden">
                {/* Card Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">Quick intro call</h3>
                      <div className="flex items-center gap-2 text-white/70 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>30 min</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Book Now Button */}
                <button className="w-full bg-white text-rebento-blue font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-white/90 transition-colors mb-6">
                  <Calendar className="w-5 h-5" />
                  Book now
                </button>

                {/* Time Slots */}
                <div className="space-y-2">
                  <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-3">
                    Upcoming slots
                  </p>
                  {timeSlots.map((slot, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 cursor-pointer ${
                        hoveredSlot === index
                          ? 'bg-white/20'
                          : 'bg-white/10 hover:bg-white/15'
                      }`}
                      onMouseEnter={() => setHoveredSlot(index)}
                      onMouseLeave={() => setHoveredSlot(null)}
                    >
                      <span className="text-white font-medium">{slot.time}</span>
                      <span className="text-white/60 text-sm">{slot.date}</span>
                    </div>
                  ))}
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
              </div>

              {/* Secondary Card (Partial) */}
              <div
                className="absolute -bottom-8 left-8 right-8 bg-white rounded-2xl p-4 shadow-card border border-gray-100"
                style={{
                  transform: 'translateY(60%) scale(0.95)',
                  opacity: 0.7,
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rebento-blue/10 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-rebento-blue" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-rebento-text text-sm">Quick intro call</p>
                    <p className="text-xs text-rebento-text-secondary">30 minutes</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-rebento-text-secondary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CalendlySection;
