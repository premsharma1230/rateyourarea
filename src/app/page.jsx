import HeroSection from "@/components/home/HeroSection";
import TrendingAreas from "@/components/home/TrendingAreas";
import CommunityVoice from "@/components/home/CommunityVoice";
import HowItWorks from "@/components/home/HowItWorks";

import styles from "./page.module.scss";

export default function HomePage() {
  return (
    <div className={styles.page}>
      <HeroSection />
      <div className={styles.sections}>
        <TrendingAreas />
        <CommunityVoice />
        <HowItWorks />
      </div>
    </div>
  );
}
