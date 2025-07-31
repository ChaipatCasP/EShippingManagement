import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreatePSTForm } from '../components/CreatePSTForm';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { Button } from '../components/ui/button';
import { CheckCircle, Building, ArrowRight } from 'lucide-react';

export function PSTFormContainer() {
  const { poNumber } = useParams<{ poNumber?: string }>();
  const navigate = useNavigate();
  
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingData, setPendingData] = useState<any>(null);
  const [createdPSTNumber, setCreatedPSTNumber] = useState<string | null>(null);

  const generatePSTNumber = () => {
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PST-${new Date().getFullYear()}-${random}`;
  };

  const handleClose = () => {
    navigate('/dashboard');
  };

  const handleSubmit = async (data: any) => {
    console.log('PST Form submitted:', data);
    setPendingData(data);
    setShowConfirmDialog(true);
    return Promise.resolve();
  };

  const handleConfirmSubmit = async () => {
    try {
      const newPSTNumber = generatePSTNumber();
      setCreatedPSTNumber(newPSTNumber);
      
      console.log('Processing PST data:', pendingData);
      
      setShowConfirmDialog(false);
      setPendingData(null);
      
      // Navigate to dashboard with PST completion state
      setTimeout(() => {
        navigate('/dashboard', { 
          state: { 
            createdPSTNumber: newPSTNumber, 
            pstCompleted: true 
          } 
        });
      }, 1500);
      
    } catch (error) {
      console.error('Error processing PST:', error);
    }
  };

  const handleConfirmCancel = () => {
    setShowConfirmDialog(false);
    setPendingData(null);
  };

  return (
    <>
      <CreatePSTForm
        poNumber={poNumber}
        importDeclarationRef="ID-2025-7890"
        createdPSTNumber={createdPSTNumber}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
      
      {/* PST Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-lg bg-white">
          <AlertDialogHeader className="bg-white">
            <AlertDialogTitle className="flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              Confirm PST Submission
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              You are about to submit your PST (Prepare for Shipping Tax) request. Please review the details before confirming.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {pendingData && (
            <div className="px-6 pb-4 bg-white">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">PO Number:</span>
                  <span className="font-medium">{poNumber || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Supplier:</span>
                  <span className="font-medium">{pendingData.supplierName}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Invoice No:</span>
                  <span className="font-medium">{pendingData.invoiceNo}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Currency:</span>
                  <span className="font-medium">{pendingData.currency}</span>
                </div>
                {pendingData.expenseSummary && pendingData.expenseSummary.total > 0 && (
                  <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200">
                    <span className="text-gray-600">Total Tax & Expenses:</span>
                    <span className="font-semibold text-green-600">
                      {pendingData.expenseSummary.total.toFixed(2)} {pendingData.currency}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg mt-3">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>After submission, you will be redirected to the dashboard where you can track your PST status.</span>
              </div>
            </div>
          )}
          
          <AlertDialogFooter className="flex gap-2 bg-white border-t border-gray-100 pt-4">
            <Button
              variant="outline"
              onClick={handleConfirmCancel}
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <AlertDialogAction
              onClick={handleConfirmSubmit}
              className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
            >
              <span>Confirm & Submit</span>
              <ArrowRight className="w-4 h-4" />
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
