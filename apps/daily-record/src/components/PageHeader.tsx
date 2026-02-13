import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function PageHeader({
  title,
  backTo = '/calendar',
}: {
  title: string;
  backTo?: string;
}) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 bg-white px-4 py-3">
      <Link
        to={backTo}
        className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100"
      >
        <ArrowLeftIcon className="h-5 w-5 text-slate-700" />
      </Link>
      <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
    </header>
  );
}
