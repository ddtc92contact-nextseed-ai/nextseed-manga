import { Gallery } from "@/components/Gallery";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Gallery",
  description:
    "Browse every AI-generated manga artwork and series from NextSeed Manga, filterable by tag.",
  path: "/gallery",
});

export default function GalleryPage() {
  return <Gallery />;
}
