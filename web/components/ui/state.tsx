"use client";

import { AlertCircle, FileText } from "lucide-react";

export const State = ({
  title,
  description,
  icon,
}: {
  title: string;
  description?: string;
  icon: React.ReactNode | "error" | "empty";
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-5 h-[200px] gap-2 [&_svg]:size-5 [&_svg]:text-muted-foreground">
      {icon === "error" ? <AlertCircle /> : icon === "empty" ? <FileText /> : icon}
      <p className="text-muted-foreground text-sm">{title}</p>
      {description && <p className="text-muted-foreground text-sm">{description}</p>}
    </div>
  );
};
