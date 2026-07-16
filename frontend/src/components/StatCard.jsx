const StatCard = ({ title, value, icon, color = 'primary', subtitle }) => (
  <div className="col-md-6 col-lg-3 mb-4">
    <div className="card border-0 shadow-sm h-100 stat-card">
      <div className="card-body d-flex align-items-center">
        <div className={`bg-${color} bg-opacity-10 rounded-3 p-3 me-3`}>
          <i className={`bi ${icon} fs-3 text-${color}`}></i>
        </div>
        <div>
          <h6 className="text-muted mb-1">{title}</h6>
          <h3 className="mb-0 fw-bold">{value}</h3>
          {subtitle && <small className="text-muted">{subtitle}</small>}
        </div>
      </div>
    </div>
  </div>
);

export default StatCard;
