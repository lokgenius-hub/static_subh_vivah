"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, Eye, EyeOff, Youtube,
  Image as ImageIcon, X, Tag, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost,
} from "@/lib/actions";
import type { BlogPost } from "@/lib/types";

// ── Blog Post Form ──────────────────────────────────────────
function BlogForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initial?: BlogPost;
  onSubmit: (fd: FormData) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [isPublished, setIsPublished] = useState(initial?.is_published ?? false);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags((p) => [...p, t]);
    setTagInput("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    fd.set("tags", JSON.stringify(tags));
    fd.set("is_published", String(isPublished));
    try {
      await onSubmit(fd);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        name="title"
        label="Post Title"
        placeholder="e.g. Top 10 Banquet Halls in Patna for 2026"
        defaultValue={initial?.title}
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt / Summary</label>
        <textarea
          name="excerpt"
          rows={2}
          defaultValue={initial?.excerpt ?? ""}
          className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
          placeholder="Short description shown in the blog listing..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Content (HTML / Markdown accepted)</label>
        <textarea
          name="content"
          rows={10}
          defaultValue={initial?.content ?? ""}
          className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm font-mono focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
          placeholder="<p>Write your full blog post here...</p>"
        />
      </div>

      {/* Cover Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <ImageIcon className="inline h-4 w-4 mr-1" /> Cover Image URL
        </label>
        <div className="flex gap-3">
          <Input
            name="cover_image"
            placeholder="https://images.unsplash.com/photo-..."
            defaultValue={initial?.cover_image ?? ""}
            className="flex-1"
          />
          <label className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-dashed border-gray-300 text-gray-500 cursor-not-allowed bg-gray-50">
            <Plus className="h-4 w-4" /> Upload
            <input type="file" accept="image/*" disabled className="hidden" />
          </label>
        </div>
        <p className="text-xs text-gray-400 mt-1">Paste an Unsplash URL or any direct image link. File upload coming soon.</p>
      </div>

      {/* YouTube URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Youtube className="inline h-4 w-4 mr-1 text-red-500" /> YouTube Video URL (optional)
        </label>
        <Input
          name="youtube_url"
          type="url"
          placeholder="https://youtube.com/watch?v=..."
          defaultValue={initial?.youtube_url ?? ""}
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Tag className="inline h-4 w-4 mr-1" /> Tags
        </label>
        <div className="flex gap-2 mb-2 flex-wrap">
          {tags.map((t) => (
            <span key={t} className="flex items-center gap-1 px-3 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full text-xs font-medium">
              {t}
              <button type="button" onClick={() => setTags((p) => p.filter((x) => x !== t))}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
            placeholder="e.g. wedding tips"
            className="flex-1"
          />
          <Button type="button" variant="outline" onClick={addTag}>Add</Button>
        </div>
      </div>

      {/* Publish Toggle */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
        <button
          type="button"
          onClick={() => setIsPublished((p) => !p)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isPublished ? "bg-green-500" : "bg-gray-300"
          }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            isPublished ? "translate-x-6" : "translate-x-1"
          }`} />
        </button>
        <div>
          <p className="text-sm font-medium text-gray-800">
            {isPublished ? "Published" : "Draft"}
          </p>
          <p className="text-xs text-gray-500">
            {isPublished ? "This post is visible to all visitors" : "Save as draft — not visible publicly"}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
      )}

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>{submitLabel}</Button>
      </div>
    </form>
  );
}

// ── Main Admin Blog Page ────────────────────────────────────
export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const data = await getBlogPosts(false);
    setPosts(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const flash = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleCreate = async (fd: FormData) => {
    const result = await createBlogPost(fd);
    if (!result.success) throw new Error(result.error ?? "Failed");
    flash("Post created successfully!");
    setShowCreate(false);
    fetchPosts();
  };

  const handleUpdate = async (fd: FormData) => {
    if (!editingPost) return;
    const result = await updateBlogPost(editingPost.id, fd);
    if (!result.success) throw new Error(result.error ?? "Failed");
    flash("Post updated successfully!");
    setEditingPost(null);
    fetchPosts();
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    const result = await deleteBlogPost(postId);
    if (!result.success) { alert(result.error); return; }
    flash("Post deleted.");
    fetchPosts();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-charcoal)]">Blog & Advertising</h1>
          <p className="text-gray-500 text-sm mt-1">
            Create posts with images and YouTube videos for promotion
          </p>
        </div>
        <Button onClick={() => { setShowCreate(!showCreate); setEditingPost(null); }}>
          <Plus className="h-4 w-4" /> New Post
        </Button>
      </div>

      {successMsg && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> {successMsg}
        </div>
      )}

      {/* Create Form */}
      <AnimatePresence>
        {showCreate && !editingPost && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
          >
            <h2 className="text-lg font-semibold mb-4">Create New Post</h2>
            <BlogForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} submitLabel="Publish Post" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Form */}
      <AnimatePresence>
        {editingPost && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl p-6 border border-[var(--color-primary)]/20 shadow-sm"
          >
            <h2 className="text-lg font-semibold mb-4">
              Editing: <span className="text-[var(--color-primary)]">{editingPost.title}</span>
            </h2>
            <BlogForm
              initial={editingPost}
              onSubmit={handleUpdate}
              onCancel={() => setEditingPost(null)}
              submitLabel="Save Changes"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Posts List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm text-center">
          <p className="text-gray-400 text-lg">No blog posts yet.</p>
          <p className="text-sm text-gray-400 mt-1">Click <strong>New Post</strong> to create your first one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-start gap-4 p-5">
                {post.cover_image && (
                  <div className="relative h-16 w-24 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                    <img src={post.cover_image} alt={post.title} className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-gray-800 truncate">{post.title}</h3>
                    {post.is_published ? (
                      <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 font-medium">
                        <Eye className="h-2.5 w-2.5" /> Published
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                        <EyeOff className="h-2.5 w-2.5" /> Draft
                      </span>
                    )}
                    {post.youtube_url && (
                      <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 font-medium">
                        <Youtube className="h-2.5 w-2.5" /> Video
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1">{post.excerpt}</p>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {post.tags.map((t) => (
                      <span key={t} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {post.is_published && (
                    <a
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-gray-400 hover:text-[var(--color-primary)] rounded-lg border border-gray-200 hover:border-[var(--color-primary)]/30"
                      title="View post"
                    >
                      <Eye className="h-4 w-4" />
                    </a>
                  )}
                  <button
                    onClick={() => { setEditingPost(post); setShowCreate(false); }}
                    className="p-2 text-gray-400 hover:text-[var(--color-primary)] rounded-lg border border-gray-200 hover:border-[var(--color-primary)]/30"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-2 text-gray-400 hover:text-red-500 rounded-lg border border-gray-200 hover:border-red-200"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
