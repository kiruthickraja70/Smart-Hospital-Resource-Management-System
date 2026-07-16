import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import AlertMessage from '../components/AlertMessage';
import LoadingSpinner from '../components/LoadingSpinner';

const BookAppointment = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ doctor: '', date: '', time: '', reason: '', notes: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/doctors', { params: { availability: 'available' } })
      .then(({ data }) => setDoctors(data.data))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile?._id) {
      setError('Patient profile not found. Please contact admin.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api.post('/appointments', { ...form, patient: profile._id });
      navigate('/appointments');
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <h2 className="fw-bold mb-4"><i className="bi bi-plus-circle me-2"></i>Book Appointment</h2>
        <AlertMessage message={error} onClose={() => setError('')} />
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Select Doctor *</label>
                <select className="form-select form-select-lg" value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })} required>
                  <option value="">Choose a doctor...</option>
                  {doctors.map((d) => (
                    <option key={d._id} value={d._id}>Dr. {d.name} - {d.department} ({d.specialization})</option>
                  ))}
                </select>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Date *</label>
                  <input type="date" className="form-control form-control-lg" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required min={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Time *</label>
                  <input type="time" className="form-control form-control-lg" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Reason for Visit *</label>
                <input type="text" className="form-control" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} required placeholder="e.g., Regular checkup, Follow-up" />
              </div>
              <div className="mb-4">
                <label className="form-label">Additional Notes</label>
                <textarea className="form-control" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows="3" />
              </div>
              <button type="submit" className="btn btn-primary btn-lg w-100" disabled={submitting}>
                {submitting ? 'Booking...' : 'Book Appointment'}
              </button>
              <p className="text-muted small text-center mt-3 mb-0">A confirmation email will be sent upon booking.</p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
