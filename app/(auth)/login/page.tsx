"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { LoaderCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { login } from "@/actions/auth";
import { useUserStore } from "@/store/user-store";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters",
  }),
});

const LoginPage = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const { setUser } = useUserStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    reValidateMode: "onSubmit",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setError("");
    startTransition(() => {
      login(values)
        .then((res) => {
          if (res.error) {
            setError(res?.message);
          }
          if (res.success && res.data) {
            form.clearErrors();
            setUser(res?.data);
            toast.success("Successfully logged in!");
            router.push("/");
          }
        })
        .catch(() => {
          toast.error("An error occurred during login");
        });
    });
  };

  return (
    <div className="flex items-center justify-center w-[450px] relative">
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Sign in
          </CardTitle>
          <CardDescription className="text-center text-sm">
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            {(error || Object.keys(form.formState.errors).length > 0) && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Invalid email or password</AlertDescription>
              </Alert>
            )}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Input
                          className="h-12 text-sm"
                          placeholder="Email"
                          {...field}
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Input
                          className="h-12 text-sm"
                          type="password"
                          placeholder="Password"
                          {...field}
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="h-12 w-full"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    Signing in...
                    <LoaderCircle className="ml-2 h-5 w-5 animate-spin" />
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 text-center">
          <div className="flex items-center justify-center space-x-1">
            <span className="text-muted-foreground text-sm">
              Don't have an account?
            </span>
            <Button
              variant="link"
              className="text-sm font-medium px-0"
              onClick={() => router.push("/register")}
            >
              Sign up
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
