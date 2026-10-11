// A template (unlike a layout) mounts again on every navigation, so each tab change plays the entrance animation.
export default function TabsTemplate({ children }: { children: React.ReactNode }) {
  return <div className="ff-fade-in flex flex-1 flex-col gap-5">{children}</div>;
}
