import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">404 - ไม่พบหน้าที่ต้องการ</h1>
              <p className="text-gray-600 mt-2">
                ขออภัย ไม่พบหน้าที่คุณกำลังมองหา
              </p>
            </div>
            <div className="space-y-2">
              <Button 
                onClick={() => navigate('/dashboard')} 
                className="w-full"
              >
                กลับไป Dashboard
              </Button>
              <Button 
                onClick={() => navigate(-1)} 
                variant="outline" 
                className="w-full"
              >
                กลับหน้าก่อนหน้า
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
