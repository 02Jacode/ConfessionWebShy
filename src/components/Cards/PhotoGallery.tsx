import Image from "next/image";

type Props = {
  photos: string[];
  alt: string;
};

// Small landscape polaroids, slightly tilted, inside a card's popup
export function PhotoGallery({ photos, alt }: Props) {
  return (
    <div className="grid w-full grid-cols-1 gap-5 px-1 sm:grid-cols-2">
      {photos.map((src, i) => (
        <div
          key={src}
          className={`fade-up rounded-xl bg-white p-2 pb-6 shadow-md shadow-hibiscus/20 transition-all duration-300 hover:rotate-0 hover:scale-105 ${
            i % 2 ? "rotate-2" : "-rotate-2"
          }`}
          style={{ animationDelay: `${i * 0.15}s` }}
        >
          <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg">
            <Image
              src={src}
              alt={`${alt} photo ${i + 1}`}
              fill
              sizes="(max-width: 640px) 80vw, 200px"
              className="object-cover"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
