# Blogs Module — Complete Working Guide

This document explains how the **Blogs** feature works end-to-end: database, APIs, admin Typewriter editor (including image upload), and public pages.

---

## 1. Big picture

Blogs are a separate content module from Articles. They share the same product patterns (list, detail, comments, admin CRUD, pagination), with one important difference:

| Area | Articles | Blogs |
|------|----------|-------|
| Body format | Plain text (paragraphs) | **HTML** from TipTap Typewriter |
| Admin editor | Textarea | Rich text (B / I / U / lists / links / **images**) |
| Inline images in body | No | Yes (upload while writing) |
| Public URL | `/articles` | `/blogs` |
| API base | `/api/articles` | `/api/blogs` |

```
┌─────────────────┐     FormData / JSON      ┌──────────────────┐
│  Admin UI       │ ───────────────────────► │  Express API     │
│  /admin/blogs   │                          │  /api/blogs      │
│  + Typewriter   │◄────── JSON + URLs ──────│                  │
└────────┬────────┘                          └────────┬─────────┘
         │                                            │
         │ HTML content                               │ Prisma
         │ + cover file                               ▼
         │                                   ┌──────────────────┐
         │                                   │  MySQL           │
         │                                   │  blogs           │
         │                                   │  blog_comments   │
         │                                   └──────────────────┘
         ▼
┌─────────────────┐     GET published        ┌──────────────────┐
│  Public pages   │ ◄─────────────────────── │  /uploads/*      │
│  /blogs         │                          │  (static files)  │
│  /blogs/[slug]  │                          └──────────────────┘
└─────────────────┘
```

---

## 2. Data model

**File:** `Backend/prisma/schema.prisma`

### `Blog`
| Field | Purpose |
|-------|---------|
| `id` | UUID primary key |
| `title` | Headline |
| `slug` | Unique URL key (auto from title) |
| `excerpt` | Short summary for cards / SEO |
| `content` | **LongText HTML** from TipTap |
| `coverImageUrl` | Cover filename or external URL |
| `category` | e.g. Market Insights, NRI Corner |
| `readTimeMin` | Estimated read time |
| `isPublished` | Draft vs live |
| `authorId` | Admin who created it |

### `BlogComment`
| Field | Purpose |
|-------|---------|
| `content` | Comment text |
| `guestName` | For anonymous commenters |
| `blogId` | Parent blog |
| `authorId` | Optional logged-in user |

Tables: `blogs`, `blog_comments`.

---

## 3. Backend API

**Mounted at:** `app.use("/api/blogs", blogRouter)` in `Backend/src/app.ts`  
**Routes:** `Backend/src/routes/blog.routes.ts`  
**Controllers:** `Backend/src/controllers/blog.controllers.ts`

### Public endpoints

| Method | Path | What it does |
|--------|------|----------------|
| `GET` | `/api/blogs` | List published blogs (`page`, `limit`, `skip`, `search`/`q`, `category`) |
| `GET` | `/api/blogs/:slug` | Single published blog (includes `content`) |
| `GET` | `/api/blogs/:slug/similar` | Same-category (then fill) related blogs |
| `GET` | `/api/blogs/:slug/comments` | Paginated comments |
| `POST` | `/api/blogs/:slug/comments` | Create comment (login optional; guests need `guestName`) |

### Admin endpoints (cookie auth + `ADMIN` / `SUPER_ADMIN`)

| Method | Path | What it does |
|--------|------|----------------|
| `GET` | `/api/blogs/admin` | All blogs + filters + published/draft counts |
| `POST` | `/api/blogs` | Create (multipart; optional `coverImage`) |
| `PATCH` | `/api/blogs/:id` | Update (multipart; optional new cover) |
| `DELETE` | `/api/blogs/:id` | Delete blog + cover file |
| `POST` | `/api/blogs/upload-image` | **Inline editor image upload** |
| `DELETE` | `/api/blogs/comments/:id` | Delete comment (owner or admin) |

### Uploads middleware

**File:** `Backend/src/middlewares/upload.middleware.ts`

| Export | Form field | Used for |
|--------|------------|----------|
| `uploadBlogCover` | `coverImage` | Blog cover on create/update |
| `uploadBlogImage` | `image` | Images inside Typewriter content |

Files are saved under `Backend/uploads/` with names like:

```text
image-1784513420986-745262310.jpg
coverImage-1784513420986-745262310.jpg
```

Static serving:

```text
GET http://localhost:4000/uploads/<filename>
```

(`app.use("/uploads", express.static("uploads"))`)

---

## 4. How the Typewriter editor works

**Component:** `Frontend/src/components/typewriter-editor.tsx`  
**Library:** TipTap (`@tiptap/react` + StarterKit, Underline, Link, Image, Placeholder, TextAlign)  
**Used in:** `Frontend/src/app/(dahboard)/admin/blogs/page.tsx`

### What the toolbar does

| Control | TipTap command |
|---------|----------------|
| Bold / Italic / Underline / Strike | Marks |
| H2 / H3 | Headings |
| Bullet / Numbered list | Lists |
| Quote | Blockquote |
| Align L/C/R | Text align |
| Link | Prompt for URL → `setLink` |
| Image | Pick file → **upload** → `setImage({ src })` |
| Undo / Redo | History |

The editor always stores **HTML** in React state (`form.content`), for example:

```html
<p>Hello <strong>world</strong></p>
<img src="http://localhost:4000/uploads/image-….jpg" />
<blockquote><p>A quote</p></blockquote>
```

On save, that HTML string is sent as the `content` field of the blog.

Empty check uses `isEmptyHtml()` so `<p></p>` is treated as empty.

---

## 5. How image upload in the editor works (step by step)

There are **two different image flows**. Do not confuse them.

### A) Inline content image (inside the Typewriter) — upload on Save only

Images inserted in the editor are **not** written to disk until the admin clicks Save / Publish.

```
1. Admin clicks Image → picks a file
2. Frontend creates a local blob: URL (URL.createObjectURL)
3. TipTap inserts <img src="blob:http://…">  (preview only)
4. File is kept in an in-memory Map (blobUrl → File)
5. If admin closes the drawer without saving:
      → blob URLs are revoked
      → Map is cleared
      → nothing is written to Backend/uploads/
6. On Save / Publish:
      a. persistContent() finds every blob: URL still in the HTML
      b. Uploads each File via POST /api/blogs/upload-image
      c. Replaces blob: URLs with permanent http://…/uploads/… URLs
      d. Then createBlog / updateBlog stores the final HTML
```

**Why:** abandoned drafts (insert image → cancel) leave **no** orphan files on the server.

**Editor API** (`TypewriterEditorHandle`):

| Method | When |
|--------|------|
| `persistContent()` | Called on Save — uploads blobs, returns final HTML |
| `discardPending()` | Called on Close — revoke blobs, no upload |

### B) Cover image (card / hero image)

Separate from the body editor:

```
1. Admin picks a cover file in the slide-over form
2. On Save → createBlog / updateBlog sends multipart FormData
3. Field name: "coverImage"
4. Multer uploadBlogCover stores the file
5. DB field cover_image_url = filename only (or kept as full Unsplash URL for seeds)
6. Public UI resolves it via getAssetUrl() → /uploads/<filename>
```

---

## 6. Admin dashboard flow

**URL:** `/admin/blogs`  
**Nav:** Admin sidebar → **Blogs**

### List
1. Page loads → `getBlogsAdmin({ page, search, status, category })`
2. Table shows cover thumb, title, status, category, actions
3. Stats cards filter All / Published / Draft

### Create
1. **New Blog** opens slide-over
2. Fill title, excerpt, category, read time, publish checkbox
3. Write body in Typewriter (format + optional inline images)
4. Optional cover upload
5. Save → `POST /api/blogs` with FormData:
   - `title`, `excerpt`, `content` (HTML), `category`, `readTimeMin`, `isPublished`
   - optional `coverImage` file
6. Backend slugifies title, attaches `authorId` from session, returns created blog

### Edit / publish / delete
- Edit → same drawer, prefilled; `PATCH /api/blogs/:id`
- Eye icon → toggle `isPublished`
- Trash → confirm → `DELETE /api/blogs/:id` (also deletes cover file if local)

---

## 7. Public user pages

### Listing — `/blogs`
**File:** `Frontend/src/app/blogs/page.tsx`

1. Server component reads `page`, `q`, `category` from search params
2. Calls `getBlogsListing()` which uses hybrid pagination:
   - **Page 1:** 13 blogs (magazine: 1 lead + 3 side + 9 grid)
   - **Page 2+:** 12 blogs (full grid)
3. If API has no data and no filters, falls back to `dummy-blogs.ts`
4. Search UI: `BlogsSearch` (debounced `q` + category tabs)

### Detail — `/blogs/[slug]`
**File:** `Frontend/src/app/blogs/[slug]/page.tsx`

1. `getBlogBySlug(slug)` (published only)
2. Renders HTML body with `dangerouslySetInnerHTML` when content looks like HTML (`.blog-body` styles in `globals.css`)
3. Related posts via `getSimilarBlogs`
4. Comments via `BlogComments` client component
5. **Share** via `ShareButton` (native share or copy link)

### Comments
**File:** `Frontend/src/components/blog-comments.tsx`

- Logged-in users: comment with account
- Guests: must enter name
- Admins / authors can delete

---

## 8. Frontend API map

**File:** `Frontend/src/lib/api.ts`

| Function | Backend |
|----------|---------|
| `getBlogs` / `getBlogsListing` | `GET /blogs` |
| `getBlogBySlug` | `GET /blogs/:slug` |
| `getSimilarBlogs` | `GET /blogs/:slug/similar` |
| `getBlogComments` / `createBlogComment` / `deleteBlogComment` | comments routes |
| `getBlogsAdmin` | `GET /blogs/admin` |
| `createBlog` / `updateBlog` / `deleteBlog` | admin CRUD |
| `uploadBlogImage` | `POST /blogs/upload-image` |
| `getAssetUrl` | Turns filename → `${ASSET_BASE}/uploads/...` |

---

## 9. Pagination helper

**File:** `Frontend/src/lib/blogs-pagination.ts` (re-exports articles helper)

```
Page 1:  skip = 0,           limit = 13
Page 2:  skip = 13,          limit = 12
Page 3:  skip = 13 + 12,     limit = 12
Page N:  skip = 13 + (N-2)*12
```

Backend accepts optional `skip` so page 2 does not incorrectly re-slice with a flat `limit`-only formula.

---

## 10. Seed / local testing

```bash
cd Backend
npm run db:seed:blogs
```

**File:** `Backend/prisma/seed-blogs.ts`  
Upserts a few published blogs with HTML content and Unsplash covers.

Frontend offline fallback: `Frontend/src/lib/dummy-blogs.ts`.

---

## 11. Key files cheat sheet

| Layer | Path |
|-------|------|
| Schema | `Backend/prisma/schema.prisma` (`Blog`, `BlogComment`) |
| Migration | `Backend/prisma/migrations/20260720140000_add_blogs_module/` |
| Controller | `Backend/src/controllers/blog.controllers.ts` |
| Routes | `Backend/src/routes/blog.routes.ts` |
| Upload | `Backend/src/middlewares/upload.middleware.ts` |
| Seed | `Backend/prisma/seed-blogs.ts` |
| Typewriter | `Frontend/src/components/typewriter-editor.tsx` |
| Admin page | `Frontend/src/app/(dahboard)/admin/blogs/page.tsx` |
| Public list | `Frontend/src/app/blogs/page.tsx` |
| Public detail | `Frontend/src/app/blogs/[slug]/page.tsx` |
| Comments | `Frontend/src/components/blog-comments.tsx` |
| Share | `Frontend/src/components/share-button.tsx` |
| API client | `Frontend/src/lib/api.ts` |
| Styles | `Frontend/src/app/globals.css` (`.typewriter-content`, `.blog-body`) |

---

## 12. Mental model (one sentence each)

1. **Typewriter** edits HTML in the browser (inline images use local `blob:` previews).
2. **Inline images** are uploaded to `/api/blogs/upload-image` only when the admin saves/publishes; closing without save uploads nothing.
3. **Saving a blog** uploads any pending images, rewrites HTML URLs, then stores title/meta + HTML `content` (+ optional cover file) in MySQL.
4. **Public pages** only show `isPublished` blogs and render the stored HTML.
5. **Cover image** is a separate file field on the blog row — not the same as inline body images.

---

## 13. Common troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| Image insert fails | Not logged in as admin; cookie missing; backend not running |
| Image shows in editor but 404 on public page | Wrong `ASSET_BASE` / backend origin; file deleted from `uploads/` |
| Blog list empty | No published blogs — run seed or publish from admin |
| `/blogs` redirects to articles | Old Next redirects — remove them from `next.config.ts` (already removed) |
| `prisma.blog` undefined | Restart backend after `prisma generate` so the process loads the new client |
| Empty content rejected | TipTap empty HTML (`<p></p>`) — write real text before save |
