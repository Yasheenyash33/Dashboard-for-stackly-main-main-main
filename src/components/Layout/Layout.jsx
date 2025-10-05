import React from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export function Layout({ children }) {
  return (
    <div className="h-screen flex overflow-hidden bg-gray-900">
      <Sidebar />
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}