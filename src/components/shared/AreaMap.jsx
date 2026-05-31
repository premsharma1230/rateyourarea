"use client";

import dynamic from "next/dynamic";

const AreaMapInner = dynamic(() => import("./AreaMapInner"), {
  ssr: false,
  loading: () => (
    <div style={{ minHeight: 220, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.7 }}>
      Loading map…
    </div>
  ),
});

export default function AreaMap(props) {
  return <AreaMapInner {...props} />;
}
