import { useSelector } from 'react-redux'
import { Navigate } from 'react-router';

const ProtectedRoute = ({ children, role }) => {
    const { token, user } = useSelector((state) => state.auth);

    if (!token) { 
        return <Navigate to='/login' replace />;
     }
    if (role && user?.role !== role) { 
        return <Navigate to='/' replace /> 
    }

    return children;

}

export default ProtectedRoute;