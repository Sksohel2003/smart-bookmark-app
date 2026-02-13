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

  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");

    // Check session
    useEffect(() => {
    const checkUser = async () => {
        const { data } = await supabase.auth.getSession();
        const session = data.session;

        if (!session) {
        router.push("/login");
        return;
        }

        setUserId(session.user.id);
        setUserEmail(session.user.email ?? null);

        await fetchBookmarks();
    };

    checkUser();
    }, [router]);
    
    useEffect(() => {
    const channel = supabase
        .channel("realtime-bookmarks")
        .on(
        "postgres_changes",
        {
            event: "*",
            schema: "public",
            table: "bookmarks",
        },
        (payload) => {
            if (payload.eventType === "INSERT") {
            setBookmarks((prev) => [payload.new as Bookmark, ...prev]);
            }

            if (payload.eventType === "DELETE") {
                setBookmarks((prev) =>
                    prev.filter((b) => b.id !== payload.old.id)
                );
            }

            if (payload.eventType === "UPDATE") {
            setBookmarks((prev) =>
                prev.map((b) =>
                b.id === payload.new.id ? (payload.new as Bookmark) : b
                )
            );
            }
        }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
    }, []);


  // Fetch bookmarks
  const fetchBookmarks = async () => {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setBookmarks(data);
    }
  };

    const handleAddBookmark = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !url.trim()) return;

    const { error } = await supabase.from("bookmarks").insert([
      {
        title,
        url,
      },
    ]);

    if (!error) {
      setTitle("");
      setUrl("");
    }
  };

  // Add bookmark

    const handleUpdateBookmark = async (id: string) => {
    if (!editTitle.trim() || !editUrl.trim()) return;

    const { error } = await supabase
        .from("bookmarks")
        .update({
        title: editTitle,
        url: editUrl,
        })
        .eq("id", id);

    if (error) {
        console.error("Update failed:", error.message);
        return;
    }

    setEditingId(null);
    };

  // 🚪 Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };
// 🗑 Delete bookmark
    const handleDeleteBookmark = async (id: string) => {
    const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("id", id);

    if (!error) {
        setBookmarks((prev) => prev.filter((b) => b.id !== id));
    }
    };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Your Bookmarks</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        <p className="mb-4 text-gray-600">
          Logged in as: <span className="font-medium">{userEmail}</span>
        </p>

        {/* ➕ Add Bookmark Form */}
        <form
          onSubmit={handleAddBookmark}
          className="flex flex-col gap-4 mb-6"
        >
          <input
            type="text"
            placeholder="Bookmark Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="p-3 border rounded-lg"
          />
          <input
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="p-3 border rounded-lg"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Add Bookmark
          </button>
        </form>

        {/* Bookmark List */}
        <div className="space-y-3">
          {bookmarks.map((bookmark) => (
            <div
                key={bookmark.id}
                className="p-4 border rounded-lg flex justify-between items-center"
            >
                {editingId === bookmark.id ? (
                <div className="flex flex-col gap-2 w-full">
                    <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="p-2 border rounded"
                    />
                    <input
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    className="p-2 border rounded"
                    />
                    <div className="flex gap-2">
                    <button
                        onClick={() => handleUpdateBookmark(bookmark.id)}
                        className="px-3 py-1 bg-green-500 text-white rounded"
                    >
                        Save
                    </button>
                    <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 bg-gray-400 text-white rounded"
                    >
                        Cancel
                    </button>
                    </div>
                </div>
                ) : (
                <>
                    <div>
                    <p className="font-medium">{bookmark.title}</p>
                    <a
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 text-sm"
                    >
                        {bookmark.url}
                    </a>
                    </div>

                    <div className="flex gap-3">
                    <button
                        onClick={() => {
                        setEditingId(bookmark.id);
                        setEditTitle(bookmark.title);
                        setEditUrl(bookmark.url);
                        }}
                        className="text-yellow-600 hover:text-yellow-800"
                    >
                        Edit
                    </button>

                    <button
                        onClick={() => handleDeleteBookmark(bookmark.id)}
                        className="text-red-500 hover:text-red-700"
                    >
                        Delete
                    </button>
                    </div>
                </>
                )}
            </div>
            ))}

          {bookmarks.length === 0 && (
            <p className="text-gray-500">No bookmarks yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
