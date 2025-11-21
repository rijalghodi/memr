import { Asterisk, LucideProps, Presentation, Target } from "lucide-react";

type Props = React.SVGProps<SVGSVGElement> & LucideProps;

export function ProjectIcon(props: Props) {
  return <Asterisk {...props} />;
}
