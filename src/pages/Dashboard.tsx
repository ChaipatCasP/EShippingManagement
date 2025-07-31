import { useLocation } from 'react-router-dom';
import { DashboardContainer } from '../containers/DashboardContainer';

export default function Dashboard() {
  const location = useLocation();
  
  // Get completion state from navigation state
  const state = location.state as any;
  const createdPSTNumber = state?.createdPSTNumber || null;
  const createdPSWNumber = state?.createdPSWNumber || null;
  const pstCompleted = state?.pstCompleted || false;
  const pswCompleted = state?.pswCompleted || false;

  return (
    <DashboardContainer
      createdPSTNumber={createdPSTNumber}
      createdPSWNumber={createdPSWNumber}
      pstCompleted={pstCompleted}
      pswCompleted={pswCompleted}
    />
  );
}
