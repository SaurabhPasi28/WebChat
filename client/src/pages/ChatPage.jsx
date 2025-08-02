import { useAuth } from '../context/AuthContext.jsx';
import Layout from '../components/Layout/Layout.jsx';
import TestConnection from '../components/TestConnection.jsx';

export default function ChatPage() {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <div className="flex flex-col h-full">
        {/* Debug component - remove this in production */}
        <div className="mb-4">
          <TestConnection />
        </div>
      </div>
    </Layout>
  );
}