import Image from "next/image";
import type { MarketingImage } from "@/data/marketing-images";

export default function EditorialImage({
  image,
  priority = false,
  wide = false,
}: {
  image: MarketingImage;
  priority?: boolean;
  wide?: boolean;
}) {
  return (
    <figure
      className={`editorial-figure${wide ? " editorial-figure--wide" : ""}`}
    >
      <div className="editorial-image">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={
            wide
              ? "(min-width: 1280px) 1200px, 94vw"
              : "(min-width: 1024px) 480px, 94vw"
          }
          className="object-cover"
          style={
            image.position ? { objectPosition: image.position } : undefined
          }
          quality={80}
          priority={priority}
        />
      </div>
      <figcaption>{image.caption}</figcaption>
    </figure>
  );
}
