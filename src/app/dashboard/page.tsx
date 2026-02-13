"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface Bookmark {
  id: string;
  title: string;
  url: string;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");

  // 🔐 Check Session
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (!session) {
        router.push("/login");
        return;
      }

      setUserEmail(session.user.email ?? null);
      fetchBookmarks();
    };

    checkUser();
  }, [router]);

  // 📥 Fetch Bookmarks
  const fetchBookmarks = async () => {
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setBookmarks(data);
  };

  // ➕ Add Bookmark
    const handleAddBookmark = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !url.trim()) return;

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (!user) return;

    const { error } = await supabase.from("bookmarks").insert([
        {
        title,
        url,
        user_id: user.id,
        },
    ]);

    if (error) {
        console.error("Insert error:", error.message);
        return;
    }

    setTitle("");
    setUrl("");
    };


  // 🗑 Delete
  const handleDeleteBookmark = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id);
  };

  // ✏️ Update
  const handleUpdateBookmark = async (id: string) => {
    if (!editTitle.trim() || !editUrl.trim()) return;

    const { error } = await supabase
      .from("bookmarks")
      .update({ title: editTitle, url: editUrl })
      .eq("id", id);

    if (!error) setEditingId(null);
  };

  // ⚡ Realtime
    useEffect(() => {
    const setupRealtime = async () => {
        const { data } = await supabase.auth.getSession();
        const user = data.session?.user;

        if (!user) return;

        const channel = supabase
        .channel("realtime-bookmarks")
        .on(
            "postgres_changes",
            {
            event: "*",
            schema: "public",
            table: "bookmarks",
            filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
            if (payload.eventType === "INSERT") {
                setBookmarks((prev) => [
                payload.new as Bookmark,
                ...prev,
                ]);
            }

            if (payload.eventType === "DELETE") {
                setBookmarks((prev) =>
                prev.filter((b) => b.id !== payload.old.id)
                );
            }

            if (payload.eventType === "UPDATE") {
                setBookmarks((prev) =>
                prev.map((b) =>
                    b.id === payload.new.id
                    ? (payload.new as Bookmark)
                    : b
                )
                );
            }
            }
        )
        .subscribe();
    };

    setupRealtime();
    }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 p-8">

      <div className="max-w-4xl mx-auto backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 text-white">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Your Bookmarks</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/80">
              {userEmail}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-xl transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Add Form */}
        <form
          onSubmit={handleAddBookmark}
          className="flex gap-4 mb-8"
        >
          <input
            type="text"
            placeholder="Bookmark Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 p-3 rounded-xl bg-white/20 border border-white/30 placeholder-white/60 focus:outline-none"
          />
          <input
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 p-3 rounded-xl bg-white/20 border border-white/30 placeholder-white/60 focus:outline-none"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl transition"
          >
            Add
          </button>
        </form>

        {/* Bookmark Cards */}
        <div className="space-y-4">
          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="p-5 bg-white/20 border border-white/30 rounded-2xl backdrop-blur-lg hover:scale-[1.02] transition flex justify-between items-center"
            >
              {editingId === bookmark.id ? (
                <div className="flex flex-col gap-3 w-full">
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="p-2 rounded bg-white/30"
                  />
                  <input
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    className="p-2 rounded bg-white/30"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        handleUpdateBookmark(bookmark.id)
                      }
                      className="px-4 py-1 bg-green-500 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 py-1 bg-gray-500 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <p className="font-semibold text-lg">
                      {bookmark.title}
                    </p>
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-300 text-sm"
                    >
                      {bookmark.url}
                    </a>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        setEditingId(bookmark.id);
                        setEditTitle(bookmark.title);
                        setEditUrl(bookmark.url);
                      }}
                      className="text-yellow-300 hover:text-yellow-400"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteBookmark(bookmark.id)
                      }
                      className="text-red-400 hover:text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {bookmarks.length === 0 && (
            <p className="text-white/70 text-center mt-6">
              No bookmarks yet. Start adding some!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
