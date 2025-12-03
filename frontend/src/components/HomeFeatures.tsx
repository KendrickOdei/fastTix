import { Zap, ShieldCheck, MapPin, Smile } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: "Instant Digital Tickets",
    description: "No printing, no stress. Your tickets are ready instantly on your phone—just show and go."
  },
  {
    icon: ShieldCheck,
    title: "Secure & Verified Booking",
    description: "We use top-tier encryption to keep your payment details safe and guarantee valid tickets, every time."
  },
  {
    icon: MapPin,
    title: "Discover Local Gems",
    description: "Explore diverse events happening in your city, from big stadium shows to intimate local gatherings."
  },
  {
    icon: Smile,
    title: "Simple, Human Support",
    description: "Got a question? Our friendly team is ready to help you quickly and personally."
  },
];

const HomeFeatures = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-extrabold text-gray-900 text-center mb-16">
          Why Choose fastTix? It's Simple.
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-xl shadow-lg hover:shadow-xl transition duration-300">
              <feature.icon className="w-10 h-10 text-green-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeFeatures;