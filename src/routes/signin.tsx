import { createFileRoute, redirect } from "@tanstack/react-router";
import { type ComponentProps, useState } from "react";
import { useForm } from "@tanstack/react-form";
import type { AnyFieldApi } from '@tanstack/react-form';
import authClient from "~/lib/auth-client";
import { Button } from "~/lib/components/ui/button";
import { cn } from "~/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/lib/components/ui/card";
import { Input } from "~/lib/components/ui/input";
import { Label } from "~/lib/components/ui/label";
import { Link } from "@tanstack/react-router";

const REDIRECT_URL = "/dashboard";

export const Route = createFileRoute("/signin")({
  component: AuthPage,
  beforeLoad: async ({ context }) => {
    if (context.user) {
      throw redirect({
        to: REDIRECT_URL,
      });
    }
  },
});

function FieldInfo({ field }: { field: AnyFieldApi }) {
  if (!field.state.meta.isTouched || !field.state.meta.errors.length) {
    return null;
  }

  return (
    <p className="text-red-500 text-xs mt-1">
      {field.state.meta.errors.join(', ')}
    </p>
  );
}

function AuthPage() {
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setError(null);

      try {
        await authClient.signIn.email({
          email: value.email,
          password: value.password,
          callbackURL: REDIRECT_URL,
        });
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Login failed. Please try again.');
        }
      }
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}
            <form onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <form.Field
                    name="email"
                    validators={{
                      onChange: ({ value }) =>
                        !value
                          ? 'Email is required'
                          : !value.includes('@')
                            ? 'Must be a valid email'
                            : undefined,
                    }}
                  >
                    {(field) => (
                      <>
                        <Input
                          id="email"
                          type="email"
                          placeholder="m@example.com"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className={field.state.meta.errors?.length ? 'border-red-300' : ''}
                        />
                        <FieldInfo field={field} />
                      </>
                    )}
                  </form.Field>
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      to="/"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <form.Field
                    name="password"
                    validators={{
                      onChange: ({ value }) =>
                        !value
                          ? 'Password is required'
                          : value.length < 6
                            ? 'Password must be at least 6 characters'
                            : undefined,
                    }}
                  >
                    {(field) => (
                      <>
                        <Input
                          id="password"
                          type="password"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className={field.state.meta.errors?.length ? 'border-red-300' : ''}
                        />
                        <FieldInfo field={field} />
                      </>
                    )}
                  </form.Field>
                </div>

                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                >
                  {([canSubmit, isSubmitting]) => (
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={!canSubmit}
                    >
                      {isSubmitting ? "Signing in..." : "Sign in"}
                    </Button>
                  )}
                </form.Subscribe>

                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                  <span className="relative z-10 bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <SignInButton
                    provider="discord"
                    label="Discord"
                    className="bg-[#5865F2] hover:bg-[#5865F2]/80 text-white hover:text-white"
                  />
                  <SignInButton
                    provider="github"
                    label="GitHub"
                    className="bg-neutral-700 hover:bg-neutral-700/80 text-white hover:text-white"
                  />
                  <SignInButton
                    provider="google"
                    label="Google"
                    className="bg-[#DB4437] hover:bg-[#DB4437]/80 text-white hover:text-white"
                  />
                </div>
              </div>
              <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link to="/" className="underline underline-offset-4">
                  Sign up
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
        <div className="mt-4 text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
          By signing in, you agree to our <a href="#">Terms of Service</a>{" "}
          and <a href="#">Privacy Policy</a>.
        </div>
      </div>
    </div>
  );
}

interface SignInButtonProps extends ComponentProps<typeof Button> {
  provider: "discord" | "google" | "github";
  label: string;
}

function SignInButton({ provider, label, className, ...props }: SignInButtonProps) {
  return (
    <Button
      onClick={() =>
        authClient.signIn.social({
          provider,
          callbackURL: REDIRECT_URL,
        })
      }
      type="button"
      variant="outline"
      size="lg"
      className={cn(className)}
      {...props}
    >
      Sign in with {label}
    </Button>
  );
}