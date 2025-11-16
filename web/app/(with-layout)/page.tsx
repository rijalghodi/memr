import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";
import { LoginWithGoogle } from "@/components/auth/login-w-google";
import { NoteDashboard } from "@/components/notes/note-dashboard";

export default function Home() {
  return (
    <>
      <NoteDashboard />
    </>
  );
}
