import { Hash, LucideProps } from "lucide-react";

type Props = React.SVGProps<SVGSVGElement> & LucideProps;

export function CollectionIcon(props: Props) {
  return <Hash {...props} />;
}
