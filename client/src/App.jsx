import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ChatProvider } from './context/ChatContext.jsx';
import Login from './components/Auth/Login.jsx';
import Signup from './components/Auth/Signup.jsx';
import ChatContainer from './components/Chat/ChatContainer.jsx';
import ProtectedRoute from './components/Layout/ProtectedRoute.jsx';
import Layout from './components/Layout/Layout.jsx';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ChatProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<ChatContainer />} />
              </Route>
            </Route>
          </Routes>
        </ChatProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;