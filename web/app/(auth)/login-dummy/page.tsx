import { LoginForm } from "@/components/auth/login-form";
import { LoginWithGoogle } from "@/components/auth/login-w-google";
import React from "react";

type Props = {};

export default function LoginPageDummy({}: Props) {
  return (
    <div>
      <LoginWithGoogle />
    </div>
  );
}
