
import './App.css';

import { useNavigate, Routes, Route} from 'react-router-dom'
import { useAuth } from './contexts/AuthContext';
import { useEffect, Suspense } from 'react';

/* Pages */
import LoginPage from './pages/login';
import DashboardPage from './pages/dashboard';
import LoadingPage from './pages/loading';
/* */


const PublicRoute = ({ children }) => {
  return children;
}

const PrivateRoute = ({ children }) => {
  const { authenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authenticated) {
      navigate('/login/');
      return;
    }
  })

  return children
}

const AuthRoute = ({ children }) => {
  const { authenticated } = useAuth();
  const navig = useNavigate();
  console.log("Authenticated: ", authenticated);

  useEffect(() => {
    if (authenticated) {
      navig('/dashboard/');
      return;
    }
  })

  return children;
}

function AppContent() {
  const { authenticated, setAuthenticated } = useAuth();
  useEffect(() => {
    async function validateToken(token) {
      await fetch('http://localhost:8000/api/verify-token/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Session-Token': token,
        }
        
      }).then(response => {
        if (response.ok) {
          setAuthenticated(true);
          console.log("Token valid");

          console.log("Authenticated2: ", authenticated);
        } else {
          console.log(response.json());
          setAuthenticated(false);
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('username');
        }
      })
    }

    const token = sessionStorage.getItem('token');
    if (token) {
      // Validate token with backend 
      validateToken(token);
    }
  })

  return (
    <div className="App">
        <Routes>
          <Route path="" element={
              <PublicRoute>
                hi
              </PublicRoute>
          } ></Route>

          <Route path="/login/" element ={
              <AuthRoute>
                <Suspense fallback={<LoadingPage />}>
                  <LoginPage />
                </Suspense>
              </AuthRoute>
          } />


          <Route path="/dashboard/" element = {
              <PrivateRoute>
                <Suspense fallback={<LoadingPage />}>
                  <DashboardPage />
                </Suspense>
              </PrivateRoute>
          } />
        </Routes>
    </div>
  );
}

function App () {
  return (
      <AppContent />
  )
}

export default App;
