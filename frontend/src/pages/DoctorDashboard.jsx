import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/StatCard';

const DoctorDashboard = () => {
  const { profile } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?._id) {
      api.get(`/appointments/doctor/${profile._id}/dashboard`)
        .then(({ data }) => setData(data.data))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [profile]);

  if (loading) return <LoadingSpinner />;
  if (!profile) return <div className="alert alert-warning">Doctor profile not found.</div>;

  return (
    <div>
      <h2 className="fw-bold mb-4"><i className="bi bi-clipboard2-pulse me-2"></i>Doctor Appointment Dashboard</h2>
      <div className="row mb-4">
        <StatCard title="Today's Appointments" value={data?.todayAppointments?.length || 0} icon="bi-calendar-day" color="primary" />
        <StatCard title="Upcoming" value={data?.upcoming?.length || 0} icon="bi-calendar-week" color="info" />
        <StatCard title="Completed" value={data?.stats?.completed || 0} icon="bi-check-circle" color="success" />
        <StatCard title="Cancelled" value={data?.stats?.cancelled || 0} icon="bi-x-circle" color="danger" />
      </div>

      <div className="row">
        <div className="col-lg-6 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 pt-3"><h5 className="mb-0 text-primary"><i className="bi bi-calendar-day me-2"></i>Today's Schedule</h5></div>
            <div className="card-body p-0">
              {!data?.todayAppointments?.length ? (
                <p className="text-muted text-center py-4">No appointments today</p>
              ) : (
                <div className="list-group list-group-flush">
                  {data.todayAppointments.map((apt) => (
                    <div key={apt._id} className="list-group-item">
                      <div className="d-flex justify-content-between">
                        <div>
                          <strong>{apt.time}</strong> - {apt.patient?.name}
                          <br /><small className="text-muted">{apt.reason}</small>
                        </div>
                        <span className="badge bg-primary align-self-center">{apt.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="col-lg-6 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 pt-3"><h5 className="mb-0 text-info"><i className="bi bi-calendar-week me-2"></i>Upcoming Appointments</h5></div>
            <div className="card-body p-0">
              {!data?.upcoming?.length ? (
                <p className="text-muted text-center py-4">No upcoming appointments</p>
              ) : (
                <div className="list-group list-group-flush">
                  {data.upcoming.map((apt) => (
                    <div key={apt._id} className="list-group-item">
                      <div className="d-flex justify-content-between">
                        <div>
                          <strong>{new Date(apt.date).toLocaleDateString()}</strong> at {apt.time}
                          <br />{apt.patient?.name} - <small className="text-muted">{apt.reason}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
