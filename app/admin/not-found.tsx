import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-xl text-center">
        <div className="text-7xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
          404
        </div>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900">
          Admin page not available
        </h1>
        <p className="mt-2 text-slate-600">
          This admin route doesn’t exist or is no longer available.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/admin/login"
            className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
