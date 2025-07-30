import React from 'react';
import jagotaLogo from 'figma:asset/ff4cc62167f856df08ea3a5c273f5de4c69e10c7.png';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12 relative z-10">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          {/* Logo and Brand - Enhanced with larger logo */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img 
                src={jagotaLogo} 
                alt="JAGOTA" 
                className="h-10 w-auto object-contain drop-shadow-sm"
                style={{
                  filter: 'contrast(2) brightness(0.2)'
                }}
              />
            </div>
            <div className="text-lg font-semibold text-gray-900">
              JAGOTA eShipping
            </div>
          </div>

          {/* Simple Description */}


          {/* Powered By */}
          <div className="text-sm text-gray-500">
            Powered by Compass Softwares (Thailand) Ltd.
          </div>

          {/* Copyright */}
          <div className="text-xs text-gray-400 text-center">
            Copyright © 2000-2025. All rights reserved. Version 5Z013
          </div>

          {/* Simple Links */}
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>Enterprise Solution</span>
            <span>•</span>
            <span>24/7 Support</span>
            <span>•</span>
            <span>Thailand</span>
          </div>
        </div>
      </div>
    </footer>
  );
}