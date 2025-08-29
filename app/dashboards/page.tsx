import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardsPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">API Keys</h1>
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
        <p className="text-muted-foreground">
          CRUD UI for managing API keys will go here.
        </p>
      </div>
    </main>
  );
}


