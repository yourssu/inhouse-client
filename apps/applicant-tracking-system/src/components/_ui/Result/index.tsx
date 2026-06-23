interface ResultProps {
  description?: string;
  figure?: React.ReactNode;
  title: string;
}

export const Result = ({ description, figure, title }: ResultProps) => {
  return (
    <div className="flex flex-col items-center">
      {figure && <div className="flex min-h-21 items-center py-5">{figure}</div>}
      <span className="text-neutralMuted text-15 text-center font-semibold whitespace-pre-wrap">
        {title}
      </span>
      {description && (
        <span className="text-neutralSubtle text-13 mt-1 text-center">{description}</span>
      )}
    </div>
  );
};
