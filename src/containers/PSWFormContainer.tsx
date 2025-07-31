import { useParams, useNavigate } from 'react-router-dom';
import { CreatePSWForm } from '../components/CreatePSWForm';

export function PSWFormContainer() {
  const { poNumber } = useParams<{ poNumber?: string }>();
  const navigate = useNavigate();

  const generatePSWNumber = () => {
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PSW-${new Date().getFullYear()}-${random}`;
  };

  const handleClose = () => {
    navigate('/dashboard');
  };

  const handleSubmit = async (data: any) => {
    console.log('PSW Form submitted:', data);
    
    const newPSWNumber = generatePSWNumber();
    
    // Navigate to dashboard with PSW completion state
    setTimeout(() => {
      navigate('/dashboard', { 
        state: { 
          createdPSWNumber: newPSWNumber, 
          pswCompleted: true 
        } 
      });
    }, 1500);
    
    return Promise.resolve();
  };

  return (
    <CreatePSWForm
      poNumber={poNumber}
      pstNumber="PST-2025-001" // In real app, get from state or API
      onClose={handleClose}
      onSubmit={handleSubmit}
    />
  );
}
