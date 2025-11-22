import { useEffect } from "react";

import { BRAND } from "@/lib/brand";

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} | ${BRAND.SITE_NAME}`;
  }, [title]);
}
