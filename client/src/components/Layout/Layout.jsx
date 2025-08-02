import ChatContainer from '../Chat/ChatContainer.jsx';
import Header from './Header.jsx';

export default function Layout({ children }) {
  return (
    <div className="md:h-sceren bg-gray-50 dark:bg-dark-bg transition-colors duration-200">
      <Header />
      <main className="h-auto">
        <ChatContainer />
      </main>
    </div>
  );
}