"use client";
import Link from "next/link";
import { IoMdArrowDropright } from "react-icons/io";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  color?: string;
  textColor?: string;
  separatorColor?: string;
  separator?: React.ReactNode;
}

const Breadcrumb = ({
  items,
  color,
  textColor,
  separatorColor,
  separator = <IoMdArrowDropright size={16} />,
}: BreadcrumbProps) => {
  return (
    <div className="flex items-center gap-1">
      {items.map((item, idx) => (
        <div className="flex items-center gap-1" key={idx}>
          {/* Link or Text */}
          {item.href ? (
            <Link href={item.href} style={{ color }}>
              {item.label}
            </Link>
          ) : (
            <p style={{ color: textColor }}>{item.label}</p>
          )}

          {/* Separator except last */}
          {idx < items.length - 1 && (
            <span style={{ color: separatorColor }}>{separator}</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default Breadcrumb;
