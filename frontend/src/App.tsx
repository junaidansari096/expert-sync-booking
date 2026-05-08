import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { CalendarDays, Users, LayoutDashboard } from 'lucide-react';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Home from './pages/Home';
import ExpertDetail from './pages/ExpertDetail';
import Booking from './pages/Booking';
import MyBookings from './pages/MyBookings';
import { cn } from './lib/utils';

function App() {
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Add dark class to html to force premium dark mode
    document.documentElement.classList.add('dark');
    
    // GSAP Navbar Animation
    if (navRef.current) {
      gsap.fromTo(navRef.current, 
        { y: -20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans text-foreground overflow-hidden relative">
      <div className="noise-bg"></div>
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none -z-10"></div>
      
      <nav ref={navRef} className="sticky top-0 z-50 bg-background/70 backdrop-blur-md border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center font-bold">
                <LayoutDashboard className="w-4 h-4" />
              </div>
              <span className="text-lg font-semibold tracking-tight">
                ExpertSync
              </span>
            </Link>
            <div className="flex space-x-1">
              <Link
                to="/"
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2",
                  location.pathname === '/' 
                    ? "bg-secondary text-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                <Users className="w-4 h-4" />
                Experts
              </Link>
              <Link
                to="/bookings"
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2",
                  location.pathname.startsWith('/bookings') 
                    ? "bg-secondary text-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                <CalendarDays className="w-4 h-4" />
                Bookings
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative z-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/expert/:id" element={<ExpertDetail />} />
          <Route path="/expert/:id/book" element={<Booking />} />
          <Route path="/bookings" element={<MyBookings />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
