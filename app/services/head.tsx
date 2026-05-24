export default function Head() {
  const title = "Services | AI Automation, Full-Stack Builds, Cybersecurity & More — Leo The Tech Guy";
  const description = "We build AI automation systems, full-stack web platforms, cybersecurity infrastructure, and social media systems for SMEs, startups, enterprises, and individuals. No templates — custom-engineered for your business.";
  const url = "https://leothetechguy.com/services";
  const image = "https://leothetechguy.com/images/og-cover.svg";

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </>
  );
}
