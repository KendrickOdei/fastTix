import { Link } from 'react-router-dom';
import { TrendingUp, DollarSign, Zap } from 'lucide-react';
import { useAuth } from '../Context/AuthContext';

const HomePartnerPitch = () => {
      const {user,} = useAuth();
      const isAuthenticated = !!user
  return (
    <section className="py-20 bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
            Ready to Sell Out Your Next Event?
          </h2>
          <p className="text-xl text-white max-w-3xl mx-auto">
            List, market, and manage your ticket sales effortlessly, with just a <span className="font-semibold text-green-400">7%</span> service fee. 
            Keep more of your revenue while we handle the tech.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <PitchCard
            icon={DollarSign}
            title="Keep Your Revenue High"
            description="Enjoy transparent, competitive commission rates that put more money back into your event."
          />
          <PitchCard
            icon={TrendingUp}
            title="Powerful Analytics"
            description="See real-time sales trends, track audience insights, and optimize your pricing on the fly."
          />
          <PitchCard
            icon={Zap}
            title="Lightning-Fast Setup"
            description="From draft to public in minutes. Our intuitive organizer dashboard makes event creation simple."
          />
        </div>

        <div className="text-center">
          <Link
            to= {isAuthenticated ? "/organizer/dashboard" : "/register"}
            className="inline-block rounded-xl bg-white text-green-800 hover:bg-gray-200 font-bold py-4 px-10  text-xl transition duration-300 shadow-2xl transform hover:scale-105"
          >
            Start Selling Tickets Today 
          </Link>
        </div>
      </div>
    </section>
  );
};

// Helper component for clean pitch cards
interface PitchCardProps {
    icon: React.ElementType;
    title: string;
    description: string;
}

const PitchCard: React.FC<PitchCardProps> = ({ icon: Icon, title, description }) => (
    <div className="p-6 bg-green-700/50 rounded-xl border border-green-600 shadow-lg">
        <Icon className="w-10 h-10 text-white mb-4" />
        <h3 className="text-2xl font-bold mb-3">{title}</h3>
        <p className="text-green-100">{description}</p>
    </div>
);

export default HomePartnerPitch;