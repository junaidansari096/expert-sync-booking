import { useState, useRef } from 'react';
import axios from 'axios';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Search, Calendar, Clock, Inbox } from 'lucide-react';

export default function MyBookings() {
  const [email, setEmail] = useState('');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from('.stagger-item', {
      y: 20,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out',
    });
  }, { scope: containerRef });

  const fetchBookings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setSearched(true);
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/bookings?email=${encodeURIComponent(email)}`);
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this session?')) return;
    
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/bookings/${id}/cancel`);
      // Update local state
      setBookings(bookings.map(b => b._id === id ? { ...b, status: 'Cancelled' } : b));
    } catch (error) {
      console.error('Error cancelling booking', error);
      alert('Failed to cancel the booking. Please try again.');
    }
  };

  const getStatusStyle = (status: string) => {
    switch(status.toLowerCase()) {
      case 'confirmed': return 'border-foreground text-foreground';
      case 'completed': return 'border-muted text-muted-foreground';
      case 'cancelled': return 'border-red-900/30 text-red-500 bg-red-500/5';
      default: return 'border-border text-foreground';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12" ref={containerRef}>
      <div className="text-center max-w-xl mx-auto stagger-item">
        <h1 className="text-4xl font-light tracking-tight text-foreground mb-4">Your Sessions</h1>
        <p className="text-muted-foreground mb-8 text-sm">Enter your email address to retrieve your booking history and upcoming schedules.</p>
        
        <form onSubmit={fetchBookings} className="flex gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="flex-1 bg-background border border-border px-4 py-3 text-sm focus:border-foreground focus:ring-1 focus:ring-foreground outline-none transition-all placeholder:text-muted-foreground"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? 'Searching...' : <>Search <Search size={16} /></>}
          </button>
        </form>
      </div>

      {searched && !loading && (
        <div className="mt-12 stagger-item">
          {bookings.length === 0 ? (
            <div className="text-center p-16 minimal-card">
              <div className="w-16 h-16 rounded-full border border-border flex items-center justify-center mx-auto mb-6 text-muted-foreground">
                <Inbox size={24} />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No Records Found</h3>
              <p className="text-muted-foreground text-sm">No active or past sessions located for {email}.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bookings.map((booking) => (
                <div key={booking._id} className="minimal-card p-6 flex flex-col stagger-item group">
                  <div className="flex justify-between items-start mb-6">
                    <span className={`px-3 py-1 text-[10px] uppercase tracking-widest border transition-colors ${getStatusStyle(booking.status)}`}>
                      {booking.status}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">
                      {booking._id.slice(-6).toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-xl font-medium text-foreground mb-1">{booking.expertId?.name || 'Expert'}</h3>
                    <p className="text-sm text-muted-foreground uppercase tracking-wider">{booking.expertId?.category}</p>
                  </div>
                  
                  <div className="space-y-3 border-t border-border pt-6">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar size={14} />
                        <span>Date</span>
                      </div>
                      <span className="text-foreground">{booking.date}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock size={14} />
                        <span>Time</span>
                      </div>
                      <span className="text-foreground">{booking.timeSlot}</span>
                    </div>
                  </div>
                  
                  {booking.notes && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Notes</p>
                      <p className="text-sm text-foreground">"{booking.notes}"</p>
                    </div>
                  )}

                  <div className="mt-8 pt-6 border-t border-border">
                    {booking.status !== 'Cancelled' && booking.status !== 'Completed' ? (
                      <button
                        onClick={() => handleCancel(booking._id)}
                        className="w-full py-2 border border-border text-[10px] uppercase tracking-widest text-muted-foreground hover:border-red-900/50 hover:text-red-500 hover:bg-red-500/5 transition-all"
                      >
                        Cancel Session
                      </button>
                    ) : (
                      <div className="w-full py-2 text-center text-[10px] uppercase tracking-widest text-muted-foreground/30 italic">
                        Action unavailable
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
