import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../Context/AuthContext';

const AdminRoutes = () => {
  const { user, loading } = useAuth();

 

  //  Wait for loading to complete
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl text-gray-700">Verifying admin access...</div>
        </div>
      </div>
    );
  }

  // After loading completes, check auth
  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoutes;