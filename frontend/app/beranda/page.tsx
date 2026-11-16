import type { Metadata } from "next";
import LandingPage from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "NutriTrack Jatim | Beranda Publik & Tata Kelola MBG",
  description:
    "Dari timbangan posyandu menjadi menu MBG yang tepat di hari yang sama. Sistem presisi intervensi stunting dan tata kelola gizi balita terpadu.",
};

export default function Page() {
  return <LandingPage />;
}
