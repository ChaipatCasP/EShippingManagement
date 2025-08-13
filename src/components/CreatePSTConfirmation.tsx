import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { FileText, AlertCircle } from 'lucide-react';

interface CreatePSTConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  poNumber: string;
}

export function CreatePSTConfirmation({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  poNumber
}: CreatePSTConfirmationProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <AlertDialogTitle className="text-lg font-semibold">
                Create PST Request
              </AlertDialogTitle>
            </div>
          </div>
        </AlertDialogHeader>
        
        <AlertDialogDescription className="text-sm text-gray-600 space-y-3">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-800">No existing PST found</p>
              <p className="text-amber-700 text-xs mt-1">
                PO <span className="font-mono font-medium">{poNumber}</span> does not have an existing PST document.
              </p>
            </div>
          </div>
          
          <p>
            Do you want to create a new PST (Prepare Shipping Tax) document for this purchase order?
          </p>
          
          <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
            <strong>What happens next:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>A new PST document will be created</li>
              <li>You'll be redirected to PST form to complete details</li>
              <li>Skip Step 1 and go directly to Step 2</li>
            </ul>
          </div>
        </AlertDialogDescription>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel 
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-600 hover:text-gray-800"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </div>
            ) : (
              'Yes, Create PST'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
