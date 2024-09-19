export function generateStaticParams({}: { params: { slug: string } }) {
  return [{ slug: "leo" }, { slug: "genius" }, { slug: "no-name" }];
}

export default function SettingsPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  return (
    <main className="container mx-auto px-3 lg:px-5 py-5 lg:py-8">
      <h3>Settings for page {slug}</h3>
    </main>
  );
}
