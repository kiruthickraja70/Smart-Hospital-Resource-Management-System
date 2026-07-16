import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = {
  admin: [
    { path: '/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
    { path: '/patients', icon: 'bi-people', label: 'Patients' },
    { path: '/doctors', icon: 'bi-person-badge', label: 'Doctors' },
    { path: '/appointments', icon: 'bi-calendar-check', label: 'Appointments' },
    { path: '/beds', icon: 'bi-hospital', label: 'Bed Management' },
    { path: '/prescriptions', icon: 'bi-file-medical', label: 'Prescriptions' },
    { path: '/analytics', icon: 'bi-graph-up', label: 'Analytics' },
  ],
  doctor: [
    { path: '/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
    { path: '/patients', icon: 'bi-people', label: 'Patients' },
    { path: '/appointments', icon: 'bi-calendar-check', label: 'Appointments' },
    { path: '/doctor-dashboard', icon: 'bi-clipboard2-pulse', label: 'My Schedule' },
    { path: '/beds', icon: 'bi-hospital', label: 'Bed Status' },
    { path: '/prescriptions', icon: 'bi-file-medical', label: 'Prescriptions' },
    { path: '/analytics', icon: 'bi-graph-up', label: 'Analytics' },
  ],
  patient: [
    { path: '/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
    { path: '/appointments', icon: 'bi-calendar-check', label: 'My Appointments' },
    { path: '/book-appointment', icon: 'bi-plus-circle', label: 'Book Appointment' },
    { path: '/prescriptions', icon: 'bi-file-medical', label: 'My Prescriptions' },
    { path: '/beds', icon: 'bi-hospital', label: 'Bed Availability' },
  ],
};

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const items = navItems[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="d-flex">
      <aside className="sidebar bg-dark text-white vh-100 position-fixed" style={{ width: '260px', zIndex: 1000 }}>
        <div className="p-4 border-bottom border-secondary">
          <h5 className="mb-0 fw-bold">
            <i className="bi bi-heart-pulse-fill text-danger me-2"></i>
            Smart Hospital
          </h5>
          <small className="text-secondary">Resource Management</small>
        </div>
        <nav className="nav flex-column p-3">
          {items.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link text-white-50 mb-1 rounded ${location.pathname === item.path ? 'active bg-primary text-white' : ''}`}
            >
              <i className={`bi ${item.icon} me-2`}></i>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="position-absolute bottom-0 w-100 p-3 border-top border-secondary">
          <div className="d-flex align-items-center mb-2">
            <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: 36, height: 36 }}>
              <i className="bi bi-person-fill"></i>
            </div>
            <div>
              <div className="small fw-semibold">{user?.name}</div>
              <div className="text-secondary" style={{ fontSize: '0.75rem' }}>{user?.role?.toUpperCase()}</div>
            </div>
          </div>
          <button className="btn btn-outline-light btn-sm w-100" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-1"></i> Logout
          </button>
        </div>
      </aside>
      <main className="main-content flex-grow-1" style={{ marginLeft: '260px', minHeight: '100vh', background: '#f0f2f5' }}>
        <div className="p-4">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
