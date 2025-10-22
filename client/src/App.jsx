import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
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
            <Toaster
              position="top-right"
              toastOptions={{
                // Default options
                duration: 3000,
                style: {
                  background: 'var(--toast-bg, #fff)',
                  color: 'var(--toast-color, #333)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                },
                // Success
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                // Error
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
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