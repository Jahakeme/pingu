import { Inconsolata, Bitcount_Grid_Single } from "next/font/google";

export const inconsolata = Inconsolata({
  variable: "--font-inconsolata",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const bitcount = Bitcount_Grid_Single({
  subsets: ["latin"],
  weight: ["300", "400"],
});
