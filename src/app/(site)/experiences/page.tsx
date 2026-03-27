import Link from 'next/link';

const experiences = [
  {
    slug: 'vr-adventures',
    title: 'VR Adventures',
    description: 'Step into fully immersive virtual worlds with cutting-edge VR technology.',
  },
  {
    slug: 'interactive-installations',
    title: 'Interactive Installations',
    description: 'Experience art that responds to your presence and movements.',
  },
  {
    slug: 'dj-sensor-experiences',
    title: 'DJ + Sensor Experiences',
    description: 'Music meets technology in our Arduino-powered interactive DJ sets.',
  },
  {
    slug: 'custom-activations',
    title: 'Custom Activations',
    description: 'We design bespoke experiences tailored to your event and audience.',
  },
  {
    slug: 'neon-dreams',
    title: 'Neon Dreams',
    description: 'A luminous journey through over 10,000 LED lights and infinity mirrors.',
  },
  {
    slug: 'the-light-maze',
    title: 'The Light Maze',
    description: 'Navigate a constantly shifting labyrinth of light and shadow.',
  },
];

export default function Experiences() {
  return (
    <div className="min-h-screen py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4">Experiences</h1>
        <p className="text-center text-gray-600 mb-12">
          Discover our immersive activations and events
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {experiences.map((exp) => (
            <Link
              key={exp.slug}
              href={`/experiences/${exp.slug}`}
              className="card-hover border border-gray-200 rounded-lg overflow-hidden cursor-pointer group block"
            >
              <div className="bg-gray-200 h-48 flex items-center justify-center overflow-hidden">
                <span className="text-gray-400 group-hover:scale-110 transition-transform duration-500">
                  Experience Image
                </span>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-xl mb-2 group-hover:text-purple-600 transition-colors duration-200">
                  {exp.title}
                </h3>
                <p className="text-gray-600">{exp.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
