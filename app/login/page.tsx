import { LogIn } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <LogIn className="h-6 w-6 text-green-600" />
        </div>
        <h1 className="mb-3 text-2xl font-semibold text-gray-900">
          Sign in to continue
        </h1>
        <p className="text-gray-600">
          Select the Login button in the upper-right corner to sign in securely
          with Web3Auth.
        </p>
      </div>
    </div>
  );
}
