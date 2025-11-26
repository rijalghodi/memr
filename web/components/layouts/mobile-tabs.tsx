import { ListTodo } from "lucide-react";
import { useLocation } from "react-router-dom";

import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

import { useBrowserNavigate } from "../browser-navigation";
import { CollectionIcon } from "../collections/collection-icon";
import { NoteIcon } from "../notes/note-icon";

type Tab = {
  title: string;
  icon: React.ReactNode;
  pathname?: string;
};

export function MobileTabs() {
  const tabs: Tab[] = [
    {
      pathname: ROUTES.NOTES,
      title: "Notes",
      icon: <NoteIcon />,
    },
    {
      pathname: ROUTES.COLLECTIONS,
      title: "Collections",
      icon: <CollectionIcon />,
    },
    {
      pathname: ROUTES.TASKS,
      title: "Tasks",
      icon: <ListTodo />,
    },
  ];

  const { pathname } = useLocation();

  return (
    <>
      <nav className="h-10.5 flex-1 relative bg-muted flex">
        <ul className="flex-1 flex items-center h-full overflow-hidden relative">
          {tabs.map((tab) => (
            <SessionTabItem
              isActive={pathname === tab.pathname}
              key={tab.pathname}
              pathname={tab.pathname}
              title={tab.title}
              icon={tab.icon}
            />
          ))}
        </ul>
      </nav>
    </>
  );
}

function SessionTabItem({
  pathname,
  icon,
  className,
  title,
  isActive,
}: {
  pathname?: string;
  icon?: React.ReactNode;
  className?: string;
  title: string;
  isActive?: boolean;
}) {
  const { navigate } = useBrowserNavigate();

  return (
    <li
      className={cn(
        "flex justify-center items-center group relative flex-1 gap-1.5 h-full px-3 cursor-pointer data-[active=false]:hover:bg-accent",
        "text-xs font-medium [&>svg]:size-3.5 text-foreground/90 border-b border-b-transparent",
        "data-[active=true]:bg-background data-[active=true]:border-b-primary data-[active=true]:text-primary transition-all duration-100",
        className
      )}
      data-active={isActive}
      onClick={() => {
        navigate(pathname ?? "#");
      }}
    >
      {icon}
      <span className="truncate">{title}</span>
    </li>
  );
}
