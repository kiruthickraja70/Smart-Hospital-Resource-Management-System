import { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/StatCard';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [departments, setDepartments] = useState(null);
  const [bedStats, setBedStats] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAnalytics(); }, [year]);

  const fetchAnalytics = async () => {
    try {
      const [dash, monthlyRes, dept, beds] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/analytics/monthly', { params: { year } }),
        api.get('/analytics/departments'),
        api.get('/beds/stats'),
      ]);
      setStats(dash.data.data);
      setMonthly(monthlyRes.data.data);
      setDepartments(dept.data.data);
      setBedStats(beds.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const bedChartData = {
    labels: ['Available', 'Occupied'],
    datasets: [{ data: [bedStats?.available || 0, bedStats?.occupied || 0], backgroundColor: ['#198754', '#dc3545'], borderWidth: 0 }],
  };

  const categoryLabels = Object.keys(bedStats?.byCategory || {});
  const bedCategoryData = {
    labels: categoryLabels,
    datasets: [
      { label: 'Available', data: categoryLabels.map((c) => bedStats.byCategory[c]?.available || 0), backgroundColor: '#198754' },
      { label: 'Occupied', data: categoryLabels.map((c) => bedStats.byCategory[c]?.occupied || 0), backgroundColor: '#dc3545' },
    ],
  };

  const monthlyData = {
    labels: monthly?.monthly?.map((m) => m.month) || [],
    datasets: [
      { label: 'Scheduled', data: monthly?.monthly?.map((m) => m.scheduled) || [], backgroundColor: '#0d6efd' },
      { label: 'Completed', data: monthly?.monthly?.map((m) => m.completed) || [], backgroundColor: '#198754' },
      { label: 'Cancelled', data: monthly?.monthly?.map((m) => m.cancelled) || [], backgroundColor: '#dc3545' },
    ],
  };

  const deptData = {
    labels: departments?.doctorsByDept?.map((d) => d._id) || [],
    datasets: [{ label: 'Doctors', data: departments?.doctorsByDept?.map((d) => d.count) || [], backgroundColor: '#6610f2' }],
  };

  const apptStatusData = {
    labels: stats?.appointmentStats?.map((s) => s._id) || [],
    datasets: [{ data: stats?.appointmentStats?.map((s) => s.count) || [], backgroundColor: ['#0d6efd', '#198754', '#dc3545', '#ffc107'] }],
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0"><i className="bi bi-graph-up me-2"></i>Analytics Dashboard</h2>
        <select className="form-select w-auto" value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
          {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="row mb-4">
        <StatCard title="Total Patients" value={stats?.totalPatients || 0} icon="bi-people-fill" color="primary" />
        <StatCard title="Total Doctors" value={stats?.totalDoctors || 0} icon="bi-person-badge-fill" color="success" />
        <StatCard title="Total Appointments" value={stats?.totalAppointments || 0} icon="bi-calendar-check-fill" color="info" />
        <StatCard title="Bed Occupancy" value={`${bedStats?.occupancyRate || 0}%`} icon="bi-hospital-fill" color="warning" subtitle={`${bedStats?.occupied}/${bedStats?.total} beds`} />
      </div>

      <div className="row mb-4">
        <div className="col-md-6 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0"><h6 className="mb-0">Bed Occupancy</h6></div>
            <div className="card-body d-flex justify-content-center"><div style={{ maxWidth: 250 }}><Doughnut data={bedChartData} options={{ plugins: { legend: { position: 'bottom' } } }} /></div></div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0"><h6 className="mb-0">Appointment Status</h6></div>
            <div className="card-body d-flex justify-content-center"><div style={{ maxWidth: 250 }}><Doughnut data={apptStatusData} options={{ plugins: { legend: { position: 'bottom' } } }} /></div></div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-12 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0"><h6 className="mb-0">Monthly Appointments Report ({year})</h6></div>
            <div className="card-body"><Bar data={monthlyData} options={{ responsive: true, plugins: { legend: { position: 'top' } }, scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } } }} /></div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0"><h6 className="mb-0">Beds by Category</h6></div>
            <div className="card-body"><Bar data={bedCategoryData} options={{ responsive: true, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true } } }} /></div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0"><h6 className="mb-0">Doctors by Department</h6></div>
            <div className="card-body"><Bar data={deptData} options={{ responsive: true, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true } } }} /></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
