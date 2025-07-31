import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Lock,
  Users
} from 'lucide-react';

interface MessageToggleProps {
  mode: 'internal' | 'external';
  onModeChange: (mode: 'internal' | 'external') => void;
  internalCount?: number;
  externalCount?: number;
}

export function MessageToggle({ 
  mode, 
  onModeChange, 
  internalCount = 0, 
  externalCount = 0 
}: MessageToggleProps) {
  return (
    <div className="flex items-center bg-gray-100 rounded-lg p-1">
      <Button
        variant={mode === 'internal' ? 'default' : 'ghost'}
        size="sm"
        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
          mode === 'internal' 
            ? 'bg-white shadow-sm border text-gray-900' 
            : 'text-gray-600 hover:text-gray-900'
        }`}
        onClick={() => onModeChange('internal')}
      >
        <Lock className="w-4 h-4" />
        <span className="text-sm font-medium">Internal Notes</span>
        {internalCount > 0 && (
          <Badge 
            variant={mode === 'internal' ? 'secondary' : 'outline'} 
            className="text-xs h-5 px-1.5"
          >
            {internalCount}
          </Badge>
        )}
      </Button>
      
      <Button
        variant={mode === 'external' ? 'default' : 'ghost'}
        size="sm"
        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
          mode === 'external' 
            ? 'bg-white shadow-sm border text-gray-900' 
            : 'text-gray-600 hover:text-gray-900'
        }`}
        onClick={() => onModeChange('external')}
      >
        <Users className="w-4 h-4" />
        <span className="text-sm font-medium">External Messages</span>
        {externalCount > 0 && (
          <Badge 
            variant={mode === 'external' ? 'secondary' : 'outline'} 
            className="text-xs h-5 px-1.5"
          >
            {externalCount}
          </Badge>
        )}
      </Button>
    </div>
  );
}