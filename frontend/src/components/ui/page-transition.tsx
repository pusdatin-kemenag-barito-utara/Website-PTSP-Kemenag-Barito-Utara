export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-full animate-in fade-in duration-150 ease-out">
      {children}
    </div>
  );
}
