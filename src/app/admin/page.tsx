import { LeadsTable } from "@/components/admin/LeadsTable";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-olive px-8 py-4 flex items-center justify-between">
        <span className="text-gold font-bold tracking-widest text-sm">
          OLIM PAVEWAY — ADMIN
        </span>
        <a
          href="/"
          className="text-cream/70 text-sm hover:text-gold transition-colors"
        >
          ← Navigator
        </a>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <LeadsTable />
      </main>
    </div>
  );
}
