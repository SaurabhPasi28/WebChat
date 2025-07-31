// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { AuthProvider } from './context/AuthContext.jsx';
// import { ChatProvider } from './context/ChatContext.jsx';
// import Login from './components/Auth/Login.jsx';
// import Signup from './components/Auth/Signup.jsx';
// import ChatContainer from './components/Chat/ChatContainer.jsx';
// import ProtectedRoute from './components/Layout/ProtectedRoute.jsx';
// import Layout from './components/Layout/Layout.jsx';

// function App() {
//   return (
//     <Router>
//       <AuthProvider>
//         <ChatProvider>
//           <Routes>
//             <Route path="/login" element={<Login />} />
//             <Route path="/signup" element={<Signup />} />
//             <Route element={<ProtectedRoute />}>
//               <Route element={<Layout />}>
//                 <Route path="/" element={<ChatContainer />} />
//               </Route>
//             </Route>
//           </Routes>
//         </ChatProvider>
//       </AuthProvider>
//     </Router>
//   );
// }

// export default App;


import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ChatProvider } from './context/ChatContext.jsx';
import ProtectedRoute from './components/Layout/ProtectedRoute.jsx';
import Layout from './components/Layout/Layout.jsx';
import {Spinner} from './components/Spinner.jsx';
// import ErrorBoundary from './components/Common/ErrorBoundary.jsx';

// Lazy load components for better performance
const Login = lazy(() => import('./components/Auth/Login.jsx'));
const Signup = lazy(() => import('./components/Auth/Signup.jsx'));
const ChatContainer = lazy(() => import('./components/Chat/ChatContainer.jsx'));
const UserProfile = lazy(() => import('./components/Chat/UserProfile.jsx'));
// const NotFound = lazy(() => import('./components/Common/NotFound.jsx'));

function App() {
  return (
    <Router>
      {/* <ErrorBoundary> */}
        <AuthProvider>
          <ChatProvider>
            <Suspense fallback={<Spinner/>}>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                
                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<Layout />}>
                    <Route index element={<ChatContainer />} />
                    <Route path="/chat" element={<ChatContainer />} />
                    {/* <Route path="/profile" element={<UserProfile />} /> */}
                    {/* <Route path="/settings" element={<Settings />} /> */}
                  </Route>
                </Route>
                
                {/* 404 route */}
                {/* <Route path="*" element={<NotFound />} /> */}
              </Routes>
            </Suspense>
          </ChatProvider>
        </AuthProvider>
      {/* </ErrorBoundary> */}
    </Router>
  );
}

export default App;