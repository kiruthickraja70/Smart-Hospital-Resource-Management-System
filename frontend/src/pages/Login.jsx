import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AlertMessage from '../components/AlertMessage';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page min-vh-100 d-flex align-items-center" style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #6610f2 100%)' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <i className="bi bi-heart-pulse-fill text-primary fs-1"></i>
                  <h3 className="mt-2 fw-bold">Smart Hospital</h3>
                  <p className="text-muted">Sign in to your account</p>
                </div>
                <AlertMessage message={error} onClose={() => setError('')} />
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control form-control-lg" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                  </div>
                  <div className="mb-4">
                    <label className="form-label">Password</label>
                    <input type="password" className="form-control form-control-lg" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg w-100" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>
                <p className="text-center mt-4 mb-0">
                  Don't have an account? <Link to="/register">Register</Link>
                </p>
                <div className="mt-4 p-3 bg-light rounded small">
                  <strong>Demo Accounts:</strong><br />
                  Admin: admin@hospital.com / admin123<br />
                  Doctor: sarah@hospital.com / doctor123<br />
                  Patient: john@patient.com / patient123
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
