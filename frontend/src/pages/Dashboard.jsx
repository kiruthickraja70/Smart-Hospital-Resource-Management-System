import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState(null);
  const [bedStats, setBedStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const promises = [api.get('/beds/stats')];
      if (user.role !== 'patient') {
        promises.push(api.get('/analytics/dashboard'));
      }
      if (user.role === 'patient' && profile?._id) {
        promises.push(api.get(`/appointments?patient=${profile._id}&status=scheduled`));
      } else if (user.role !== 'patient') {
        promises.push(api.get('/appointments?status=scheduled'));
      }

      const results = await Promise.all(promises);
      setBedStats(results[0].data.data);
      if (user.role !== 'patient') {
        setStats(results[1].data.data);
        setAppointments(results[2]?.data.data?.slice(0, 5) || []);
      } else {
        setAppointments(results[1]?.data.data?.slice(0, 5) || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Welcome, {user.name}</h2>
          <p className="text-muted mb-0">Smart Hospital Resource Management Dashboard</p>
        </div>
        <span className="badge bg-primary fs-6 px-3 py-2">{user.role.toUpperCase()}</span>
      </div>

      {stats && (
        <div className="row">
          <StatCard title="Total Patients" value={stats.totalPatients} icon="bi-people-fill" color="primary" />
          <StatCard title="Total Doctors" value={stats.totalDoctors} icon="bi-person-badge-fill" color="success" />
          <StatCard title="Appointments" value={stats.totalAppointments} icon="bi-calendar-check-fill" color="info" />
          <StatCard title="Prescriptions" value={stats.totalPrescriptions} icon="bi-file-medical-fill" color="warning" />
        </div>
      )}

      {bedStats && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-0 pt-3">
                <h5 className="mb-0"><i className="bi bi-hospital me-2"></i>Bed Occupancy Overview</h5>
              </div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-md-3">
                    <h3 className="text-primary">{bedStats.total}</h3>
                    <small className="text-muted">Total Beds</small>
                  </div>
                  <div className="col-md-3">
                    <h3 className="text-success">{bedStats.available}</h3>
                    <small className="text-muted">Available</small>
                  </div>
                  <div className="col-md-3">
                    <h3 className="text-danger">{bedStats.occupied}</h3>
                    <small className="text-muted">Occupied</small>
                  </div>
                  <div className="col-md-3">
                    <h3 className="text-warning">{bedStats.occupancyRate}%</h3>
                    <small className="text-muted">Occupancy Rate</small>
                  </div>
                </div>
                <div className="progress mt-3" style={{ height: '10px' }}>
                  <div className="progress-bar bg-danger" style={{ width: `${bedStats.occupancyRate}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center pt-3">
          <h5 className="mb-0"><i className="bi bi-calendar-event me-2"></i>Upcoming Appointments</h5>
          <Link to="/appointments" className="btn btn-sm btn-outline-primary">View All</Link>
        </div>
        <div className="card-body p-0">
          {appointments.length === 0 ? (
            <p className="text-muted text-center py-4">No upcoming appointments</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((apt) => (
                    <tr key={apt._id}>
                      <td>{apt.patient?.name || user.name}</td>
                      <td>{apt.doctor?.name}</td>
                      <td>{new Date(apt.date).toLocaleDateString()}</td>
                      <td>{apt.time}</td>
                      <td><span className="badge bg-primary">{apt.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
