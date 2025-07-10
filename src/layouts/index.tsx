const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="dark:bg-mountain-950 flex overflow-hidden">{children}</div>
  );
};

export default RootLayout;
