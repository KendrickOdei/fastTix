

interface StatsCardProps {
  title: string;
  value: string | number;
 
}

const StatsCard = ({ title, value, }: StatsCardProps) => {
  return (
    <div className="bg-white shadow-md p-5 rounded-2xl flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-2xl font-semibold">{value}</h3>
      </div>
      
    </div>
  );
};

export default StatsCard;
