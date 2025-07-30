import React from 'react';
import { Badge } from './ui/badge';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
}

interface StepProgressProps {
  currentStep: 'pst' | 'psw';
  pstCompleted?: boolean;
}

export function StepProgress({ currentStep, pstCompleted = false }: StepProgressProps) {
  const steps: Step[] = [
    {
      id: 'pst',
      title: 'PST',
      description: 'Prepare for Shipping Tax',
      status: pstCompleted ? 'completed' : currentStep === 'pst' ? 'current' : 'upcoming'
    },
    {
      id: 'psw',
      title: 'PSW',
      description: 'Prepare for Shipping Weekly',
      status: currentStep === 'psw' ? 'current' : pstCompleted ? 'upcoming' : 'upcoming'
    }
  ];

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Workflow Progress</h2>
            <p className="text-sm text-gray-600">Complete each step to process your shipment</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center space-x-3">
                  {/* Step Icon */}
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    step.status === 'completed' 
                      ? 'bg-green-100 border-green-500 text-green-600'
                      : step.status === 'current'
                      ? 'bg-blue-100 border-blue-500 text-blue-600'
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}>
                    {step.status === 'completed' ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </div>
                  
                  {/* Step Info */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${
                        step.status === 'completed' 
                          ? 'text-green-700'
                          : step.status === 'current'
                          ? 'text-blue-700'
                          : 'text-gray-500'
                      }`}>
                        {step.title}
                      </span>
                      <Badge 
                        variant={
                          step.status === 'completed' ? 'default' :
                          step.status === 'current' ? 'secondary' : 'outline'
                        }
                        className={`text-xs ${
                          step.status === 'completed' ? 'bg-green-100 text-green-700' :
                          step.status === 'current' ? 'bg-blue-100 text-blue-700' : ''
                        }`}
                      >
                        {step.status === 'completed' ? 'Completed' :
                         step.status === 'current' ? 'In Progress' : 'Pending'}
                      </Badge>
                    </div>
                    <span className="text-sm text-gray-600">{step.description}</span>
                  </div>
                </div>
                
                {/* Arrow between steps */}
                {index < steps.length - 1 && (
                  <ArrowRight className={`w-5 h-5 ${
                    steps[index + 1].status === 'completed' || steps[index + 1].status === 'current'
                      ? 'text-blue-500'
                      : 'text-gray-300'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}