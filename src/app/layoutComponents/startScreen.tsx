import { ReactNode } from 'react';

export const useStartScreen = () => {
  const screen = {
    StartScreen,
  }
  return screen;
};

const StartScreen: React.FC<{ className: string, children: ReactNode }> = ({ className, children }) => {
  return (
    <div className={`bg-[red] lg:basis-2/6 sm:h-1/5 lg:min-h-screen ${className}`}>
      {children}
    </div>
  );
};