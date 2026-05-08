import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm as useReactForm } from 'react-hook-form';
import axios from 'axios';

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
      setTimeout(() => navigate('/bookings'), 2000);
    } catch (error: any) {
      if (error.response?.status === 409) {
        setErrorMsg('This slot was just booked by someone else. Please choose another slot.');
      } else {
        setErrorMsg(error.response?.data?.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!expert || !date || !timeSlot) {
    return <div className="p-8 text-center text-slate-500">Loading booking details...</div>;
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center animate-in zoom-in duration-500">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Booking Confirmed!</h2>
        <p className="text-slate-600 mb-6">Your session with {expert.name} has been successfully scheduled.</p>
        <p className="text-sm text-slate-400">Redirecting to your bookings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Complete your booking</h1>
        
        <div className="bg-blue-50/50 rounded-2xl p-6 mb-8 border border-blue-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600 mb-1">Session with</p>
            <p className="text-lg font-bold text-slate-900">{expert.name}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-blue-600 mb-1">Date & Time</p>
            <p className="text-md font-bold text-slate-900">{date} <br/> <span className="text-slate-600 font-medium">{timeSlot}</span></p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm font-medium flex items-start gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input
              {...register('userName', { required: 'Name is required' })}
              className={`w-full px-4 py-3 rounded-xl border ${errors.userName ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'} outline-none transition-all`}
              placeholder="John Doe"
            />
            {errors.userName && <p className="text-red-500 text-xs mt-1">{errors.userName.message}</p>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                {...register('userEmail', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
                className={`w-full px-4 py-3 rounded-xl border ${errors.userEmail ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'} outline-none transition-all`}
                placeholder="john@example.com"
              />
              {errors.userEmail && <p className="text-red-500 text-xs mt-1">{errors.userEmail.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input
                {...register('userPhone', { required: 'Phone is required' })}
                className={`w-full px-4 py-3 rounded-xl border ${errors.userPhone ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'} outline-none transition-all`}
                placeholder="+1 234 567 8900"
              />
              {errors.userPhone && <p className="text-red-500 text-xs mt-1">{errors.userPhone.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
            <textarea
              {...register('notes')}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all h-24 resize-none"
              placeholder="Any specific topics you want to discuss?"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-70 flex justify-center items-center gap-2"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            {loading ? 'Confirming...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}
