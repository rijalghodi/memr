import { FileText, LucideProps } from "lucide-react";

type Props = React.SVGProps<SVGSVGElement> & LucideProps;

export function NoteIcon(props: Props) {
  return <FileText {...props} />;
}
