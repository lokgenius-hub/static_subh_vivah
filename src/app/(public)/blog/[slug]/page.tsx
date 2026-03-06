import BlogPostClient from "./blog-post-client";

export const dynamicParams = false;

export async function generateStaticParams() {
  return [{ slug: "_" }];
}

export default function BlogPostPage() {
  return <BlogPostClient />;
}
