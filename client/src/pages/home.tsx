import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    // Redirect to partners page
    setLocation("/partners");
  }, [setLocation]);
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-center">Partner Management</h1>
        <p className="mt-2 text-center text-gray-500">Redirecting to partners page...</p>
      </div>
    </div>
  );
}
