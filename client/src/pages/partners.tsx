import { Sidebar } from "@/components/layout/sidebar";
import { PartnerList } from "@/components/partners/partner-list";

export default function Partners() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden bg-gray-50">
        <PartnerList />
      </main>
    </div>
  );
}
