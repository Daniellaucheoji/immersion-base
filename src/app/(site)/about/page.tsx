import { client } from '@/sanity/lib/client';

type SiteSettings = {
  aboutTitle?: string;
  aboutBody?: string[];
  questionsEmail?: string;
  phoneNumber?: string;
};

export default async function About() {
  const siteSettings: SiteSettings = await client.fetch(
    `*[_type == "siteSettings"][0]{
      aboutTitle,
      aboutBody,
      questionsEmail,
      phoneNumber
    }`
  );

  const aboutParagraphs =
    siteSettings?.aboutBody && siteSettings.aboutBody.length > 0
      ? siteSettings.aboutBody
      : [
          'We create moments of connection through art, play, and technology.',
          'We do this in two ways: by producing our own live, immersive events, and by providing our experiences as bookable activations for your events.',
          'Think interactive VR adventures, social play installations, and responsive digital environments. We design, install, and host these experiences for festivals, corporate gatherings, brand launches, and private celebrations.',
        ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Left Column - Title */}
          <div>
            <h1 className="text-5xl font-bold tracking-wide text-black">{siteSettings?.aboutTitle || 'IMMERSION'}</h1>
          </div>

          {/* Right Column - Content */}
          <div className="space-y-6 text-gray-600">
            {aboutParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <p>
              If you&apos;d like to book our activation reach out to us at{' '}
              <a href={`mailto:${siteSettings?.questionsEmail || 'questions@enterimmersion.co'}`} className="text-purple-600 hover:underline transition-colors">
                {siteSettings?.questionsEmail || 'questions@enterimmersion.co'}
              </a>{' '}
              or give us a call at{' '}
              <a href={`tel:${siteSettings?.phoneNumber || '213-889-8567'}`} className="text-purple-600 hover:underline transition-colors">
                {siteSettings?.phoneNumber || '213-889-8567'}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
