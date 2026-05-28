import { revalidatePath, revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

const KNOWN_TAGS = new Set([
  "products",
  "collections",
  "categories",
  "regions",
  "fulfillment",
  "tax-rate",
  "payment",
])

export async function POST(request: NextRequest) {
  const expected = process.env.REVALIDATE_SECRET
  if (!expected) {
    return NextResponse.json(
      { error: "REVALIDATE_SECRET is not configured" },
      { status: 500 }
    )
  }

  const provided =
    request.headers.get("x-revalidate-secret") ||
    request.nextUrl.searchParams.get("secret")

  if (provided !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}) as Record<string, unknown>)
  const tags = Array.isArray(body.tags) ? (body.tags as string[]) : []
  const paths = Array.isArray(body.paths) ? (body.paths as string[]) : []

  const revalidatedTags: string[] = []
  for (const tag of tags) {
    if (typeof tag !== "string" || !KNOWN_TAGS.has(tag)) continue
    revalidateTag(tag)
    revalidatedTags.push(tag)
  }

  const revalidatedPaths: string[] = []
  for (const path of paths) {
    if (typeof path !== "string" || !path.startsWith("/")) continue
    revalidatePath(path, "page")
    revalidatedPaths.push(path)
  }

  return NextResponse.json({
    revalidated: { tags: revalidatedTags, paths: revalidatedPaths },
    now: Date.now(),
  })
}
