import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - Link Manager",
  description: "Authentication pages for Link Manager",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center p-4 rounded-lg user-logged-gradient">
          <h1 className="text-3xl font-bold text-white">Link Manager</h1>
          <h2 className="mt-2 text-center text-sm text-gray-100">
            Manage your links efficiently
          </h2>
        </div>
        {children}
      </div>
    </div>
  );
}
