
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// Redirect based on user role
const Index = () => {
  const { role } = useAuth();
  
  if (role === 'admin') {
    return <Navigate to="/admin" replace />;
  } else if (role === 'user') {
    return <Navigate to="/user" replace />;
  } else {
    return <Navigate to="/login" replace />;
  }
};

export default Index;
