import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-3xl font-semibold">Welcome</h1>
        <p className="text-muted-foreground">Manage your API keys from your dashboard.</p>
        <Button asChild>
          <Link href="/dashboards">Go to Dashboard</Link>
        </Button>
      </div>
    </main>
  );
}
