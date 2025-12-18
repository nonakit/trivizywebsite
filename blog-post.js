// Blog Post Page JavaScript
// Handles individual blog post display with Secure Proxy

// Initialize Firebase - Not needed for DB, only for Auth if you add it later
/* let db;
if (typeof firebase !== 'undefined') {
  firebase.initializeApp(window.firebaseConfig);
}
*/

// Global state
let currentPost = null;
let allPosts = [];

// Initialize
document.addEventListener('DOMContentLoaded', async function() {
  // Get post ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id');
  
  if (!postId) {
    showError();
    return;
  }
  
  // Load the post
  await loadPost(postId);
  
  // Setup mobile menu
  setupMobileMenu();
});

// Load single post from Proxy API
async function loadPost(postId) {
  try {
    console.log('🔍 Loading post from Proxy:', postId);
    
    // 1. Fetch from your Netlify Proxy
    const response = await fetch('https://draftacv-blog-cms.netlify.app/api/get-posts');
    if (!response.ok) throw new Error('Network response was not ok');
    
    const allPostsData = await response.json();
    
    // 2. Find the specific post
    const post = allPostsData.find(p => p.id === postId);
    
    if (!post) {
      console.error('❌ Post not found:', postId);
      showError();
      return;
    }

    // 3. Safe Date and Category Label Processing
    let displayDate = 'Recent';
    if (post.publish_date) {
      const dateObj = post.publish_date.seconds ? 
                      new Date(post.publish_date.seconds * 1000) : 
                      new Date(post.publish_date);
      displayDate = dateObj.toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' 
      });
    }

    const categoryLabels = {
      'resume-tips': 'Resume Tips',
      'career-advice': 'Career Advice',
      'interview-prep': 'Interview Prep',
      'job-search': 'Job Search'
    };

    // 4. Update the global state and UI
    currentPost = {
      ...post,
      date: displayDate,
      categoryLabel: categoryLabels[post.category] || 'General',
      image: post.featured_image || 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=1200&q=80'
    };

    renderPost(currentPost);
    
    // Load related posts
    allPosts = allPostsData.filter(p => p.id !== postId && p.published === true);
    renderRelatedPosts();

  } catch (error) {
    console.error('❌ Error loading post:', error);
    showError();
  }
}

// Render post content
function renderPost(post) {
  // Update browser tab title and meta description
  document.title = `${post.title} - DraftaCV Blog`;
  const metaDesc = document.getElementById('meta-description');
  if (metaDesc) metaDesc.content = post.excerpt || post.title;

  const postContainer = document.getElementById('post-container');
  if (!postContainer) return;

  // Render the post content
  postContainer.innerHTML = `
    <header class="post-header">
      <div class="post-meta-top">
        <span class="post-category">${post.categoryLabel}</span>
        <span class="post-date">${post.date}</span>
        <span class="post-read-time">${post.read_time || '5 min read'}</span>
      </div>
      <h1 class="post-title">${post.title}</h1>
      <div class="post-author">
        <div class="author-info">
          <span class="author-name">By ${post.author || 'DraftaCV Team'}</span>
        </div>
      </div>
    </header>

    <div class="post-featured-image">
      <img src="${post.image}" alt="${post.title}" onerror="this.src='https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=1200&q=80'">
    </div>

    <div class="post-body">
      ${post.content}
    </div>

    <footer class="post-footer">
      <div class="post-tags">
        ${(post.tags || []).map(tag => `<span class="tag">#${tag}</span>`).join('')}
      </div>
    </footer>
  `;
}

// Render related posts
function renderRelatedPosts() {
  const relatedGrid = document.getElementById('related-posts-grid');
  if (!relatedGrid || allPosts.length === 0) return;
  
  // Get up to 3 posts from same category or just the latest
  let related = allPosts
    .filter(p => p.category === currentPost.category)
    .slice(0, 3);
    
  if (related.length < 3) {
    const remaining = allPosts
      .filter(p => p.category !== currentPost.category)
      .slice(0, 3 - related.length);
    related = [...related, ...remaining];
  }
  
  relatedGrid.innerHTML = related.map(post => `
    <article class="related-post-card" onclick="location.href='blog-post.html?id=${post.id}'">
      <div class="related-post-image">
        <img src="${post.featured_image || 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&q=80'}" alt="${post.title}">
      </div>
      <div class="related-post-content">
        <h4 class="related-post-title">${post.title}</h4>
        <span class="related-post-date">${new Date(post.publish_date.seconds ? post.publish_date.seconds * 1000 : post.publish_date).toLocaleDateString()}</span>
      </div>
    </article>
  `).join('');
}

// Show error state
function showError() {
  const container = document.getElementById('post-container');
  if (container) {
    container.innerHTML = `
      <div class="error-container">
        <h2>Post Not Found</h2>
        <p>Sorry, the blog post you are looking for doesn't exist or has been moved.</p>
        <a href="blog.html" class="btn-primary">Back to Blog</a>
      </div>
    `;
  }
}

// Share functions
function shareTwitter() {
  const text = encodeURIComponent(currentPost ? currentPost.title : document.title);
  const url = encodeURIComponent(window.location.href);
  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'width=550,height=420');
}

function shareLinkedIn() {
  const url = encodeURIComponent(window.location.href);
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'width=550,height=420');
}

function shareFacebook() {
  const url = encodeURIComponent(window.location.href);
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=550,height=420');
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    const btn = document.querySelector('.share-btn.copy');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M20 6L9 17l-5-5"/></svg>`;
    btn.style.background = '#10b981';
    btn.style.color = 'white';
    btn.style.borderColor = '#10b981';
    
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.style.background = '';
      btn.style.color = '';
      btn.style.borderColor = '';
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy:', err);
  });
}

// Setup mobile menu
function setupMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenuBtn.classList.toggle('active');
      mobileMenu.classList.toggle('active');
    });
  }
}