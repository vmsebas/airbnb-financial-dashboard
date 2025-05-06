import React from 'react';
import { Header } from './Header';
import { SideNav } from './SideNav';
import { MobileNav } from './MobileNav';
import { GlobalFilters } from '../filters/GlobalFilters';

interface MainLayoutProps {
  children: React.ReactNode;
  showFilters?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, showFilters = true }) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex flex-col md:flex-row">
        <SideNav />
        <div className="flex-1 flex flex-col min-h-screen">
          <Header />
          <div className="flex items-center px-4 py-2 md:hidden">
            <h1 className="text-lg font-bold flex-1 text-foreground">Airbnb Financial Insights</h1>
            <MobileNav />
          </div>
          <main className="flex-1 p-2 sm:p-4">
            {showFilters && <GlobalFilters />}
            <div className="mt-4">
              {children}
            </div>
          </main>
          <footer className="bg-card border-t border-border p-4 text-center text-sm text-muted-foreground">
            Airbnb Financial Insights {new Date().getFullYear()}
          </footer>
        </div>
      </div>
    </div>
  );
};
