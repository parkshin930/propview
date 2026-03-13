import { Header } from "@/components/Header";
import { HomeDashboard } from "@/components/HomeDashboard";
import { Footer } from "@/components/Footer";
import { PaybackButton } from "@/components/PaybackButton";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col dark:bg-[#0B1120]">
      <Header />
      <main className="flex-1 pt-0">
        <HomeDashboard />
      </main>
      <Footer />
      <PaybackButton />
    </div>
  );
}
