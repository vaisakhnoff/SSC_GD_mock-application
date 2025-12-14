import React from 'react';
import Layout from './components/layout/Layout';
import Dashboard from './components/Dashboard';
import { useExamStore } from './store/useExamStore';
import ExamInterface from './components/ExamInterface'; // We'll create this next
import ResultAnalysis from './components/ResultAnalysis'; // We'll create this later

function App() {
  const { examStatus } = useExamStore();

  const renderContent = () => {
    switch (examStatus) {
      case 'active':
        return <ExamInterface />;
      case 'finished':
        return <ResultAnalysis />;
      case 'idle':
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout>
      {renderContent()}
    </Layout>
  );
}

export default App;
