import styles from "../listing.module.scss";
import blogStyles from "./page.module.scss";

const posts = [
  {
    title: "Area Guides",
    desc: "Deep dives into Gurugram's most talked-about localities.",
  },
  {
    title: "Flat Buying Tips",
    desc: "What to check before signing that agreement.",
  },
  {
    title: "Tenant Rights India",
    desc: "Know your rights as a renter in Indian cities.",
  },
  {
    title: "Builder News",
    desc: "RERA updates, delays, and builder track records.",
  },
];

export const metadata = {
  title: "Blog | RateYourArea",
};

export default function BlogPage() {
  return (
    <div className={`${styles.page} hidden`}>
      <header className={styles.header}>
        <h1 className={styles.title}>Blog</h1>
        <p className={styles.subtitle}>
          Guides, tips, and news for smarter real estate decisions.
        </p>
      </header>
      <div className={blogStyles.posts}>
        {posts.map((post) => (
          <article key={post.title} className={blogStyles.post}>
            <h2>{post.title}</h2>
            <p>{post.desc}</p>
            <span className={blogStyles.coming}>Coming soon</span>
          </article>
        ))}
      </div>
    </div>
  );
}
