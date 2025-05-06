import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { FilterProvider } from "./context/FilterContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import ApartmentDetail from "./pages/ApartmentDetail";
import BookingsPage from "./pages/BookingsPage";
import GuestsPage from "./pages/GuestsPage";
import FinancialPage from "./pages/FinancialPage";
import AirtableAnalyzer from "./pages/AirtableAnalyzer";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";

const queryClient = new QueryClient();

// Route Selector Component to redirect based on user role
const RoleBasedRoute = () => {
  const { role } = useAuth();
  
  return role === 'admin' ? 
    <Navigate to="/admin" replace /> : 
    <Navigate to="/user" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <FilterProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                
                {/* Root path redirects based on role */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <RoleBasedRoute />
                  </ProtectedRoute>
                } />
                
                {/* Admin Routes */}
                <Route path="/admin" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                
                {/* User Routes */}
                <Route path="/user" element={
                  <ProtectedRoute requiredRole="user">
                    <UserDashboard />
                  </ProtectedRoute>
                } />
                
                {/* Common Routes with Access Control */}
                <Route path="/apartment/:apartmentName" element={
                  <ProtectedRoute>
                    <ApartmentDetail />
                  </ProtectedRoute>
                } />
                
                {/* Admin Only Routes */}
                <Route path="/bookings" element={
                  <ProtectedRoute requiredRole="admin">
                    <BookingsPage />
                  </ProtectedRoute>
                } />
                <Route path="/guests" element={
                  <ProtectedRoute requiredRole="admin">
                    <GuestsPage />
                  </ProtectedRoute>
                } />
                <Route path="/financial" element={
                  <ProtectedRoute requiredRole="admin">
                    <FinancialPage />
                  </ProtectedRoute>
                } />
                <Route path="/analyze" element={
                  <ProtectedRoute requiredRole="admin">
                    <AirtableAnalyzer />
                  </ProtectedRoute>
                } />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </FilterProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
