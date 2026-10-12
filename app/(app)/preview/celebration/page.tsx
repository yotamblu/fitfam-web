import { notFound } from "next/navigation";
import CelebrationPreview from "@/components/app/CelebrationPreview";

// A development-only page to try the reward screen and its sounds without finishing a real workout.
export default function CelebrationPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <CelebrationPreview />;
}
