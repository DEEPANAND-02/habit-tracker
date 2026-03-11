const EmptyState = ({ icon = '🌱', title = 'Nothing here yet', description = 'Get started by adding something new.' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <div className="text-7xl mb-6 opacity-80">{icon}</div>
      <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-xs text-sm leading-relaxed">{description}</p>
    </div>
  );
};

export default EmptyState;
