import AnonymousReviewForm from "@/components/forms/AnonymousReviewForm";

import styles from "./page.module.scss";

export const metadata = {
  title: "Submit Anonymous Review | RateYourArea",
  description: "Share your area experience anonymously. No account required.",
};

export default function ReviewPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Share Your Experience</h1>
        <p className={styles.subtitle}>
          Help others make informed decisions about where to live.
        </p>
      </div>
      <AnonymousReviewForm />
    </div>
  );
}
