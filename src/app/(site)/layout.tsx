import { client } from '@/sanity/lib/client';
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default async function SiteLayout({

  children,
}: {
  children: React.ReactNode;
}) {
  const experiences = await client.fetch(
    `*[_type == "experience"] | order(order asc) { "name": name, "slug": slug.current }`
  );
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
