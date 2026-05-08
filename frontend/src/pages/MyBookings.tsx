import { useState } from 'react';
import axios from 'axios';

export default function MyBookings() {
  const [email, setEmail] = useState('');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchBookings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setSearched(true);
    try {
      const { data } = await axios.get(`http://localhost:5000/api/bookings?email=${encodeURIComponent(email)}`);
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Confirmed': return 'bg-green-100 text-green-700 border-green-200';
      case 'Completed': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Your Sessions</h1>
        <p className="text-slate-600 mb-8">Enter your email address to view all your past and upcoming expert sessions.</p>
        
        <form onSubmit={fetchBookings} className="flex gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address used for booking"
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition-all disabled:opacity-70"
          >
            {loading ? 'Searching...' : 'Find Bookings'}
          </button>
        </form>
      </div>

      {searched && !loading && (
        <div className="mt-12">
          {bookings.length === 0 ? (
            <div className="text-center p-12 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-1">No bookings found</h3>
              <p className="text-slate-500">We couldn't find any bookings associated with {email}.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bookings.map((booking) => (
                <div key={booking._id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                    <span className="text-sm font-medium text-slate-500">
                      ID: {booking._id.slice(-6).toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{booking.expertId?.name || 'Expert'}</h3>
                  <p className="text-sm text-blue-600 font-medium mb-4">{booking.expertId?.category}</p>
                  
                  <div className="bg-slate-50 rounded-xl p-4 space-y-2 border border-slate-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Date</span>
                      <span className="font-medium text-slate-900">{booking.date}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Time</span>
                      <span className="font-medium text-slate-900">{booking.timeSlot}</span>
                    </div>
                  </div>
                  
                  {booking.notes && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-xs font-medium text-slate-500 mb-1">Your notes</p>
                      <p className="text-sm text-slate-700 italic">"{booking.notes}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
