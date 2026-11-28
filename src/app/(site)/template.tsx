/** Re-mounts on every navigation, giving each page a short ease-in like a native app. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-in">{children}</div>;
}
