import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import BookAppointment from './pages/BookAppointment';
import DoctorDashboard from './pages/DoctorDashboard';
import Beds from './pages/Beds';
import Prescriptions from './pages/Prescriptions';
import Analytics from './pages/Analytics';

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/beds" element={<Beds />} />
            <Route path="/prescriptions" element={<Prescriptions />} />
          </Route>

          <Route element={<ProtectedRoute roles={['admin', 'doctor', 'patient']} />}>
            <Route path="/appointments" element={<Appointments />} />
          </Route>

          <Route element={<ProtectedRoute roles={['admin', 'doctor']} />}>
            <Route path="/patients" element={<Patients />} />
            <Route path="/analytics" element={<Analytics />} />
          </Route>

          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="/doctors" element={<Doctors />} />
          </Route>

          <Route element={<ProtectedRoute roles={['doctor']} />}>
            <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          </Route>

          <Route element={<ProtectedRoute roles={['patient']} />}>
            <Route path="/book-appointment" element={<BookAppointment />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
