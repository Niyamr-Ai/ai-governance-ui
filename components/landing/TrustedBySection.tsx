"use client";
import { Star, Quote } from 'lucide-react';

export default function TrustedBySection() {
  const testimonials = [
    {
      quote: "NiyamR transformed how we manage AI risk. The visibility and control we have now is unprecedented.",
      author: "Sarah Chen",
      role: "Chief AI Officer",
      company: "Fortune 500 Bank",
      avatar: "SC",
    },
    {
      quote: "Implementation was seamless. Within weeks, we had complete governance over 200+ AI agents.",
      author: "Michael Torres",
      role: "VP of Engineering",
      company: "Global Tech Corp",
      avatar: "MT",
    },
    {
      quote: "The real-time monitoring and policy enforcement has been a game-changer for our compliance team.",
      author: "Dr. Emily Watson",
      role: "Head of AI Ethics",
      company: "Healthcare Leader",
      avatar: "EW",
    },
  ];

  const logos = [
    'Fortune 500', 'Global Bank', 'Tech Giant', 'Healthcare Co', 
    'Insurance Ltd', 'Retail Corp', 'Gov Agency', 'Fintech Inc'
  ];

  return (
    <section id="company" className="py-12 relative overflow-hidden bg-gradient-to-b from-background via-secondary/10 to-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/5 border border-accent/20 mb-6">
            <Star className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">Trusted Worldwide</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Trusted by{' '}
            <span className="gradient-text">Industry Leaders</span>
          </h2>
        </div>

        <div className="mb-20 overflow-hidden">
          <div className="flex animate-[scroll_30s_linear_infinite] gap-16">
            {[...logos, ...logos].map((logo, i) => (
              <div
                key={i}
                className="shrink-0 px-8 py-4 rounded-3xl glass-panel opacity-60 hover:opacity-100 transition-opacity shadow-soft"
              >
                <span className="text-lg font-semibold text-muted-foreground whitespace-nowrap">{logo}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.author} className="glass-panel p-8 rounded-3xl relative group shadow-soft hover:shadow-blue transition-shadow duration-300">
              <Quote className="w-10 h-10 text-primary/20 mb-6" />
              
              <p className="text-foreground leading-relaxed mb-8">
                "{testimonial.quote}"
              </p>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  <div className="text-sm text-primary">{testimonial.company}</div>
                </div>
              </div>

              <div className="absolute top-8 right-8 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}

