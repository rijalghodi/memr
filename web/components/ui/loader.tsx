import { Loader } from "lucide-react";
import React from "react";

import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

export function Loaoder({ className }: Props) {
  return <Loader className={cn("size-4 animate-spin", className)} />;
}
