import Link from 'next/link';
import { notFound } from 'next/navigation';

const experiencesData: Record<string, {
  name: string;
  tagline: string;
  description: string;
  details: string[];
  duration: string;
  groupSize: string;
  price: string;
}> = {
  'vr-adventures': {
    name: 'VR Adventures',
    tagline: 'Step into fully immersive virtual worlds',
    description: 'Experience the impossible. Our VR Adventures transport you to fantastical realms where you can explore ancient ruins, traverse alien landscapes, or solve mysteries in haunted mansions. Using cutting-edge VR technology and custom-designed environments, every adventure feels real.',
    details: [
      'Full-body tracking for complete immersion',
      'Multi-player experiences for up to 6 guests',
      'Multiple adventure scenarios to choose from',
      'Professional guides throughout your journey',
    ],
    duration: '45-60 minutes',
    groupSize: '2-6 people',
    price: 'From $65 per person',
  },
  'interactive-installations': {
    name: 'Interactive Installations',
    tagline: 'Art that responds to you',
    description: 'Walk through rooms that transform with your presence. Our interactive installations use motion sensors, projection mapping, and responsive audio to create environments that react to your every movement. Each visit is unique because you shape the experience.',
    details: [
      'Motion-reactive visual environments',
      'Spatial audio that follows your movement',
      'Touch-sensitive surfaces and objects',
      'Ever-changing generative art',
    ],
    duration: '30-45 minutes',
    groupSize: '1-20 people',
    price: 'From $35 per person',
  },
  'dj-sensor-experiences': {
    name: 'DJ + Sensor Experiences',
    tagline: 'Where music meets technology',
    description: 'Dance floors that respond to the beat. Our DJ + Sensor experiences combine live music with Arduino-powered installations that react to sound, movement, and crowd energy. The more you move, the more the environment transforms around you.',
    details: [
      'Live DJ performances',
      'Sound-reactive LED installations',
      'Crowd-responsive visual effects',
      'Wearable sensors for guests',
    ],
    duration: '2-4 hours',
    groupSize: '50-500 people',
    price: 'Custom quote',
  },
  'custom-activations': {
    name: 'Custom Activations',
    tagline: 'Bespoke experiences for your event',
    description: 'We design and build custom immersive experiences tailored to your brand, event, or celebration. From corporate product launches to private parties, our team creates one-of-a-kind activations that leave lasting impressions.',
    details: [
      'Full concept design and development',
      'Custom hardware and software creation',
      'On-site installation and operation',
      'Branded elements and integrations',
    ],
    duration: 'Varies by project',
    groupSize: 'Any size',
    price: 'Custom quote',
  },
  'neon-dreams': {
    name: 'Neon Dreams',
    tagline: 'A luminous journey through light',
    description: 'Enter a world bathed in neon. Neon Dreams is an immersive walkthrough experience featuring over 10,000 LED lights, mirrors, and fog to create an otherworldly atmosphere. Perfect for photos, exploration, and losing yourself in color.',
    details: [
      'Over 10,000 programmable LED lights',
      'Infinity mirror rooms',
      'Atmospheric fog and haze effects',
      'Photo opportunities throughout',
    ],
    duration: '20-30 minutes',
    groupSize: '1-4 people per session',
    price: 'From $25 per person',
  },
  'the-light-maze': {
    name: 'The Light Maze',
    tagline: 'Find your way through the glow',
    description: 'Navigate a constantly shifting labyrinth of light and shadow. The Light Maze challenges you to find your way through rooms where walls appear and disappear, paths change, and nothing is quite what it seems. Work together or go solo in this mind-bending experience.',
    details: [
      'Dynamic walls and pathways',
      'Puzzle elements and challenges',
      'Multiple difficulty levels',
      'Leaderboards for fastest times',
    ],
    duration: '15-25 minutes',
    groupSize: '1-4 people',
    price: 'From $30 per person',
  },
};

export default async function ExperienceDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const experience = experiencesData[slug];

  if (!experience) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="w-full bg-gray-200 h-[50vh] flex items-center justify-center">
        <p className="text-gray-500 text-lg">Experience Hero Image</p>
      </section>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link href="/experiences" className="text-purple-600 hover:underline">
            ← Back to Experiences
          </Link>
        </nav>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{experience.name}</h1>
        <p className="text-xl text-gray-600 mb-8">{experience.tagline}</p>

        {/* Quick Info */}
        <div className="grid grid-cols-3 gap-4 mb-12 p-6 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-500 mb-1">Duration</p>
            <p className="font-medium">{experience.duration}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Group Size</p>
            <p className="font-medium">{experience.groupSize}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Price</p>
            <p className="font-medium">{experience.price}</p>
          </div>
        </div>

        {/* Description */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">About This Experience</h2>
          <p className="text-gray-600 leading-relaxed">{experience.description}</p>
        </div>

        {/* Details */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">What&apos;s Included</h2>
          <ul className="space-y-3">
            {experience.details.map((detail, i) => (
              <li key={i} className="flex items-start gap-3">
                <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600">{detail}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/tickets"
            className="btn-primary bg-purple-600 text-white px-8 py-3 rounded-full text-center font-medium"
          >
            Book Now
          </Link>
          <Link
            href="/book-us"
            className="btn-secondary bg-black text-white px-8 py-3 rounded-full text-center font-medium"
          >
            Private Booking Inquiry
          </Link>
        </div>
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return Object.keys(experiencesData).map((slug) => ({ slug }));
}
