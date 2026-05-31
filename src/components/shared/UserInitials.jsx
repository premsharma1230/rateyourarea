import { getUserInitials } from "@/lib/user-display";
import styles from "./UserInitials.module.scss";

export default function UserInitials({
  name,
  email,
  size = "md",
  className = "",
}) {
  const initials = getUserInitials(name, email);

  return (
    <span
      className={`${styles.avatar} ${styles[size]} ${className}`}
      aria-hidden
    >
      {initials}
    </span>
  );
}
