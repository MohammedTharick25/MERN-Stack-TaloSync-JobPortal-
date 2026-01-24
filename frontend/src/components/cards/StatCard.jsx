const StatCard = ({ title, value }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow">
      <h3 className="text-gray-500 dark:text-white">{title}</h3>
      <p className="text-2xl font-bold dark:text-white">{value}</p>
    </div>
  );
};

export default StatCard;
