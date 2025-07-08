const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex dark:bg-mountain-950 overflow-hidden">
      {children}
    </div>
  );
};

export default RootLayout;
