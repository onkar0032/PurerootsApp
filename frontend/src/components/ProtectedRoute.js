import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../App';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-8">
        <div className="glass rounded-2xl p-10 text-center max-w-md animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-pr-400 to-pr-600 flex items-center justify-center shadow-xl shadow-pr-500/30">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-display font-bold text-pr-800 mb-2">Authentication Required</h2>
          <p className="text-pr-500 mb-6">Please sign in to access this page.</p>
          <p className="text-sm text-pr-400">Use the Sign In button in the navigation bar above.</p>
        </div>
      </div>
    );
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-8">
        <div className="glass rounded-2xl p-10 text-center max-w-md animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-xl shadow-red-500/30">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h2 className="text-2xl font-display font-bold text-pr-800 mb-2">Access Denied</h2>
          <p className="text-pr-500 mb-6">You don't have permission to view this page.</p>
          <p className="text-sm text-pr-400">This area is restricted to <span className="font-semibold text-pr-700">{requiredRole}</span> accounts.</p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
