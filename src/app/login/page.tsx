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
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 overflow-hidden">

      {/* Decorative star */}
      <div className="absolute bottom-16 right-20 text-white opacity-40 text-3xl">
        ✦
      </div>

      {/* Glass Card */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-10 w-[400px] text-center text-white">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
            <span className="text-2xl font-bold">🔖</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold mb-2">
          Smart Bookmark App
        </h1>

        {/* Subtitle */}
        <p className="text-white/80 mb-6">
          The smartest way to save the web.
        </p>

        <div className="border-t border-white/30 mb-6"></div>

        {/* Google Button */}
        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-medium py-3 rounded-xl shadow hover:shadow-lg hover:scale-[1.02] transition duration-200"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Continue with Google
        </button>

        {/* Terms */}
        <p className="text-xs text-white/70 mt-6">
          By continuing, you agree to our{" "}
          <span className="underline cursor-pointer">
            Terms of Service
          </span>{" "}
          &{" "}
          <span className="underline cursor-pointer">
            Privacy Policy
          </span>
        </p>
      </div>
    </div>
  );
}
