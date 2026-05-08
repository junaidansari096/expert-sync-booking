import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import ExpertDetail from './pages/ExpertDetail';
import Booking from './pages/Booking';
import MyBookings from './pages/MyBookings';

function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
                E
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600 tracking-tight">
                ExpertSync
              </span>
            </Link>
            <div className="flex space-x-8">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                Experts
              </Link>
              <Link
                to="/bookings"
                className={`text-sm font-medium transition-colors ${
                  location.pathname.startsWith('/bookings') ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                My Bookings
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
