const LoadingSpinner = ({ text = 'Loading...' }) => (
  <div className="text-center py-5">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">{text}</span>
    </div>
    <p className="mt-2 text-muted">{text}</p>
  </div>
);

export default LoadingSpinner;
