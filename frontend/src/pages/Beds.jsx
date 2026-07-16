import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { getSocket } from '../services/socket';
import AlertMessage from '../components/AlertMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/StatCard';

const CATEGORIES = ['ICU', 'General', 'Emergency'];

const Beds = () => {
  const { user } = useAuth();
  const [beds, setBeds] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedBed, setSelectedBed] = useState(null);
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({ bedNumber: '', category: 'General', ward: '' });
  const [assignPatientId, setAssignPatientId] = useState('');
  const [message, setMessage] = useState({ text: '', type: 'danger' });
  const [liveUpdate, setLiveUpdate] = useState(false);

  const fetchBeds = useCallback(async () => {
    try {
      const [bedsRes, statsRes] = await Promise.all([
        api.get('/beds', { params: { category: filter } }),
        api.get('/beds/stats'),
      ]);
      setBeds(bedsRes.data.data);
      setStats(statsRes.data.data);
    } catch {
      setMessage({ text: 'Failed to load beds', type: 'danger' });
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchBeds();
    const socket = getSocket();
    socket.emit('joinBedDashboard');
    socket.on('bedUpdate', () => {
      setLiveUpdate(true);
      fetchBeds();
      setTimeout(() => setLiveUpdate(false), 2000);
    });
    return () => socket.off('bedUpdate');
  }, [fetchBeds]);

  useEffect(() => {
    if (user.role === 'admin') {
      api.get('/patients').then(({ data }) => setPatients(data.data));
    }
  }, [user.role]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/beds', form);
      setMessage({ text: 'Bed created', type: 'success' });
      setShowModal(false);
      fetchBeds();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed', type: 'danger' });
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/beds/${selectedBed._id}/assign`, { patientId: assignPatientId });
      setMessage({ text: 'Bed assigned', type: 'success' });
      setShowAssignModal(false);
      fetchBeds();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed', type: 'danger' });
    }
  };

  const handleRelease = async (id) => {
    if (!window.confirm('Release this bed?')) return;
    try {
      await api.put(`/beds/${id}/release`);
      setMessage({ text: 'Bed released', type: 'success' });
      fetchBeds();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed', type: 'danger' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this bed?')) return;
    try {
      await api.delete(`/beds/${id}`);
      setMessage({ text: 'Bed deleted', type: 'success' });
      fetchBeds();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed', type: 'danger' });
    }
  };

  const categoryColor = { ICU: 'danger', General: 'primary', Emergency: 'warning' };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0"><i className="bi bi-hospital me-2"></i>Bed Management</h2>
          {liveUpdate && <span className="badge bg-success animate-pulse"><i className="bi bi-broadcast me-1"></i>Live Update</span>}
        </div>
        <div className="d-flex gap-2">
          <select className="form-select w-auto" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {user.role === 'admin' && (
            <button className="btn btn-primary" onClick={() => { setForm({ bedNumber: '', category: 'General', ward: '' }); setShowModal(true); }}>
              <i className="bi bi-plus-lg me-1"></i>Add Bed
            </button>
          )}
        </div>
      </div>

      <AlertMessage message={message.text} type={message.type} onClose={() => setMessage({ text: '', type: 'danger' })} />

      {stats && (
        <div className="row mb-4">
          <StatCard title="Total Beds" value={stats.total} icon="bi-hospital" color="primary" />
          <StatCard title="Available" value={stats.available} icon="bi-check-circle" color="success" />
          <StatCard title="Occupied" value={stats.occupied} icon="bi-person-fill" color="danger" />
          <StatCard title="Occupancy Rate" value={`${stats.occupancyRate}%`} icon="bi-graph-up" color="warning" />
        </div>
      )}

      <div className="row">
        {beds.map((bed) => (
          <div key={bed._id} className="col-md-6 col-lg-4 col-xl-3 mb-4">
            <div className={`card border-0 shadow-sm h-100 ${bed.status === 'occupied' ? 'border-start border-danger border-4' : 'border-start border-success border-4'}`}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5 className="fw-bold mb-0">{bed.bedNumber}</h5>
                  <span className={`badge bg-${categoryColor[bed.category]}`}>{bed.category}</span>
                </div>
                <p className="text-muted small mb-2">{bed.ward}</p>
                <div className={`badge ${bed.status === 'available' ? 'bg-success' : 'bg-danger'} mb-2`}>
                  {bed.status === 'available' ? 'Available' : 'Occupied'}
                </div>
                {bed.patient && (
                  <p className="small mb-2"><i className="bi bi-person me-1"></i>{bed.patient.name}</p>
                )}
                {user.role === 'admin' && (
                  <div className="mt-2">
                    {bed.status === 'available' ? (
                      <button className="btn btn-sm btn-outline-primary w-100" onClick={() => { setSelectedBed(bed); setAssignPatientId(''); setShowAssignModal(true); }}>
                        <i className="bi bi-person-plus me-1"></i>Assign Patient
                      </button>
                    ) : (
                      <button className="btn btn-sm btn-outline-success w-100" onClick={() => handleRelease(bed._id)}>
                        <i className="bi bi-box-arrow-right me-1"></i>Release Bed
                      </button>
                    )}
                    <button className="btn btn-sm btn-outline-danger w-100 mt-1" onClick={() => handleDelete(bed._id)}>
                      <i className="bi bi-trash"></i> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header"><h5 className="modal-title">Add Bed</h5><button className="btn-close" onClick={() => setShowModal(false)}></button></div>
              <form onSubmit={handleCreate}>
                <div className="modal-body">
                  <div className="mb-3"><label className="form-label">Bed Number</label><input className="form-control" value={form.bedNumber} onChange={(e) => setForm({ ...form, bedNumber: e.target.value })} required placeholder="e.g., ICU-01" /></div>
                  <div className="mb-3"><label className="form-label">Category</label><select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
                  <div className="mb-3"><label className="form-label">Ward</label><input className="form-control" value={form.ward} onChange={(e) => setForm({ ...form, ward: e.target.value })} required placeholder="e.g., ICU Ward A" /></div>
                </div>
                <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create</button></div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showAssignModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header"><h5 className="modal-title">Assign Patient to {selectedBed?.bedNumber}</h5><button className="btn-close" onClick={() => setShowAssignModal(false)}></button></div>
              <form onSubmit={handleAssign}>
                <div className="modal-body">
                  <select className="form-select" value={assignPatientId} onChange={(e) => setAssignPatientId(e.target.value)} required>
                    <option value="">Select patient...</option>
                    {patients.map((p) => <option key={p._id} value={p._id}>{p.name} - {p.phone}</option>)}
                  </select>
                </div>
                <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Assign</button></div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Beds;
