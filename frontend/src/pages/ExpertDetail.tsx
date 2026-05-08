import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';

let socket: Socket;

export default function ExpertDetail() {
  const { id } = useParams<{ id: string }>();
  const [expert, setExpert] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Connect to Socket
    socket = io('http://localhost:5000');

    socket.on('slotBooked', (data: { expertId: string, date: string, timeSlot: string }) => {
      if (data.expertId === id) {
        setExpert((prevExpert: any) => {
          if (!prevExpert) return prevExpert;
          const newSlots = prevExpert.availableSlots.map((slot: any) => {
            if (slot.date === data.date) {
              return { ...slot, times: slot.times.filter((t: string) => t !== data.timeSlot) };
            }
            return slot;
          }).filter((slot: any) => slot.times.length > 0);
          return { ...prevExpert, availableSlots: newSlots };
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  useEffect(() => {
    const fetchExpert = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/experts/${id}`);
        setExpert(data);
      } catch (error) {
        console.error('Error fetching expert', error);
      } finally {
        setLoading(false);
      }
    };
    fetchExpert();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading expert details...</div>;
  }

  if (!expert) {
    return <div className="p-8 text-center text-red-500">Expert not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-8 items-start">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center text-blue-700 font-bold text-5xl flex-shrink-0">
          {expert.name.charAt(0)}
        </div>
        <div className="flex-1 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{expert.name}</h1>
              <p className="text-lg text-blue-600 font-medium">{expert.category}</p>
            </div>
            <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full font-semibold">
              <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              {expert.rating}
            </div>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Book a 1-on-1 session with {expert.name} to level up your skills in {expert.category}. With {expert.experience} years of experience, you'll receive practical, actionable advice.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">Available Time Slots</h2>
        {expert.availableSlots.length === 0 ? (
          <div className="p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center text-slate-500">
            No slots available at the moment.
          </div>
        ) : (
          <div className="space-y-8">
            {expert.availableSlots.map((slotDay: any) => (
              <div key={slotDay.date} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  {new Date(slotDay.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {slotDay.times.map((time: string) => (
                    <Link
                      key={time}
                      to={`/expert/${expert._id}/book?date=${slotDay.date}&time=${encodeURIComponent(time)}`}
                      className="px-4 py-2 bg-slate-50 hover:bg-blue-600 text-slate-700 hover:text-white rounded-lg text-sm font-medium transition-all shadow-sm border border-slate-200 hover:border-blue-600 hover:shadow-md transform hover:-translate-y-0.5"
                    >
                      {time}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
