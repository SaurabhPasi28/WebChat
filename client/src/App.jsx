import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ChatProvider } from './context/ChatContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import ProtectedRoute from './components/Layout/ProtectedRoute.jsx';
import Layout from './components/Layout/Layout.jsx';
import { Spinner } from './components/Spinner.jsx';

// Lazy load components for better performance
const Login = lazy(() => import('./components/Auth/Login.jsx'));
const Signup = lazy(() => import('./components/Auth/Signup.jsx'));
const ChatContainer = lazy(() => import('./components/Chat/ChatContainer.jsx'));

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <ChatProvider>
            <Suspense fallback={<Spinner />}>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                
                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<Layout />}>
                    <Route index element={<ChatContainer />} />
                    <Route path="/chat" element={<ChatContainer />} />
                  </Route>
                </Route>
              </Routes>
            </Suspense>
          </ChatProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;