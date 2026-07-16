import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import AlertMessage from '../components/AlertMessage';
import LoadingSpinner from '../components/LoadingSpinner';

const DEPARTMENTS = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Medicine', 'Emergency', 'ICU', 'Surgery', 'Radiology'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const Patients = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [form, setForm] = useState({});
  const [historyForm, setHistoryForm] = useState({ condition: '', diagnosis: '', treatment: '', notes: '' });
  const [message, setMessage] = useState({ text: '', type: 'danger' });
  const [editMode, setEditMode] = useState(false);

  useEffect(() => { fetchPatients(); }, [search]);

  const fetchPatients = async () => {
    try {
      const { data } = await api.get('/patients', { params: { search } });
      setPatients(data.data);
    } catch (err) {
      setMessage({ text: 'Failed to load patients', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setForm({ name: '', email: '', phone: '', gender: 'male', bloodGroup: 'O+', address: '' });
    setEditMode(false);
    setShowModal(true);
  };

  const openEdit = (patient) => {
    setForm({ ...patient, dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.split('T')[0] : '' });
    setSelectedPatient(patient);
    setEditMode(true);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await api.put(`/patients/${selectedPatient._id}`, form);
        setMessage({ text: 'Patient updated successfully', type: 'success' });
      } else {
        await api.post('/patients', form);
        setMessage({ text: 'Patient created successfully', type: 'success' });
      }
      setShowModal(false);
      fetchPatients();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Operation failed', type: 'danger' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this patient?')) return;
    try {
      await api.delete(`/patients/${id}`);
      setMessage({ text: 'Patient deleted', type: 'success' });
      fetchPatients();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Delete failed', type: 'danger' });
    }
  };

  const openHistory = (patient) => {
    setSelectedPatient(patient);
    setHistoryForm({ condition: '', diagnosis: '', treatment: '', notes: '' });
    setShowHistoryModal(true);
  };

  const addHistory = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/patients/${selectedPatient._id}/medical-history`, historyForm);
      setMessage({ text: 'Medical history added', type: 'success' });
      setShowHistoryModal(false);
      fetchPatients();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to add history', type: 'danger' });
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0"><i className="bi bi-people me-2"></i>Patient Management</h2>
        {isAdmin && <button className="btn btn-primary" onClick={openCreate}><i className="bi bi-plus-lg me-1"></i>Add Patient</button>}
      </div>
      <AlertMessage message={message.text} type={message.type} onClose={() => setMessage({ text: '', type: 'danger' })} />
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="input-group">
            <span className="input-group-text"><i className="bi bi-search"></i></span>
            <input type="text" className="form-control" placeholder="Search by name, email, or phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </div>
      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr><th>Name</th><th>Email</th><th>Phone</th><th>Blood Group</th><th>Gender</th><th>History</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p._id}>
                  <td className="fw-semibold">{p.name}</td>
                  <td>{p.email}</td>
                  <td>{p.phone}</td>
                  <td><span className="badge bg-danger">{p.bloodGroup || 'N/A'}</span></td>
                  <td>{p.gender || 'N/A'}</td>
                  <td><span className="badge bg-secondary">{p.medicalHistory?.length || 0} records</span></td>
                  <td>
                    <button className="btn btn-sm btn-outline-info me-1" onClick={() => openHistory(p)} title="Medical History"><i className="bi bi-journal-medical"></i></button>
                    {isAdmin && (
                      <>
                        <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(p)}><i className="bi bi-pencil"></i></button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p._id)}><i className="bi bi-trash"></i></button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header"><h5 className="modal-title">{editMode ? 'Edit Patient' : 'Add Patient'}</h5><button className="btn-close" onClick={() => setShowModal(false)}></button></div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3"><label className="form-label">Name *</label><input className="form-control" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                    <div className="col-md-6 mb-3"><label className="form-label">Email *</label><input type="email" className="form-control" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
                    <div className="col-md-6 mb-3"><label className="form-label">Phone *</label><input className="form-control" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></div>
                    <div className="col-md-6 mb-3"><label className="form-label">Date of Birth</label><input type="date" className="form-control" value={form.dateOfBirth || ''} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} /></div>
                    <div className="col-md-6 mb-3"><label className="form-label">Gender</label><select className="form-select" value={form.gender || 'male'} onChange={(e) => setForm({ ...form, gender: e.target.value })}><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
                    <div className="col-md-6 mb-3"><label className="form-label">Blood Group</label><select className="form-select" value={form.bloodGroup || 'O+'} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}>{BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}</select></div>
                    <div className="col-12 mb-3"><label className="form-label">Address</label><textarea className="form-control" value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} rows="2" /></div>
                  </div>
                </div>
                <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">{editMode ? 'Update' : 'Create'}</button></div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showHistoryModal && selectedPatient && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header"><h5 className="modal-title">Medical History - {selectedPatient.name}</h5><button className="btn-close" onClick={() => setShowHistoryModal(false)}></button></div>
              <div className="modal-body">
                {selectedPatient.medicalHistory?.length > 0 && (
                  <div className="mb-4">
                    {selectedPatient.medicalHistory.map((h) => (
                      <div key={h._id} className="border rounded p-3 mb-2">
                        <strong>{h.condition}</strong> <small className="text-muted">({new Date(h.date).toLocaleDateString()})</small>
                        <p className="mb-1 small"><strong>Diagnosis:</strong> {h.diagnosis}</p>
                        <p className="mb-0 small"><strong>Treatment:</strong> {h.treatment}</p>
                      </div>
                    ))}
                  </div>
                )}
                <h6>Add New Record</h6>
                <form onSubmit={addHistory}>
                  <div className="mb-3"><label className="form-label">Condition *</label><input className="form-control" value={historyForm.condition} onChange={(e) => setHistoryForm({ ...historyForm, condition: e.target.value })} required /></div>
                  <div className="mb-3"><label className="form-label">Diagnosis</label><input className="form-control" value={historyForm.diagnosis} onChange={(e) => setHistoryForm({ ...historyForm, diagnosis: e.target.value })} /></div>
                  <div className="mb-3"><label className="form-label">Treatment</label><input className="form-control" value={historyForm.treatment} onChange={(e) => setHistoryForm({ ...historyForm, treatment: e.target.value })} /></div>
                  <div className="mb-3"><label className="form-label">Notes</label><textarea className="form-control" value={historyForm.notes} onChange={(e) => setHistoryForm({ ...historyForm, notes: e.target.value })} rows="2" /></div>
                  <button type="submit" className="btn btn-primary">Add Record</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;
