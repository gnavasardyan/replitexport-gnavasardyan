import { Sidebar } from "@/components/layout/sidebar";
import { PartnerList } from "@/components/partners/partner-list";
import { useLocation } from 'wouter'; // Assumed import for wouter routing
import { useNavigate } from 'react-router-dom'; //Assumed import for navigation


const BackButton = () => {
    const navigate = useNavigate();
    const [, setLocation] = useLocation();

    const handleBack = () => {
      navigate(-1); // Navigate back one step in history
    };

    return (
      <button onClick={handleBack} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Back to Main Menu
      </button>
    );
  };

export default function Partners() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <BackButton />
        <PartnerList />
      </main>
    </div>
  );
}