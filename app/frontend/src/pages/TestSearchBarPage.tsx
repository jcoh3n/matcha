import { Header } from "@/components/layout/Header";

export default function TestSearchBar() {
  const handleLogout = () => {
    console.log("Logout clicked");
  };

  const handleNavigate = (page: string) => {
    console.log("Navigate to:", page);
  };

  return (
    <div className="min-h-screen w-full flex flex-col relative bg-background">
      <Header
        currentPage="search"
        notificationCount={3}
        messageCount={2}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
      />
      <div className="flex-1 w-full container mx-auto px-4 mt-20 mb-20 py-10 md:mb-0">
        <h1 className="text-2xl font-bold mb-4">Test de la barre de recherche</h1>
        <p>La barre de recherche devrait apparaître dans le header ci-dessus.</p>
      </div>
    </div>
  );
}