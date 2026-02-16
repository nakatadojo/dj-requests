export default function LoadingSpinner({ size = 'md', message }) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-700 border-t-venmo`}></div>
      {message && <p className="mt-4 text-gray-400">{message}</p>}
    </div>
  );
}
