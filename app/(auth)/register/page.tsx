"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AlertCircle, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { register } from "@/actions/auth";
import { useUserStore } from "@/store/user-store";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name is required!",
  }),
  email: z.string().email({
    message: "Invalid email address!",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters!",
  }),
});

const RegisterPage = () => {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const { setUser } = useUserStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    startTransition(() => {
      register(values)
        .then((res) => {
          if (res.emailError) {
            form.setError("email", {
              type: "manual",
              message: res.message,
            });
          }

          if (res.success) {
            toast.success("Your account has been created");
            form.reset();
            form.clearErrors();
            setUser(res?.data);
            router.push("/");
          }
        })
        .catch((error) => {
          toast.error(error);
        });
    });
  };

  return (
    <div className="flex items-center justify-center w-[450px] relative">
      <Card className="w-[450px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Create your account
          </CardTitle>
          <CardDescription className="text-center text-sm">
            Please fill in the form to create your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Input
                          className="h-12 text-sm"
                          placeholder="Name"
                          {...field}
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
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
                          placeholder="Password"
                          type="password"
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
                    Signing up...
                    <LoaderCircle className="ml-2 h-5 w-5 animate-spin" />
                  </>
                ) : (
                  "Sign up"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 text-center">
          <div className="flex items-center justify-center space-x-1">
            <span className="text-muted-foreground text-sm">
              Already have an account?
            </span>
            <Button
              variant="link"
              className="text-sm font-medium px-0"
              onClick={() => router.push("/login")}
            >
              Login
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegisterPage;
