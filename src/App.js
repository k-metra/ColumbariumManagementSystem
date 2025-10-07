
import './App.css';

import { useNavigate, BrowserRouter, Routes, Route} from 'react-router-dom'
import { useAuth } from './contexts/AuthContext';
import { AuthProvider } from './contexts/AuthContext';

/* Pages */
import LoginPage from './pages/login';
import RegisterPage from './pages/register';
import DashboardPage from './pages/dashboard';
/* */


const PublicRoute = ({ children }) => {
  return children;
}

const PrivateRoute = ({ children }) => {
  const { authenticated } = useAuth();

}

const AuthRoute = ({ children }) => {
  const { authenticated } = useAuth();

  return !authenticated ? children : <p>No</p>
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="" element={
              <PublicRoute>
                hi
              </PublicRoute>
          } ></Route>

          <Route path="/login/" element ={
            <AuthProvider>
              <AuthRoute>
                <LoginPage />
              </AuthRoute>
            </AuthProvider>
          } />


          <Route path="/dashboard/" element = {
            <AuthProvider>
                <DashboardPage />
            </AuthProvider>
          } />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
