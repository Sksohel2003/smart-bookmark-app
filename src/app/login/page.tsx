"use client";

import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-xl shadow-md text-center">
        <h1 className="text-2xl font-bold mb-6">Smart Bookmark App</h1>
        <button
          onClick={handleLogin}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Login with Google
        </button>
      </div>
    </div>
  );
}
