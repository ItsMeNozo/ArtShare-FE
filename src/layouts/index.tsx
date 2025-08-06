const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="overflow-hidden">{children}</div>
  );
};

export default RootLayout;
