import Navbar from './Navbar'
import { Bitcount_Grid_Single } from "next/font/google";

const bitcount = Bitcount_Grid_Single({
  subsets: ["latin"],
  weight: ["300","400"],
});

const Landing = () => {
  return (
    <div className="w-full h-screen bg-[url('/landing-page.jpg')] bg-cover bg-center relative">
      <Navbar />
      <section
        className={`${bitcount.className} absolute bottom-20 left-0 px-6 md:px-12 lg:px-16`}
      >
        <h1
          className="bitcount-heading font-bold md:mb-2"
          style={{ fontSize: "clamp(3rem, 8vw, 6rem)" }}
        >
          Pingu
        </h1>
        <p
          className="bitcount-caption"
          style={{ fontSize: "clamp(0.875rem, 2.5vw, 1.875rem)" }}
        >
          From strangers to friends
        </p>
      </section>
    </div>
  );
};

export default Landing
