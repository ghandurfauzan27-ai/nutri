import type { Metadata } from "next";
import LandingPage from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "NutriTrack Jatim | Dari Timbangan Posyandu Menjadi Menu MBG Presisi",
  description:
    "Dari timbangan posyandu menjadi menu MBG yang tepat di hari yang sama. Sistem presisi intervensi stunting dan tata kelola gizi balita terpadu.",
};

export default function Page() {
  return <LandingPage />;
}
