import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface CourseBreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function CourseBreadcrumb({ items }: CourseBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-slate-500 font-medium">
        <li>
          <Link
            to="/"
            className="flex items-center gap-1 text-slate-500 hover:text-[#F05A28] transition-colors"
          >
            <Home size={14} />
            <span className="hidden sm:inline">Trang chủ</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-1.5">
              <ChevronRight size={13} className="text-slate-400 shrink-0" />
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className="hover:text-[#F05A28] transition-colors truncate max-w-[150px] sm:max-w-[240px]"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-slate-900 font-bold truncate max-w-[180px] sm:max-w-[320px]">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
