import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";
import React from "react";

type Props = {
  className?: string;
};

export function Loaoder({ className }: Props) {
  return <Loader className={cn("size-4 animate-spin", className)} />;
}
