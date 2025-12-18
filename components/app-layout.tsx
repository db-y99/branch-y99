import { Navbar } from "@/components/navbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex flex-col min-h-screen">
      <Navbar />
      <main className="container mx-auto max-w-[1400px] pt-8 px-4 sm:px-6 flex-grow pb-8">
        {children}
      </main>
    </div>
  );
}
