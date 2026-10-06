import { Gallery } from "@/components/Gallery";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Galerie",
  description:
    "Toutes les illustrations et séries manga générées par IA de NextSeed Manga, à filtrer par tag.",
  path: "/gallery",
});

export default function GalleryPage() {
  return <Gallery />;
}
