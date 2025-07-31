// import jagotaLogo from 'figma:asset/ff4cc62167f856df08ea3a5c273f5de4c69e10c7.png';
import jagotaLogo from '../assets/img/jagota.jpg';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12 relative z-10">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          {/* Logo and Brand - Enhanced with JAGOTA logo */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-12 rounded-lg overflow-hidden bg-white shadow-sm border border-gray-200">
              <img 
                src={jagotaLogo} 
                alt="JAGOTA Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">
                JAGOTA eShipping
              </div>
              <div className="text-sm text-gray-600 -mt-1">
                Food Solutions for Professionals
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="text-center space-y-2">
            <div className="text-sm text-gray-600">
              Professional Import Management System
            </div>
            <div className="text-sm text-gray-500">
              Powered by Compass Softwares (Thailand) Ltd.
            </div>
          </div>

          {/* Copyright and Version */}
          <div className="text-center space-y-1">
            <div className="text-xs text-gray-400">
              Copyright © 2000-2025 JAGOTA. All rights reserved.
            </div>
            <div className="text-xs text-gray-400">
              Version 5Z013 | Enterprise Solution
            </div>
          </div>

          {/* Service Links */}
          <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
            <span className="hover:text-gray-700 cursor-pointer">24/7 Support</span>
            <span>•</span>
            <span className="hover:text-gray-700 cursor-pointer">Documentation</span>
            <span>•</span>
            <span className="hover:text-gray-700 cursor-pointer">Thailand Office</span>
            <span>•</span>
            <span className="hover:text-gray-700 cursor-pointer">Contact Us</span>
          </div>
        </div>
      </div>
    </footer>
  );
}