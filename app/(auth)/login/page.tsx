import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Masuk untuk membuka dashboard CircleTask.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="nama@email.com" disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Password" disabled />
          </div>
          <Button className="w-full" disabled>
            Login
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <Link href="/register" className="font-medium text-primary">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
