import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-8xl font-bold text-gray-200">404</p>
        <h2 className="mt-4 text-2xl font-bold text-gray-900">Page Not Found</h2>
        <p className="mt-2 text-gray-500">The page you're looking for doesn't exist.</p>
        <Link to="/dashboard" className="mt-6 inline-block btn-primary">Go to Dashboard</Link>
      </div>
    </div>
  );
}
