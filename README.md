# DraftaCV - Professional CV & Resume Builder

Handcrafted Resumes That Guard Your Future. Transform your professional story with beautifully designed, ATS-optimized resumes.

## 🌟 Project Overview

DraftaCV is a professional CV and resume writing service website that offers:
- Multiple pricing packages (Basic Starter, Professional, Executive Elite, Custom)
- Multi-country support (Bangladesh and Indonesia) with automatic currency switching
- Professional form submission for resume building
- Career tips blog with search and category filtering
- ATS Score checker (cv-checker.html)

## ✅ Completed Features

### 1. Multi-Country Support (BD/ID)
- **Automatic Country Detection**: IP-based detection using multiple geolocation APIs
- **Currency Switching**: 
  - Bangladesh (BD): ৳ (BDT) - ৳999, ৳1,999, ৳3,999
  - Indonesia (ID): Rp (IDR) - Rp 129,000, Rp 259,000, Rp 519,000
- **Manual Toggle**: Small toggle switch in footer (BD | ID) for manual country selection
- **Persistent Preference**: Country choice saved to localStorage
- **Files**: `country-detect.js`, `toggle.css`

### 2. Form Page Updates
- **Country-Specific Examples**: Placeholders change based on visitor's country
  - BD: English placeholders with Bangladeshi context
  - ID: Indonesian placeholders (contoh,...)
- **New "Target Job" Section**: 
  - Required Yes/No question: "Are you applying for any specific job?"
  - If Yes: Expands to show Job Title (required) and Job Description fields
  - Helps tailor resume for specific roles
- **Files**: `form.html`, `form-script.js`, `form-styles.css`

### 3. Blog Page
- **Blog Lobby**: Hero section with search, stats, and featured article
- **Category Filtering**: All Posts, Resume Tips, Career Advice, Interview Prep, Job Search
- **Grid Layout**: Responsive 3-column grid (2 on tablet, 1 on mobile)
- **Pagination**: Page numbers with ellipsis for large datasets
- **Sorting**: Articles sorted by date (newest to oldest)
- **Search**: Real-time search across titles and excerpts
- **Sample Content**: 12 sample blog posts with categories
- **Files**: `blog.html`, `blog.css`, `blog.js`

### 4. Footer Country Toggle
- Compact toggle design matching site aesthetics
- Position: Footer legal section (BD | toggle | ID | Privacy Policy | Terms of Service)
- Labels highlight based on active country

## 📁 File Structure

```
DraftaCV/
├── index.html              # Main landing page
├── form.html               # Resume information submission form
├── blog.html               # Career tips blog page
├── cv-checker.html         # ATS Score checker (existing)
├── privacy-policy.html     # Privacy policy (existing)
├── terms-of-service.html   # Terms of service (existing)
├── styles.css              # Main site styles
├── form-styles.css         # Form page styles
├── blog.css                # Blog page styles
├── toggle.css              # Country toggle styles
├── script.js               # Main site JavaScript
├── form-script.js          # Form handling JavaScript
├── blog.js                 # Blog functionality JavaScript
├── country-detect.js       # Country detection & currency switching
├── images/                 # Image assets
│   ├── Asset 6.png         # Logo
│   ├── Asset 6 (2).png     # Favicon
│   └── hero_image.png      # Hero section image
├── carousel/               # Resume sample images
│   └── image_1-7.png       # Sample resume images
└── README.md               # This file
```

## 🌐 Entry URIs

| Page | Path | Description |
|------|------|-------------|
| Home | `/index.html` | Main landing page with packages |
| Form | `/form.html?package={plan}` | Submit information (plan: basic, professional, executive, custom) |
| Blog | `/blog.html` | Career tips and articles |
| ATS Checker | `/cv-checker.html` | Check resume ATS score |
| Privacy | `/privacy-policy.html` | Privacy policy |
| Terms | `/terms-of-service.html` | Terms of service |

## 💰 Pricing Data

### Bangladesh (BD)
| Package | Price |
|---------|-------|
| Basic Starter | ৳999 |
| Professional | ৳1,999 |
| Executive Elite | ৳3,999 |
| Custom | Custom |

### Indonesia (ID)
| Package | Price |
|---------|-------|
| Basic Starter | Rp 129,000 |
| Professional | Rp 259,000 |
| Executive Elite | Rp 519,000 |
| Custom | Custom |

## 🔧 Technical Details

### Country Detection Flow
1. Check localStorage for saved preference
2. If no preference, detect via IP geolocation APIs:
   - ipapi.co/json/
   - ip-api.com/json/
   - ipwho.is/
3. Save detected/selected country to localStorage
4. Update pricing, form examples, and toggle UI

### Form Submission
- Submits to Netlify Functions proxy → Google Apps Script
- Handles file uploads (profile photo, existing CV)
- Generates invoice ID on server
- Shows success modal with WhatsApp confirmation

### Blog Pagination
- 6 posts per page
- Featured post displayed separately at top
- Articles sorted by date (newest first)
- Real-time search and category filtering

## 📱 Responsive Design

- Desktop: Full layouts, 4-column pricing grid
- Tablet (1024px): 2-column pricing, adjusted grids
- Mobile (768px): Single column, hamburger menu
- Small Mobile (576px): Compact spacing, touch-friendly

## 🚀 Deployment

To deploy this website, use the **Publish tab** in the project interface. It will handle all deployment processes automatically and provide a live website URL.

## 🔜 Potential Future Enhancements

1. **Individual Blog Post Pages**: Create dedicated pages for each blog article
2. **CMS Integration**: Add a content management system for blog posts
3. **User Authentication**: Client portal for tracking order status
4. **Payment Integration**: Online payment processing
5. **Multi-language Support**: Full Indonesian language translation
6. **Analytics Dashboard**: Track visitor statistics and conversions

## 📞 Contact

- Email: draftacv@gmail.com
- Phone: (+62) 8112087181
- WhatsApp: [wa.me/628112087181](https://wa.me/628112087181)
- Instagram: [@draftacv](https://www.instagram.com/draftacv)

---

© 2025 DraftaCV. All rights reserved. | Handcrafted Resumes That Guard Your Future
