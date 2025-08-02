import ChatContainer from '../Chat/ChatContainer.jsx';
import Header from './Header.jsx';
import { useState } from 'react';

export default function Layout({ children }) {
  const [isMobileListOpen, setIsMobileListOpen] = useState(false);
  console.log("--------->",isMobileListOpen)
  return (
    <div className="md:h-sceren bg-gray-50 dark:bg-dark-bg transition-colors duration-200">
      {/* <Header /> */}
      {/* <Header isMobileListOpen={isMobileListOpen} setIsMobileListOpen={setIsMobileListOpen} /> */}
      <main className="h-auto">
        {/* <ChatContainer /> */}
         <ChatContainer isMobileListOpen={isMobileListOpen} setIsMobileListOpen={setIsMobileListOpen} />
      </main>
    </div>
  );
}