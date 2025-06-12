import ChatContainer from '../Chat/ChatContainer.jsx';
import Header from './Header.jsx';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen border-b-2 border-green-600 bg-gray-100">
      <Header />
      <ChatContainer/>
      {/* <main className="container mx-auto py-4">{children}</main> */}
    </div>
  );
}