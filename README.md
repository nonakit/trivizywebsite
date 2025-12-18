# DraftaCV Blog CMS

A complete Content Management System for the DraftaCV blog, allowing you to create, edit, and publish blog posts through a user-friendly web interface.

## 🚀 Features

### Completed Features

- **📝 Blog CMS Dashboard**
  - Overview of all blog statistics (total posts, published, drafts, featured)
  - Quick access to recent posts
  - Category management view

- **✏️ Rich Text Editor**
  - Full formatting toolbar (bold, italic, underline, strikethrough)
  - Heading levels (H2, H3, H4)
  - Lists (bullet and numbered)
  - Text alignment options
  - Insert links and images
  - Blockquotes and code blocks
  - Undo/redo functionality

- **📸 Featured Image Management**
  - Set featured images via URL
  - Image preview before publishing
  - Fallback images for missing content

- **📂 Category System**
  - Resume Tips
  - Career Advice  
  - Interview Prep
  - Job Search

- **📊 Post Management**
  - Create new posts
  - Edit existing posts
  - Save as draft or publish immediately
  - Delete posts with confirmation
  - Search and filter posts
  - Featured post designation

- **🌐 Public Blog**
  - Dynamic blog listing page
  - Individual blog post pages
  - Category filtering
  - Search functionality
  - Pagination
  - Related posts suggestions
  - Social sharing buttons

## 📁 Project Structure

```
├── admin/
│   ├── cms.html          # CMS admin interface
│   ├── cms.css           # CMS styles
│   └── cms.js            # CMS functionality
├── blog.html             # Public blog listing page
├── blog.css              # Blog listing styles
├── blog.js               # Blog listing functionality
├── blog-post.html        # Individual blog post page
├── blog-post.css         # Blog post styles
├── blog-post.js          # Blog post functionality
├── index.html            # Main website homepage
├── styles.css            # Global styles
└── README.md             # This file
```

## 🔗 Entry Points (URLs)

### Public Pages
| Path | Description |
|------|-------------|
| `/blog.html` | Blog listing page with all published posts |
| `/blog-post.html?id={postId}` | Individual blog post page |
| `/index.html` | Main DraftaCV website |

### Admin Pages
| Path | Description |
|------|-------------|
| `/admin/cms.html` | Blog CMS admin dashboard |

## 🗄️ Data Model

### blog_posts Table Schema

| Field | Type | Description |
|-------|------|-------------|
| `id` | text | Unique identifier (auto-generated) |
| `title` | text | Post title |
| `slug` | text | URL-friendly title |
| `excerpt` | text | Short summary for cards |
| `content` | rich_text | Full post content (HTML) |
| `category` | text | Category slug |
| `category_label` | text | Human-readable category |
| `featured_image` | text | Image URL |
| `read_time` | text | Estimated reading time |
| `featured` | bool | Featured post flag |
| `published` | bool | Publication status |
| `publish_date` | datetime | Publication date |
| `author` | text | Author name |
| `meta_description` | text | SEO description |
| `tags` | array | Post tags |

## 📡 API Endpoints

The CMS uses the RESTful Table API:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `tables/blog_posts` | List all posts |
| GET | `tables/blog_posts/{id}` | Get single post |
| POST | `tables/blog_posts` | Create new post |
| PUT | `tables/blog_posts/{id}` | Update post |
| DELETE | `tables/blog_posts/{id}` | Delete post |

### Query Parameters
- `page` - Page number (default: 1)
- `limit` - Posts per page (default: 100)
- `sort` - Sort field (use `-` prefix for descending, e.g., `-publish_date`)
- `search` - Search query

## 🎨 Styling

The CMS maintains the same design language as the main DraftaCV website:
- Primary color: `#156d95`
- Font family: Figtree, system-ui, sans-serif
- Monospace font: Geist Mono (for code)
- Consistent border radius and spacing

## 💡 How to Use

### Creating a New Post

1. Go to `/admin/cms.html`
2. Click "New Post" in the sidebar or dashboard
3. Fill in the post details:
   - Title (required)
   - Excerpt (summary for blog cards)
   - Content (use the rich text editor)
   - Category (required)
   - Featured image URL
   - Read time
   - Author
   - Tags
4. Click "Publish" to make live or "Save Draft" to save without publishing

### Managing Posts

1. Navigate to "All Posts" in the CMS
2. Use search and filters to find specific posts
3. Click the edit icon to modify a post
4. Click the delete icon to remove a post

### Adding Images

1. In the content editor, click the image icon in the toolbar
2. Enter the image URL and optional alt text
3. Click "Insert Image"

For featured images:
1. Click "Set Image URL" in the sidebar
2. Enter the image URL
3. Preview will update automatically
4. Click "Set Image" to confirm

## ⚠️ Important Notes

### GitHub Pages Compatibility
Since GitHub Pages serves static files only, the blog posts are stored using the RESTful Table API provided by this platform. When deployed to GitHub Pages:

1. The CMS admin panel (`/admin/cms.html`) should be accessed from the deployed site, NOT locally
2. All data is stored in the cloud database, not in static files
3. Posts will automatically appear on the public blog once published

### Image Hosting
Since this is a static site, images must be hosted externally. Recommended options:
- Unsplash (for stock photos)
- Imgur
- GitHub repository (raw URLs)
- Any CDN or image hosting service

## 🔜 Future Enhancements

- [ ] User authentication for admin access
- [ ] Image upload to cloud storage
- [ ] Post scheduling
- [ ] Comments system
- [ ] Newsletter integration
- [ ] Analytics dashboard
- [ ] Post revision history
- [ ] Bulk operations

## 📞 Support

For questions or issues:
- Email: draftacv@gmail.com
- WhatsApp: (+62) 8112087181
- Instagram: @draftacv

---

Built with ❤️ for DraftaCV - Handcrafted Resumes That Guard Your Future
