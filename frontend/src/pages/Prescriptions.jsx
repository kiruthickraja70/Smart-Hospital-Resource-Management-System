import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { generatePrescriptionPDF } from '../utils/generatePDF';
import AlertMessage from '../components/AlertMessage';
import LoadingSpinner from '../components/LoadingSpinner';

const emptyMed = { name: '', dosage: '', frequency: '', duration: '', instructions: '' };

const Prescriptions = () => {
  const { user, profile } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ patient: '', doctor: '', diagnosis: '', medications: [{ ...emptyMed }], notes: '', followUpDate: '' });
  const [message, setMessage] = useState({ text: '', type: 'danger' });

  useEffect(() => { fetchData(); }, [profile]);

  const fetchData = async () => {
    try {
      const params = {};
      if (user.role === 'patient' && profile?._id) params.patient = profile._id;
      if (user.role === 'doctor' && profile?._id) params.doctor = profile._id;

      const promises = [api.get('/prescriptions', { params })];
      if (user.role !== 'patient') promises.push(api.get('/patients'));
      if (user.role === 'admin') promises.push(api.get('/doctors'));

      const results = await Promise.all(promises);
      setPrescriptions(results[0].data.data);
      if (user.role !== 'patient') setPatients(results[1]?.data.data || []);
      if (user.role === 'admin') setDoctors(results[2]?.data.data || []);
    } catch {
      setMessage({ text: 'Failed to load prescriptions', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setForm({
      patient: '',
      doctor: user.role === 'doctor' ? profile?._id || '' : '',
      diagnosis: '',
      medications: [{ ...emptyMed }],
      notes: '',
      followUpDate: '',
    });
    setShowModal(true);
  };

  const addMedication = () => {
    setForm({ ...form, medications: [...form.medications, { ...emptyMed }] });
  };

  const updateMedication = (index, field, value) => {
    const meds = [...form.medications];
    meds[index][field] = value;
    setForm({ ...form, medications: meds });
  };

  const removeMedication = (index) => {
    if (form.medications.length <= 1) return;
    setForm({ ...form, medications: form.medications.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/prescriptions', form);
      setMessage({ text: 'Prescription created', type: 'success' });
      setShowModal(false);
      fetchData();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to create', type: 'danger' });
    }
  };

  const handleDownload = async (id) => {
    try {
      const { data } = await api.get(`/prescriptions/${id}`);
      generatePrescriptionPDF(data.data);
    } catch {
      setMessage({ text: 'Failed to download PDF', type: 'danger' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this prescription?')) return;
    try {
      await api.delete(`/prescriptions/${id}`);
      setMessage({ text: 'Prescription deleted', type: 'success' });
      fetchData();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Delete failed', type: 'danger' });
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0"><i className="bi bi-file-medical me-2"></i>Prescriptions</h2>
        {(user.role === 'admin' || user.role === 'doctor') && (
          <button className="btn btn-primary" onClick={openCreate}><i className="bi bi-plus-lg me-1"></i>Create Prescription</button>
        )}
      </div>
      <AlertMessage message={message.text} type={message.type} onClose={() => setMessage({ text: '', type: 'danger' })} />

      <div className="row">
        {prescriptions.length === 0 ? (
          <div className="col-12"><div className="alert alert-info">No prescriptions found</div></div>
        ) : prescriptions.map((rx) => (
          <div key={rx._id} className="col-md-6 col-lg-4 mb-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between mb-2">
                  <small className="text-muted">{new Date(rx.createdAt).toLocaleDateString()}</small>
                  <span className="badge bg-primary">{rx.medications?.length} meds</span>
                </div>
                <h6 className="fw-bold">{rx.patient?.name}</h6>
                <p className="small text-muted mb-1">Dr. {rx.doctor?.name}</p>
                <p className="small mb-2"><strong>Diagnosis:</strong> {rx.diagnosis}</p>
                <ul className="small mb-3">
                  {rx.medications?.slice(0, 2).map((m, i) => (
                    <li key={i}>{m.name} - {m.dosage}</li>
                  ))}
                  {rx.medications?.length > 2 && <li>+{rx.medications.length - 2} more...</li>}
                </ul>
                <div className="d-flex gap-1">
                  <button className="btn btn-sm btn-outline-primary flex-grow-1" onClick={() => handleDownload(rx._id)}>
                    <i className="bi bi-download me-1"></i>PDF
                  </button>
                  {(user.role === 'admin' || user.role === 'doctor') && (
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(rx._id)}><i className="bi bi-trash"></i></button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header"><h5 className="modal-title">Create Prescription</h5><button className="btn-close" onClick={() => setShowModal(false)}></button></div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Patient *</label>
                      <select className="form-select" value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })} required>
                        <option value="">Select patient...</option>
                        {patients.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                      </select>
                    </div>
                    {user.role === 'admin' && (
                      <div className="col-md-6">
                        <label className="form-label">Doctor *</label>
                        <select className="form-select" value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })} required>
                          <option value="">Select doctor...</option>
                          {doctors.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Diagnosis *</label>
                    <textarea className="form-control" value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} required rows="2" />
                  </div>
                  <h6>Medications</h6>
                  {form.medications.map((med, i) => (
                    <div key={i} className="border rounded p-3 mb-2">
                      <div className="row">
                        <div className="col-md-6 mb-2"><input className="form-control form-control-sm" placeholder="Medicine name *" value={med.name} onChange={(e) => updateMedication(i, 'name', e.target.value)} required /></div>
                        <div className="col-md-6 mb-2"><input className="form-control form-control-sm" placeholder="Dosage *" value={med.dosage} onChange={(e) => updateMedication(i, 'dosage', e.target.value)} required /></div>
                        <div className="col-md-4 mb-2"><input className="form-control form-control-sm" placeholder="Frequency *" value={med.frequency} onChange={(e) => updateMedication(i, 'frequency', e.target.value)} required /></div>
                        <div className="col-md-4 mb-2"><input className="form-control form-control-sm" placeholder="Duration *" value={med.duration} onChange={(e) => updateMedication(i, 'duration', e.target.value)} required /></div>
                        <div className="col-md-4 mb-2"><input className="form-control form-control-sm" placeholder="Instructions" value={med.instructions} onChange={(e) => updateMedication(i, 'instructions', e.target.value)} /></div>
                      </div>
                      {form.medications.length > 1 && (
                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeMedication(i)}>Remove</button>
                      )}
                    </div>
                  ))}
                  <button type="button" className="btn btn-sm btn-outline-primary mb-3" onClick={addMedication}><i className="bi bi-plus me-1"></i>Add Medication</button>
                  <div className="mb-3"><label className="form-label">Notes</label><textarea className="form-control" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows="2" /></div>
                  <div className="mb-3"><label className="form-label">Follow-up Date</label><input type="date" className="form-control" value={form.followUpDate} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} /></div>
                </div>
                <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create Prescription</button></div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prescriptions;
