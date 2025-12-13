import { Loader2 } from "lucide-react";

export default function RootLoading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        {/* You can replace this with your Brand Logo if you want */}
        <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      </div>
    </div>
  );
}