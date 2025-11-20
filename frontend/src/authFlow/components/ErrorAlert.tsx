type ErrorAlertProps = {
  message?: string;
};

const ErrorAlert = ({ message }: ErrorAlertProps) => {
  if (!message) return null;

  return (
    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
      {message}
    </div>
  );
};

export default ErrorAlert;

