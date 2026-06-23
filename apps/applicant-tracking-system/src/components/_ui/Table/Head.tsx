export const Head = ({ children }: React.PropsWithChildren<unknown>) => {
  return (
    <thead className="absolute top-0 min-w-full">
      <tr className="flex h-11 w-full">{children}</tr>
    </thead>
  );
};
