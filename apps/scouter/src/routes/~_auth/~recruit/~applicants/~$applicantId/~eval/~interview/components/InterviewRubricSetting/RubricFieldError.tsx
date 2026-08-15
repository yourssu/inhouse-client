interface RubricFieldErrorProps {
  message: string | undefined;
}

export const RubricFieldError = ({ message }: RubricFieldErrorProps) => {
  if (message === undefined) {
    return null;
  }

  return (
    <p className="text-13 text-red600" role="alert">
      {message}
    </p>
  );
};
