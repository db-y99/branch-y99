"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  Form,
  Input,
  CardBody,
  Card,
  CardHeader,
  Divider,
  addToast,
} from "@heroui/react";
import { loginAction } from "@/actions/auth";
import { Logo } from "@/components/icons";
import { useRouter } from "next/navigation";
import SubmitButton from "@/components/submit-button";

export default function LoginPage() {
  const router = useRouter();
  const hasSubmittedRef = useRef(false);
  const [state, formAction] = useActionState(loginAction, {
    status: "",
    errors: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (!state?.data) return;

    localStorage.setItem(
      "user",
      JSON.stringify({
        id: state?.data?.id,
        username: state?.data?.username,
        fullname: state?.data?.fullname,
      })
    );

    addToast({
      title: "Đăng nhập thành công",
      description: "Bạn đã đăng nhập thành công",
      color: "success",
    });
    router.push("/");
  }, [state?.data]);

  useEffect(() => {
    if (!hasSubmittedRef.current) return;
    if (!state?.errors) return;

    const hasError = Object.values(state.errors).some(Boolean);
    if (!hasError) return;

    addToast({
      title: "Đăng nhập thất bại",
      description: "Email hoặc mật khẩu không chính xác",
      color: "danger",
    });
  }, [state?.errors]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-background to-secondary-50 dark:from-primary-950 dark:via-background dark:to-secondary-950 px-4">
      <div className="w-full max-w-md">
        <Card className="w-full shadow-xl">
          <CardHeader className="flex flex-col gap-4 pt-8 pb-0">
            <div className="flex items-center justify-center">
              <Logo size={60} />
            </div>
          </CardHeader>

          <CardBody className="gap-4 px-6">
            <div className="text-center mb-2">
              <h2 className="text-2xl font-bold mb-2 text-primary">
                Đăng nhập
              </h2>
              <p className="text-sm text-default-500">
                Sử dụng tài khoản CMS của bạn để tiếp tục
              </p>
            </div>

            <Form
              action={formAction}
              validationErrors={state?.errors}
              onSubmit={() => {
                hasSubmittedRef.current = true;
              }}
              className="w-full justify-center items-center space-y-4 h-full"
            >
              <div className="flex flex-col gap-4 w-full max-w-md">
                <Input
                  isRequired
                  errorMessage={({ validationDetails }) => {
                    if (validationDetails.valueMissing) {
                      return "Please enter your email";
                    }
                    if (validationDetails.typeMismatch) {
                      return "Please enter a valid email address";
                    }
                  }}
                  label="Email"
                  labelPlacement="outside"
                  name="email"
                  placeholder="Enter your email"
                  type="email"
                />

                <Input
                  isRequired
                  label="Password"
                  labelPlacement="outside"
                  name="password"
                  placeholder="Enter your password"
                  type="password"
                />

                <div className="flex gap-4">
                  <SubmitButton />
                </div>
              </div>
            </Form>

            <Divider className="my-2" />

            <div className="text-center">
              <p className="text-xs text-default-500">
                Bằng việc đăng nhập, bạn đồng ý với các điều khoản sử dụng và
                chính sách bảo mật của chúng tôi.
              </p>
            </div>
          </CardBody>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-default-500">
            Cần hỗ trợ?{" "}
            <a
              href="mailto:support@easyapprove.com"
              className="text-primary hover:underline font-medium"
            >
              Liên hệ chúng tôi
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
