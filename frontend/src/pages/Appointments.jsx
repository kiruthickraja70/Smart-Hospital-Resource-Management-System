import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import AlertMessage from '../components/AlertMessage';
import LoadingSpinner from '../components/LoadingSpinner';

const Appointments = () => {
  const { user, profile } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [showReschedule, setShowReschedule] = useState(false);
  const [selected, setSelected] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({ date: '', time: '' });
  const [message, setMessage] = useState({ text: '', type: 'danger' });

  useEffect(() => { fetchAppointments(); }, [filter, profile]);

  const fetchAppointments = async () => {
    try {
      const params = {};
      if (filter) params.status = filter;
      if (user.role === 'patient' && profile?._id) params.patient = profile._id;
      if (user.role === 'doctor' && profile?._id) params.doctor = profile._id;
      const { data } = await api.get('/appointments', { params });
      setAppointments(data.data);
    } catch {
      setMessage({ text: 'Failed to load appointments', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await api.put(`/appointments/${id}/cancel`);
      setMessage({ text: 'Appointment cancelled. Email notification sent.', type: 'success' });
      fetchAppointments();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Cancel failed', type: 'danger' });
    }
  };

  const openReschedule = (apt) => {
    setSelected(apt);
    setRescheduleForm({ date: apt.date.split('T')[0], time: apt.time });
    setShowReschedule(true);
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/appointments/${selected._id}/reschedule`, rescheduleForm);
      setMessage({ text: 'Appointment rescheduled. Confirmation email sent.', type: 'success' });
      setShowReschedule(false);
      fetchAppointments();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Reschedule failed', type: 'danger' });
    }
  };

  const handleComplete = async (id) => {
    try {
      await api.put(`/appointments/${id}/complete`);
      setMessage({ text: 'Appointment marked as completed', type: 'success' });
      fetchAppointments();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed', type: 'danger' });
    }
  };

  const handleReminder = async (id) => {
    try {
      await api.post(`/appointments/${id}/reminder`);
      setMessage({ text: 'Reminder email sent', type: 'success' });
    } catch {
      setMessage({ text: 'Failed to send reminder', type: 'danger' });
    }
  };

  const statusBadge = (status) => {
    const map = { scheduled: 'primary', cancelled: 'danger', completed: 'success', rescheduled: 'warning' };
    return <span className={`badge bg-${map[status]}`}>{status}</span>;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0"><i className="bi bi-calendar-check me-2"></i>Appointments</h2>
        <select className="form-select w-auto" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="rescheduled">Rescheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <AlertMessage message={message.text} type={message.type} onClose={() => setMessage({ text: '', type: 'danger' })} />
      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr><th>Patient</th><th>Doctor</th><th>Department</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr><td colSpan="8" className="text-center text-muted py-4">No appointments found</td></tr>
              ) : appointments.map((apt) => (
                <tr key={apt._id}>
                  <td>{apt.patient?.name}</td>
                  <td>{apt.doctor?.name}</td>
                  <td><span className="badge bg-info">{apt.doctor?.department}</span></td>
                  <td>{new Date(apt.date).toLocaleDateString()}</td>
                  <td>{apt.time}</td>
                  <td>{apt.reason}</td>
                  <td>{statusBadge(apt.status)}</td>
                  <td>
                    {['scheduled', 'rescheduled'].includes(apt.status) && (
                      <>
                        <button className="btn btn-sm btn-outline-warning me-1" onClick={() => openReschedule(apt)} title="Reschedule"><i className="bi bi-arrow-repeat"></i></button>
                        <button className="btn btn-sm btn-outline-danger me-1" onClick={() => handleCancel(apt._id)} title="Cancel"><i className="bi bi-x-circle"></i></button>
                        {(user.role === 'admin' || user.role === 'doctor') && (
                          <>
                            <button className="btn btn-sm btn-outline-success me-1" onClick={() => handleComplete(apt._id)} title="Complete"><i className="bi bi-check-circle"></i></button>
                            <button className="btn btn-sm btn-outline-info" onClick={() => handleReminder(apt._id)} title="Send Reminder"><i className="bi bi-envelope"></i></button>
                          </>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showReschedule && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header"><h5 className="modal-title">Reschedule Appointment</h5><button className="btn-close" onClick={() => setShowReschedule(false)}></button></div>
              <form onSubmit={handleReschedule}>
                <div className="modal-body">
                  <div className="mb-3"><label className="form-label">New Date</label><input type="date" className="form-control" value={rescheduleForm.date} onChange={(e) => setRescheduleForm({ ...rescheduleForm, date: e.target.value })} required min={new Date().toISOString().split('T')[0]} /></div>
                  <div className="mb-3"><label className="form-label">New Time</label><input type="time" className="form-control" value={rescheduleForm.time} onChange={(e) => setRescheduleForm({ ...rescheduleForm, time: e.target.value })} required /></div>
                </div>
                <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowReschedule(false)}>Cancel</button><button type="submit" className="btn btn-primary">Reschedule</button></div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
