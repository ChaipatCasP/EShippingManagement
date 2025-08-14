import { Button } from './ui/button';
import { FileText, AlertCircle, X } from 'lucide-react';

interface CreatePSTConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  poNo?: string;
  poBook?: string;
  shipmentNo?: string;
  portOfDestination?: string;
}

export function CreatePSTConfirmation({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  poNo = '',
  poBook = '',
  shipmentNo = '',
  portOfDestination = ''
}: CreatePSTConfirmationProps) {
  console.log('🎭 CreatePSTConfirmation rendered:', { 
    isOpen, 
    poNo, 
    poBook, 
    shipmentNo, 
    portOfDestination 
  });

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          disabled={isLoading}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <FileText className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="text-lg font-semibold">Create PST</h2>
        </div>

        {/* Content */}
        <div className="text-sm text-gray-600 space-y-3 mb-6">
          <div className="space-y-2">
            <p>You are about to create a PST for shipment:</p>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="font-medium">PO No:</span> {poNo}
                </div>
                <div>
                  <span className="font-medium">Book:</span> {poBook}
                </div>
                <div>
                  <span className="font-medium">Shipment:</span> {shipmentNo}
                </div>
                <div>
                  <span className="font-medium">Destination:</span> {portOfDestination}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs">This action cannot be undone.</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </span>
            ) : (
              'Create PST'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
