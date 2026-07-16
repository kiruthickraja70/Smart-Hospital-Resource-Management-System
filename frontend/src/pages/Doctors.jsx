import { useEffect, useState } from 'react';
import api from '../services/api';
import AlertMessage from '../components/AlertMessage';
import LoadingSpinner from '../components/LoadingSpinner';

const DEPARTMENTS = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Medicine', 'Emergency', 'ICU', 'Surgery', 'Radiology'];

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: 'danger' });

  useEffect(() => { fetchDoctors(); }, [search, filterDept]);

  const fetchDoctors = async () => {
    try {
      const { data } = await api.get('/doctors', { params: { search, department: filterDept } });
      setDoctors(data.data);
    } catch {
      setMessage({ text: 'Failed to load doctors', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setForm({ name: '', email: '', phone: '', specialization: '', department: 'General Medicine', availability: 'available', experience: 0, qualification: '' });
    setEditMode(false);
    setShowModal(true);
  };

  const openEdit = (doc) => {
    setForm({ ...doc });
    setSelectedId(doc._id);
    setEditMode(true);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await api.put(`/doctors/${selectedId}`, form);
        setMessage({ text: 'Doctor updated', type: 'success' });
      } else {
        await api.post('/doctors', form);
        setMessage({ text: 'Doctor created', type: 'success' });
      }
      setShowModal(false);
      fetchDoctors();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Operation failed', type: 'danger' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this doctor?')) return;
    try {
      await api.delete(`/doctors/${id}`);
      setMessage({ text: 'Doctor deleted', type: 'success' });
      fetchDoctors();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Delete failed', type: 'danger' });
    }
  };

  const availabilityBadge = (status) => {
    const map = { available: 'success', unavailable: 'secondary', on_leave: 'warning' };
    return <span className={`badge bg-${map[status] || 'secondary'}`}>{status?.replace('_', ' ')}</span>;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0"><i className="bi bi-person-badge me-2"></i>Doctor Management</h2>
        <button className="btn btn-primary" onClick={openCreate}><i className="bi bi-plus-lg me-1"></i>Add Doctor</button>
      </div>
      <AlertMessage message={message.text} type={message.type} onClose={() => setMessage({ text: '', type: 'danger' })} />
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-8">
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-search"></i></span>
                <input type="text" className="form-control" placeholder="Search doctors..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="col-md-4">
              <select className="form-select" value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
                <option value="">All Departments</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        {doctors.map((doc) => (
          <div key={doc._id} className="col-md-6 col-lg-4 mb-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-person-badge fs-4 text-primary"></i>
                  </div>
                  {availabilityBadge(doc.availability)}
                </div>
                <h5 className="fw-bold">{doc.name}</h5>
                <p className="text-muted small mb-1">{doc.specialization}</p>
                <span className="badge bg-info mb-2">{doc.department}</span>
                <p className="small mb-1"><i className="bi bi-envelope me-1"></i>{doc.email}</p>
                <p className="small mb-1"><i className="bi bi-telephone me-1"></i>{doc.phone}</p>
                {doc.experience > 0 && <p className="small text-muted">{doc.experience} years experience</p>}
                <div className="mt-3">
                  <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(doc)}><i className="bi bi-pencil"></i> Edit</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(doc._id)}><i className="bi bi-trash"></i></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header"><h5 className="modal-title">{editMode ? 'Edit Doctor' : 'Add Doctor'}</h5><button className="btn-close" onClick={() => setShowModal(false)}></button></div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3"><label className="form-label">Name *</label><input className="form-control" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                    <div className="col-md-6 mb-3"><label className="form-label">Email *</label><input type="email" className="form-control" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
                    <div className="col-md-6 mb-3"><label className="form-label">Phone *</label><input className="form-control" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></div>
                    <div className="col-md-6 mb-3"><label className="form-label">Specialization *</label><input className="form-control" value={form.specialization || ''} onChange={(e) => setForm({ ...form, specialization: e.target.value })} required /></div>
                    <div className="col-md-6 mb-3"><label className="form-label">Department *</label><select className="form-select" value={form.department || ''} onChange={(e) => setForm({ ...form, department: e.target.value })} required>{DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}</select></div>
                    <div className="col-md-6 mb-3"><label className="form-label">Availability</label><select className="form-select" value={form.availability || 'available'} onChange={(e) => setForm({ ...form, availability: e.target.value })}><option value="available">Available</option><option value="unavailable">Unavailable</option><option value="on_leave">On Leave</option></select></div>
                    <div className="col-md-6 mb-3"><label className="form-label">Experience (years)</label><input type="number" className="form-control" value={form.experience || 0} onChange={(e) => setForm({ ...form, experience: parseInt(e.target.value) })} min="0" /></div>
                    <div className="col-md-6 mb-3"><label className="form-label">Qualification</label><input className="form-control" value={form.qualification || ''} onChange={(e) => setForm({ ...form, qualification: e.target.value })} /></div>
                  </div>
                </div>
                <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">{editMode ? 'Update' : 'Create'}</button></div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctors;
