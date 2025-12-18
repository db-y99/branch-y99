"use client";

import { Button, Spinner } from "@heroui/react";
import { useFormStatus } from "react-dom";

export default function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      className="w-full"
      color="primary"
      type="submit"
      isDisabled={pending}
    >
      {pending ? (
        <>
          <Spinner color="white" size="sm" />
          <span>Đăng nhập</span>
        </>
      ) : (
        "Đăng nhập"
      )}
    </Button>
  );
}
