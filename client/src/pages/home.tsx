
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/layout/sidebar";

export default function Home() {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    setLocation("/partners");
  }, [setLocation]);
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h1 className="text-2xl font-bold text-center">Partner Management</h1>
            <p className="mt-2 text-center text-gray-500">Redirecting to partners page...</p>
          </div>
        </div>
      </main>
    </div>
  );
}
