import Link from 'next/link';
import FAQ from '@/components/FAQ';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';

export default async function Home() {
  // Fetch editable site content from Sanity
  const siteConfiguration = await client.fetch(
    `*[_type == "siteSettings"][0]{
      announcementBanner,
      heroImage,
      heroVideoUrl,
      subscribeCalendarText,
      subscribeCalendarUrl,
      calendarHeading,
      calendarSubheading,
      faqHeading,
      faqIntroText,
      questionsEmail,
      faqItems,
      stillHaveQuestionsHeading,
      stillHaveQuestionsText,
      callUsLabel,
      phoneNumber
    }`,
    {},
    { next: { tags: ['sanity', 'siteSettings'] } }
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="w-full h-[60vh] flex items-center justify-center overflow-hidden relative">
        {siteConfiguration?.heroVideoUrl ? (
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src={siteConfiguration.heroVideoUrl}
            autoPlay
            loop
            muted
            playsInline
          />
        ) : siteConfiguration?.heroImage ? (
          <div
            className="absolute inset-0 w-full h-full bg-center bg-cover"
            style={{
              backgroundImage: `url('${urlFor(siteConfiguration.heroImage).url()}')`,
            }}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gray-200">
            <p className="text-gray-500 text-lg z-10">Hero Image / Video</p>
          </div>
        )}
        {/* Ensure any overlaid hero content goes here & stays above background media */}
      </section>

      {/* Calendar Subscribe Section */}
      <section className="py-16 px-6 text-center">
        <a
          href={siteConfiguration?.subscribeCalendarUrl || 'https://luma.com/immersionco?k=c&period=past'}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary inline-block bg-purple-600 text-white px-6 py-2.5 rounded-full text-sm font-medium mb-6"
        >
          {siteConfiguration?.subscribeCalendarText || 'Subscribe our calendar'}
        </a>
        <h2 className="text-3xl md:text-4xl font-light">
          {siteConfiguration?.calendarHeading || 'Be the first to get an Invite to'}
        </h2>
        <p className="text-3xl md:text-4xl text-gray-400 font-light">
          {siteConfiguration?.calendarSubheading || 'our events and experiences.'}
        </p>
      </section>

      {/* FAQ Section */}
      <FAQ
        heading={siteConfiguration?.faqHeading}
        introText={siteConfiguration?.faqIntroText}
        contactEmail={siteConfiguration?.questionsEmail}
        items={siteConfiguration?.faqItems}
      />

      {/* Still Have Questions Section */}
      <section className="py-16 px-6 text-center">
        <h3 className="text-xl font-semibold mb-2">
          {siteConfiguration?.stillHaveQuestionsHeading || 'Still have questions?'}
        </h3>
        <p className="text-gray-600 mb-6">
          {siteConfiguration?.stillHaveQuestionsText || "If you'd like immediate assistance. Click the button below to call us."}
        </p>
        <Link
          href={`tel:${siteConfiguration?.phoneNumber || '213-889-8567'}`}
          className="btn-primary inline-block bg-purple-600 text-white px-8 py-3 rounded-full text-sm font-medium"
        >
          {siteConfiguration?.callUsLabel || 'Call Us'}
        </Link>
      </section>
    </div>
  );
}
