"use client";

import { useActionState } from "react";
import { FormMessage, inputCls, SubmitButton } from "@/components/admin/ui";
import { login } from "../actions";

export function LoginForm() {
  const [state, action] = useActionState(login, undefined);
  return (
    <form action={action} className="space-y-3">
      <input
        type="email"
        name="email"
        required
        autoFocus
        autoComplete="username"
        placeholder="البريد الإلكتروني"
        dir="ltr"
        className={inputCls}
      />
      <input
        type="password"
        name="password"
        required
        autoComplete="current-password"
        placeholder="كلمة المرور"
        dir="ltr"
        className={inputCls}
      />
      <FormMessage state={state} />
      <SubmitButton className="w-full">دخول</SubmitButton>
    </form>
  );
}
