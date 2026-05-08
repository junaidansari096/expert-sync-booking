import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useForm as useReactForm } from 'react-hook-form';
import axios from 'axios';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { CheckCircle2, AlertCircle, CalendarDays, Clock, ArrowLeft, Loader2, User, Mail, Phone, FileText } from 'lucide-react';
import { cn } from '../lib/utils';

type BookingFormValues = {
  userName: string;
  userEmail: string;
  userPhone: string;
  notes: string;
};

export default function Booking() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const date = searchParams.get('date');
  const timeSlot = searchParams.get('time');
  const navigate = useNavigate();

  const [expert, setExpert] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const container = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const { register, handleSubmit, formState: { errors } } = useReactForm<BookingFormValues>();

  useEffect(() => {
    const fetchExpert = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/experts/${id}`);
        setExpert(data);
      } catch (error) {
        console.error('Error fetching expert', error);
      }
    };
    if (id) fetchExpert();
  }, [id]);

  useGSAP(() => {
    if (expert && date && timeSlot && !success) {
      gsap.fromTo('.booking-element',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
      );
    }
  }, { dependencies: [expert, success], scope: container });

  const onSubmit = async (data: BookingFormValues) => {
    setLoading(true);
    setErrorMsg('');
    try {
      await axios.post('http://localhost:5000/api/bookings', {
        expertId: id,
        date,
        timeSlot,
        ...data,
      });
      setSuccess(true);
      
      // Success animation
      gsap.fromTo('.success-card', 
        { scale: 0.95, opacity: 0, y: 20 }, 
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
      
      setTimeout(() => navigate('/bookings'), 2500);
    } catch (error: any) {
      if (error.response?.status === 409) {
        setErrorMsg('This slot was just booked by someone else. Please choose another slot.');
      } else {
        setErrorMsg(error.response?.data?.message || 'Something went wrong. Please try again.');
      }
      
      // Error shake animation
      if (formRef.current) {
        gsap.fromTo(formRef.current,
          { x: -5 },
          { x: 0, duration: 0.4, ease: "rough({ template: power0.none, strength: 1, points: 15, taper: none, randomize: true, clamp: false })", clearProps: "x" }
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (!expert || !date || !timeSlot) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-foreground" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-12 minimal-card p-10 text-center relative overflow-hidden success-card">
        <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold mb-3 tracking-tight text-foreground">Confirmed!</h2>
        <p className="text-muted-foreground mb-8 text-lg">Your session with <span className="text-foreground font-semibold">{expert.name}</span> is scheduled.</p>
        <div className="flex items-center justify-center gap-2 text-sm text-foreground font-medium animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin" />
          Redirecting...
        </div>
      </div>
    );
  }

  return (
    <div ref={container} className="max-w-3xl mx-auto pb-12 pt-6">
      <Link to={`/expert/${expert._id}`} className="booking-element inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group font-medium text-sm">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Expert Profile
      </Link>
      
      <div className="booking-element minimal-card p-8 md:p-10">
        <h1 className="text-3xl font-extrabold tracking-tight mb-8 text-foreground">Secure your spot</h1>
        
        <div className="bg-secondary rounded-xl p-6 mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-xl tracking-tight flex-shrink-0">
              {expert.name.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
                Session with
              </p>
              <p className="text-lg font-bold text-foreground">{expert.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6 md:text-right w-full md:w-auto">
            <div className="flex-1 md:flex-none">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-0.5 flex items-center gap-1.5 md:justify-end">
                <CalendarDays className="w-3.5 h-3.5" />
                Date
              </p>
              <p className="text-base font-bold text-foreground">{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
            <div className="w-px h-10 bg-border hidden md:block" />
            <div className="flex-1 md:flex-none">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-0.5 flex items-center gap-1.5 md:justify-end">
                <Clock className="w-3.5 h-3.5" />
                Time
              </p>
              <p className="text-base font-bold text-foreground">{timeSlot}</p>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="booking-element mb-8 p-4 bg-destructive/10 text-destructive rounded-md border border-destructive/20 text-sm font-medium flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {errorMsg}
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="booking-element">
            <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              Full Name
            </label>
            <input
              {...register('userName', { required: 'Name is required' })}
              className={cn(
                "w-full px-4 py-3 rounded-md border bg-transparent placeholder:text-muted-foreground outline-none transition-all duration-200",
                errors.userName ? "border-destructive focus:ring-1 focus:ring-destructive" : "border-border hover:border-foreground/50 focus:border-foreground focus:ring-1 focus:ring-foreground"
              )}
              placeholder="e.g. Jane Smith"
            />
            {errors.userName && <p className="text-destructive text-xs mt-2 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.userName.message}</p>}
          </div>
          
          <div className="booking-element grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                Email Address
              </label>
              <input
                type="email"
                {...register('userEmail', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email format' } })}
                className={cn(
                  "w-full px-4 py-3 rounded-md border bg-transparent placeholder:text-muted-foreground outline-none transition-all duration-200",
                  errors.userEmail ? "border-destructive focus:ring-1 focus:ring-destructive" : "border-border hover:border-foreground/50 focus:border-foreground focus:ring-1 focus:ring-foreground"
                )}
                placeholder="jane@example.com"
              />
              {errors.userEmail && <p className="text-destructive text-xs mt-2 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.userEmail.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                Phone Number
              </label>
              <input
                {...register('userPhone', { required: 'Phone is required' })}
                className={cn(
                  "w-full px-4 py-3 rounded-md border bg-transparent placeholder:text-muted-foreground outline-none transition-all duration-200",
                  errors.userPhone ? "border-destructive focus:ring-1 focus:ring-destructive" : "border-border hover:border-foreground/50 focus:border-foreground focus:ring-1 focus:ring-foreground"
                )}
                placeholder="+1 (555) 000-0000"
              />
              {errors.userPhone && <p className="text-destructive text-xs mt-2 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.userPhone.message}</p>}
            </div>
          </div>

          <div className="booking-element">
            <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              Notes (Optional)
            </label>
            <textarea
              {...register('notes')}
              className="w-full px-4 py-3 rounded-md border border-border bg-transparent placeholder:text-muted-foreground focus:border-foreground focus:ring-1 focus:ring-foreground outline-none transition-all duration-200 h-28 resize-none hover:border-foreground/50"
              placeholder="Tell the expert what you'd like to focus on during this session..."
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="booking-element w-full py-3.5 px-4 bg-foreground hover:bg-foreground/90 text-background rounded-md font-semibold transition-all duration-200 disabled:opacity-70 flex justify-center items-center gap-2 mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : null}
            <span>{loading ? 'Processing...' : 'Confirm Session Booking'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
