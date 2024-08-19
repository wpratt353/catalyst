import clsx from 'clsx';

interface Props {
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  totalItems: number;
}

export const ProgressBar = function ProgressBar({
  currentIndex,
  setCurrentIndex,
  totalItems,
}: Props) {
  return (
    <div className="flex">
      {Array.from({ length: totalItems }, (_, index) => (
        <button
          aria-label={`View image number ${index + 1}`}
          className="rounded-lg px-1.5 py-2 focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-primary"
          key={index}
          onClick={() => setCurrentIndex(index)}
        >
          <div className="relative overflow-hidden">
            {/* White Bar - Current Index Indicator / Progress Bar */}
            <div
              className={clsx(
                'bg-background absolute h-0.5 w-[calc-(228_/_3)] opacity-100',
                index === currentIndex ? 'translate-x-0' : '-translate-x-[101%]',
              )}
              style={{
                transitionDuration: index === currentIndex ? '5s' : '0s',
                width: `${190 / totalItems}px`,
              }}
            />

            {/* Grey Bar */}
            <div
              className="p bg-background h-0.5 w-[calc-(228_/_3)] opacity-30"
              style={{ width: `${190 / totalItems}px` }}
            />
          </div>
        </button>
      ))}
    </div>
  );
};

export default ProgressBar;
