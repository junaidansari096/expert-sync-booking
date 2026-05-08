import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Star, Briefcase, ArrowRight, User } from 'lucide-react';

export default function Home() {
  const [experts, setExperts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/experts`);
        setExperts(data.experts);
      } catch (error) {
        console.error('Error fetching experts', error);
      } finally {
        setLoading(false);
      }
    };
    fetchExperts();
  }, []);

  useGSAP(() => {
    if (!loading && experts.length > 0) {
      const tl = gsap.timeline();
      
      tl.fromTo('.hero-element', 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
      )
      .fromTo('.expert-card',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out' },
        "-=0.4"
      );
    }
  }, { dependencies: [loading, experts.length], scope: container });

  return (
    <div ref={container} className="space-y-16 pb-20">
      <div className="text-center space-y-6 max-w-3xl mx-auto mt-12 md:mt-24">
        <div className="hero-element inline-flex items-center gap-2 px-3 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-bold tracking-widest uppercase mb-4">
          <span>Top-Tier Professionals</span>
        </div>
        <h1 className="hero-element text-5xl md:text-7xl font-extrabold tracking-tighter">
          Accelerate your <br className="hidden md:block" />
          <span className="text-muted-foreground">growth journey.</span>
        </h1>
        <p className="hero-element text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Book exclusive 1-on-1 sessions with world-class experts. Gain insights, overcome blockers, and level up your career today.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16 max-w-6xl mx-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-xl bg-secondary/50 border border-border/50 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16 max-w-6xl mx-auto">
          {experts.map((expert) => (
            <Link
              key={expert._id}
              to={`/expert/${expert._id}`}
              className="expert-card group minimal-card flex flex-col h-full"
            >
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-5">
                  <div className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-xl tracking-tight transition-transform duration-300 group-hover:scale-105">
                    {expert.name.charAt(0)}
                  </div>
                  <div className="flex items-center gap-1.5 text-foreground font-medium text-sm bg-secondary px-2.5 py-1 rounded-md">
                    <Star className="w-3.5 h-3.5 fill-foreground" />
                    {expert.rating}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold tracking-tight mb-1">{expert.name}</h3>
                
                <div className="flex items-center gap-2 text-sm text-foreground/80 mb-3 font-medium">
                  <User className="w-3.5 h-3.5" />
                  {expert.category}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                  <Briefcase className="w-3.5 h-3.5" />
                  {expert.experience} years exp
                </div>
                
                <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-sm font-semibold">
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors">Book Session</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
