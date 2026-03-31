import { client } from '@/sanity/lib/client';
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const revalidate = 60;

export default async function SiteLayout({

  children,
}: {
  children: React.ReactNode;
}) {
  const experiences = await client.fetch(
    `*[_type == "experience"] | order(order asc) { "title": title, "slug": slug.current }`,
    {},
    { next: { tags: ['sanity', 'experience'] } }
  );
  const siteSettings = await client.fetch(
    `*[_type == "siteSettings"][0]{
      announcementBanner,
      shopEnabled,
      bookUsLabel,
      aboutLabel,
      shopLabel,
      buyTicketsLabel,
      buyTicketsUrl,
      privacyPolicyUrl,
      termsUrl,
      footerAboutLabel,
      footerAboutUrl,
      footerBookLabel,
      footerBookUrl,
      footerPrivacyLabel,
      footerTermsLabel,
      socialLinks
    }`,
    {},
    { next: { tags: ['sanity', 'siteSettings'] } }
  );
  return (
    <>
      <Header experiences={experiences} siteSettings={siteSettings} />
      <main>{children}</main>
      <Footer siteSettings={siteSettings} />
    </>
  );
}
