import { useSelector } from 'react-redux';
import { Navigate } from 'react-router';

function PublicRoute({ children }) {
  const token = useSelector((state) => state.auth.token);

  if (token) {
    return <Navigate to="/" />; // already logged in → go to dashboard
  }

  return children;
}

export default PublicRoute;