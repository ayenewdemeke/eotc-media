interface InputErrorProps {
  message?: string
}

export default function InputError({ message }: InputErrorProps) {
  return message ? (
    <small className="text-red-600 text-sm">{message}</small>
  ) : null
}
