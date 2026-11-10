import { PawPrint } from "lucide-react";

type Props = { title: string; text?: string; action?: React.ReactNode };

export default function EmptyState({ title, text, action }: Props) {
  return (
    <div className="card flex flex-col items-center py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-500">
        <PawPrint />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-brand-900">{title}</h3>
      {text && <p className="mt-1 max-w-sm text-sm text-gray-500">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}