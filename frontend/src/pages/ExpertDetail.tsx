import { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Star, ArrowLeft, Loader2, CalendarDays, Clock, User, Check, MonitorPlay } from 'lucide-react';

let socket: Socket;

// The standard full schedule to render empty/occupied seats properly
const DAILY_TIMES = [
  '09:00 AM - 10:30 AM',
  '10:30 AM - 12:00 PM',
  '12:00 PM - 01:30 PM',
  '03:30 PM - 05:00 PM',
  '05:00 PM - 06:30 PM',
  '06:30 PM - 08:00 PM'
];

export default function ExpertDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [expert, setExpert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Seat booking state
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
          });
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
        if (data.availableSlots && data.availableSlots.length > 0) {
          setSelectedDate(data.availableSlots[0].date);
        }
      } catch (error) {
        console.error('Error fetching expert', error);
      } finally {
        setLoading(false);
      }
    };
    fetchExpert();
  }, [id]);

  useGSAP(() => {
    if (!loading && expert) {
      const tl = gsap.timeline();
      
      tl.fromTo('.profile-element',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
      )
      .fromTo('.slot-card',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' },
        "-=0.3"
      );
    }
  }, { dependencies: [loading, expert], scope: container });

  const handleBookNow = () => {
    if (selectedDate && selectedTime) {
      navigate(`/expert/${expert._id}/book?date=${selectedDate}&time=${encodeURIComponent(selectedTime)}`);
    }
  };

  const currentDaySlots = useMemo(() => {
    if (!expert || !selectedDate) return [];
    const dayData = expert.availableSlots.find((s: any) => s.date === selectedDate);
    return dayData ? dayData.times : [];
  }, [expert, selectedDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-foreground" />
      </div>
    );
  }

  if (!expert) {
    return <div className="p-8 text-center text-destructive minimal-card max-w-md mx-auto mt-12 font-medium">Expert not found.</div>;
  }

  return (
    <div ref={container} className="max-w-4xl mx-auto space-y-10 pb-20 pt-6">
      <Link to="/" className="profile-element inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 group font-medium text-sm">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Experts
      </Link>

      <div className="profile-element minimal-card p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start">
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-4xl md:text-5xl tracking-tight flex-shrink-0">
          {expert.name.charAt(0)}
        </div>
        <div className="flex-1 space-y-5">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight mb-2">{expert.name}</h1>
              <div className="flex items-center gap-2 text-foreground/80 font-medium text-lg">
                <User className="w-5 h-5" />
                {expert.category}
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-secondary text-foreground px-3 py-1.5 rounded-md font-semibold self-start text-sm">
              <Star className="w-4 h-4 fill-foreground" />
              {expert.rating}
            </div>
          </div>
          <p className="text-muted-foreground leading-relaxed md:text-lg">
            Book a 1-on-1 session with <span className="text-foreground font-medium">{expert.name}</span> to level up your skills. With <span className="text-foreground font-medium">{expert.experience} years of experience</span>, you'll receive practical, actionable advice tailored to your goals.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="profile-element text-2xl font-bold text-foreground tracking-tight flex items-center gap-3">
          <CalendarDays className="w-6 h-6" />
          Seat Selection
        </h2>
        
        {expert.availableSlots.length === 0 ? (
          <div className="profile-element p-12 minimal-card text-center flex flex-col items-center justify-center gap-4">
            <Clock className="w-10 h-10 text-muted-foreground/50" />
            <p className="text-lg font-medium text-foreground">No slots available at the moment.</p>
            <p className="text-sm text-muted-foreground">Please check back later or try another expert.</p>
          </div>
        ) : (
          <div className="slot-card minimal-card p-6 md:p-8 space-y-8">
            
            {/* Date Selector */}
            <div className="space-y-3">
              <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Select Date</label>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {expert.availableSlots.map((slotDay: any) => {
                  const isSelected = selectedDate === slotDay.date;
                  const d = new Date(slotDay.date);
                  const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                  const dateNum = d.getDate();
                  const monthName = d.toLocaleDateString('en-US', { month: 'short' });
                  
                  return (
                    <button
                      key={slotDay.date}
                      onClick={() => { setSelectedDate(slotDay.date); setSelectedTime(''); }}
                      className={`flex-shrink-0 px-5 py-3 rounded-md border flex flex-col items-center gap-1 transition-all duration-200 ${
                        isSelected 
                          ? 'bg-foreground text-background border-foreground' 
                          : 'bg-secondary text-foreground border-border hover:border-foreground/50'
                      }`}
                    >
                      <span className="text-xs font-medium uppercase opacity-80">{dayName}</span>
                      <span className="text-xl font-bold">{dateNum}</span>
                      <span className="text-xs font-medium uppercase opacity-80">{monthName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Seat Map */}
            <div className="bg-secondary rounded-xl p-8 border border-border mt-8">
              <div className="flex flex-col items-center mb-10">
                <div className="w-3/4 h-2 bg-gradient-to-b from-foreground/20 to-transparent rounded-t-full mb-2"></div>
                <div className="flex items-center gap-2 text-muted-foreground uppercase tracking-widest font-semibold text-xs">
                  <MonitorPlay className="w-4 h-4" />
                  Consultant Screen
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto justify-items-center">
                {/* First Row (Before Break) */}
                {DAILY_TIMES.slice(0, 3).map((time) => {
                  const isAvailable = currentDaySlots.includes(time);
                  const isSelected = selectedTime === time;
                  return (
                    <button
                      key={time}
                      disabled={!isAvailable}
                      onClick={() => setSelectedTime(time)}
                      className={`relative w-32 h-16 rounded-t-xl rounded-b-md border-2 flex items-center justify-center transition-all duration-300 group ${
                        !isAvailable 
                          ? 'bg-border/50 border-border cursor-not-allowed opacity-50'
                          : isSelected
                            ? 'bg-foreground border-foreground text-background shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                            : 'bg-background border-border hover:border-foreground/70 text-foreground'
                      }`}
                    >
                      {/* Seat Armrests aesthetic */}
                      <div className={`absolute top-2 -left-1 w-1 h-8 rounded-full ${isSelected ? 'bg-background/20' : 'bg-foreground/10'}`}></div>
                      <div className={`absolute top-2 -right-1 w-1 h-8 rounded-full ${isSelected ? 'bg-background/20' : 'bg-foreground/10'}`}></div>
                      
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-[10px] font-medium tracking-widest opacity-80">{time.split(' - ')[0]}</span>
                        <span className="text-xs font-bold">{time.split(' - ')[1]}</span>
                      </div>
                      
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 bg-background border border-foreground text-foreground rounded-full p-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  );
                })}

                {/* Aisle / Break Label */}
                <div className="col-span-1 md:col-span-3 flex items-center justify-center w-full my-2">
                  <div className="h-px bg-border flex-1"></div>
                  <span className="px-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">2 Hour Break Aisle</span>
                  <div className="h-px bg-border flex-1"></div>
                </div>

                {/* Second Row (After Break) */}
                {DAILY_TIMES.slice(3, 6).map((time) => {
                  const isAvailable = currentDaySlots.includes(time);
                  const isSelected = selectedTime === time;
                  return (
                    <button
                      key={time}
                      disabled={!isAvailable}
                      onClick={() => setSelectedTime(time)}
                      className={`relative w-32 h-16 rounded-t-xl rounded-b-md border-2 flex items-center justify-center transition-all duration-300 group ${
                        !isAvailable 
                          ? 'bg-border/50 border-border cursor-not-allowed opacity-50'
                          : isSelected
                            ? 'bg-foreground border-foreground text-background shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                            : 'bg-background border-border hover:border-foreground/70 text-foreground'
                      }`}
                    >
                      {/* Seat Armrests aesthetic */}
                      <div className={`absolute top-2 -left-1 w-1 h-8 rounded-full ${isSelected ? 'bg-background/20' : 'bg-foreground/10'}`}></div>
                      <div className={`absolute top-2 -right-1 w-1 h-8 rounded-full ${isSelected ? 'bg-background/20' : 'bg-foreground/10'}`}></div>
                      
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-[10px] font-medium tracking-widest opacity-80">{time.split(' - ')[0]}</span>
                        <span className="text-xs font-bold">{time.split(' - ')[1]}</span>
                      </div>
                      
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 bg-background border border-foreground text-foreground rounded-full p-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-12 flex justify-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-border bg-background"></div>
                  <span className="text-xs font-medium uppercase text-muted-foreground tracking-wider">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-foreground bg-foreground"></div>
                  <span className="text-xs font-medium uppercase text-muted-foreground tracking-wider">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-border bg-border/50 opacity-50"></div>
                  <span className="text-xs font-medium uppercase text-muted-foreground tracking-wider">Occupied</span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex justify-between items-center pt-6 border-t border-border mt-8">
              <div className="text-sm font-medium text-muted-foreground">
                {selectedTime ? (
                  <span>Selected: <span className="text-foreground font-bold">{selectedTime}</span></span>
                ) : (
                  <span>Please select a seat</span>
                )}
              </div>
              <button
                onClick={handleBookNow}
                disabled={!selectedTime}
                className="px-8 py-3 bg-foreground text-background font-bold uppercase tracking-wider text-sm rounded-md hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Continue to Booking
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

