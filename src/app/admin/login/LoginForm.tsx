"use client";

import { useActionState } from "react";
import { FormMessage, inputCls, SubmitButton } from "@/components/admin/ui";
import { login } from "../actions";

export function LoginForm() {
  const [state, action] = useActionState(login, undefined);
  return (
    <form action={action} className="space-y-3">
      <input
        type="password"
        name="password"
        required
        autoFocus
        autoComplete="current-password"
        placeholder="كلمة المرور"
        className={inputCls}
      />
      <FormMessage state={state} />
      <SubmitButton className="w-full">دخول</SubmitButton>
    </form>
  );
}
