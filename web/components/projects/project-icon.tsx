import { Asterisk, LucideProps } from "lucide-react";

type Props = React.SVGProps<SVGSVGElement> & LucideProps;

export function ProjectIcon(props: Props) {
  return <Asterisk {...props} />;
}
