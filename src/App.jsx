import { Route, BrowserRouter as Router, Routes } from "react-router";
import Home1 from "./Pages/main pages/Home1";
import './index.css'
import Resources from "./Pages/main pages/Resources";
import Login from "./Pages/login/Login";
import Mapview from "./Pages/main pages/Mapview";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./Pages/user/Profile";
import Userview from "./Pages/user/Userview";
import { useState } from "react";
import Preloader from "./components/Preloader";      
import PublicRoute from "./components/PublicRoute";
import 'react-loading-skeleton/dist/skeleton.css'
import { SkeletonTheme } from "react-loading-skeleton";
import Landing from "./Pages/main pages/Landing";
import { useSelector} from "react-redux";
import Signup from "./Pages/login/Signup";
import Carddetail from "./Pages/main pages/Card-Detail/Carddetail";
import AdminPanel from "./Pages/AdminPanel";

function App() {
  const [loading, setLoading] = useState(true);     
  const authUser = useSelector(s => s.auth?.user);

  return (
    <>
     
      {loading && <Preloader onDone={() => setLoading(false)} />}

      <SkeletonTheme baseColor="#111" highlightColor="#353333">
        <Router>
          <Routes>
            <Route
              index
              element={
                (authUser || localStorage.getItem("crh_landing_seen"))
                  ? <ProtectedRoute><Home1 /></ProtectedRoute>
                  : <Landing />
              }
            />

            <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
            <Route path='/login' element={<PublicRoute><Login /></PublicRoute>} />
            <Route path='/signup' element={<PublicRoute><Signup/></PublicRoute>} />
            <Route path="/map" element={<ProtectedRoute><Mapview /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/User-view" element={<ProtectedRoute><Userview /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute role='admin'><AdminPanel/></ProtectedRoute>} />
            <Route path="/resources/:id" element={<Carddetail />} />
          </Routes>
          {/* <BottomNav /> */}
        </Router>
      </SkeletonTheme>
    </>
  );
}

export default App; 
