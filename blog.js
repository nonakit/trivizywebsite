// Blog Page JavaScript
// Handles blog display, filtering, search, and pagination
// Now fetches data from the CMS API

// Initialize Firebase
                                        /*let db;
                                        if (typeof firebase !== 'undefined') {
                                          firebase.initializeApp(window.firebaseConfig);
                                          db = firebase.firestore();
                                        }*/

// Blog posts data - will be populated from API
let blogPosts = [];

// Pagination settings
const postsPerPage = 6;
let currentPage = 1;
let filteredPosts = [];
let currentCategory = 'all';
let searchQuery = '';

// Initialize blog page
document.addEventListener('DOMContentLoaded', async function() {
  // Load posts from API
  await loadBlogPosts();
  
  // Setup mobile menu
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenuBtn.classList.toggle('active');
      mobileMenu.classList.toggle('active');
    });
  }
});

// Load blog posts from Firestore
async function loadBlogPosts() {
  try {
    console.log('🔍 Starting to load posts from CMS Proxy...');
    
    // Use the full URL to ensure it works from any domain
    const response = await fetch('https://draftacv-blog-cms.netlify.app/api/get-posts');
    
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    console.log('📦 Total documents fetched:', data.length);

    blogPosts = data
      .filter(post => post.published === true)
      .map(post => {
        // Safe Date Parsing
        let displayDate = new Date().toISOString().split('T')[0];
        if (post.publish_date) {
          if (post.publish_date.seconds) {
            displayDate = new Date(post.publish_date.seconds * 1000).toISOString().split('T')[0];
          } else {
            displayDate = new Date(post.publish_date).toISOString().split('T')[0];
          }
        }

        return {
          id: post.id,
          title: post.title || 'Untitled',
          excerpt: post.excerpt || '',
          content: post.content || '',
          category: post.category || 'general',
          // ✅ FIX: Use the categoryLabels object defined at the top of your file
          categoryLabel: categoryLabels[post.category] || 'General',
          date: displayDate,
          readTime: post.read_time || '5 min read',
          image: post.featured_image || 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80',
          featured: post.featured || false,
          slug: post.slug || '',
          author: post.author || 'DraftaCV Team',
          tags: post.tags || []
        };
      });

    blogPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
    filteredPosts = [...blogPosts];
    
    const totalEl = document.getElementById('totalArticles');
    if (totalEl) totalEl.textContent = blogPosts.length;
    
    renderFeaturedPost();
    renderBlogGrid();
    renderPagination();
    
  } catch (error) {
    console.error('❌ Error loading blog posts:', error);
    const grid = document.getElementById('blogGrid');
    if (grid) grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem;">Error loading posts. Please try again later.</p>';
  }
}

// Get category label from category slug
function getCategoryLabel(category) {
  const labels = {
    'resume-tips': 'Resume Tips',
    'career-advice': 'Career Advice',
    'interview-prep': 'Interview Prep',
    'job-search': 'Job Search'
  };
  return labels[category] || category || 'Uncategorized';
}

// Render featured post
function renderFeaturedPost() {
  const featuredContainer = document.getElementById('featuredPost');
  const featuredPost = filteredPosts.find(post => post.featured) || filteredPosts[0];
  
  console.log('🌟 Featured post:', featuredPost);
  console.log('🌟 Featured container:', featuredContainer);
  
  if (!featuredPost || filteredPosts.length === 0) {
    featuredContainer.innerHTML = '';
    console.log('⚠️ No featured post to display');
    return;
  }
  
  console.log('✅ Rendering featured post...');
  
  featuredContainer.innerHTML = `
    <article class="featured-post" onclick="openPost('${featuredPost.id}')">
      <div class="featured-post-image">
        <img src="${featuredPost.image}" alt="${featuredPost.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80'">
      </div>
      <div class="featured-post-content">
        <span class="featured-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          Featured
        </span>
        <span class="featured-post-category">${featuredPost.categoryLabel}</span>
        <h2 class="featured-post-title">${featuredPost.title}</h2>
        <p class="featured-post-excerpt">${featuredPost.excerpt}</p>
        <div class="featured-post-meta">
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            ${formatDate(featuredPost.date)}
          </span>
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            ${featuredPost.readTime}
          </span>
        </div>
      </div>
    </article>
  `;
}

// Render pagination
function renderPagination() {
  const paginationContainer = document.getElementById('pagination');
  
  // Calculate total pages based on filtered posts
  const featuredPost = filteredPosts.find(post => post.featured);
  let gridPosts = filteredPosts.filter(post => !post.featured || (searchQuery || currentCategory !== 'all'));
  
  if (searchQuery || currentCategory !== 'all') {
    gridPosts = filteredPosts;
  }
  
  const totalPages = Math.ceil(gridPosts.length / postsPerPage);
  
  if (totalPages <= 1) {
    paginationContainer.innerHTML = '';
    return;
  }
  
  let paginationHTML = '';
  
  // Previous button
  paginationHTML += `
    <button class="pagination-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
        <path d="M15 18l-6-6 6-6"/>
      </svg>
    </button>
  `;
  
  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 || 
      i === totalPages || 
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      paginationHTML += `
        <button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>
      `;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      paginationHTML += '<span class="pagination-ellipsis">...</span>';
    }
  }
  
  // Next button
  paginationHTML += `
    <button class="pagination-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </button>
  `;
  
  paginationContainer.innerHTML = paginationHTML;
}

// Change page
function changePage(page) {
  const featuredPost = filteredPosts.find(post => post.featured);
  let gridPosts = filteredPosts.filter(post => !post.featured || (searchQuery || currentCategory !== 'all'));
  
  if (searchQuery || currentCategory !== 'all') {
    gridPosts = filteredPosts;
  }
  
  const totalPages = Math.ceil(gridPosts.length / postsPerPage);
  
  if (page < 1 || page > totalPages) return;
  
  currentPage = page;
  renderBlogGrid();
  renderPagination();
  
  // Scroll to top of blog grid
  document.querySelector('.blog-grid-section').scrollIntoView({ behavior: 'smooth' });
}

// Filter by category
function filterByCategory(category) {
  currentCategory = category;
  currentPage = 1;
  
  // Update active tab
  document.querySelectorAll('.category-tab').forEach(tab => {
    tab.classList.remove('active');
    if (tab.dataset.category === category) {
      tab.classList.add('active');
    }
  });
  
  // Filter posts
  if (category === 'all') {
    filteredPosts = blogPosts.filter(post => 
      searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    );
  } else {
    filteredPosts = blogPosts.filter(post => 
      post.category === category &&
      (searchQuery === '' || 
       post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
       post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }
  
  // Re-sort by date
  filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  renderFeaturedPost();
  renderBlogGrid();
  renderPagination();
}

// Search blogs
function searchBlogs() {
  searchQuery = document.getElementById('blogSearch').value.trim();
  currentPage = 1;
  
  // Filter based on current category and search query
  if (currentCategory === 'all') {
    filteredPosts = blogPosts.filter(post => 
      searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase())
    );
  } else {
    filteredPosts = blogPosts.filter(post => 
      post.category === currentCategory &&
      (searchQuery === '' || 
       post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
       post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }
  
  // Re-sort by date
  filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  renderFeaturedPost();
  renderBlogGrid();
  renderPagination();
}

// Clear search
function clearSearch() {
  document.getElementById('blogSearch').value = '';
  searchQuery = '';
  currentCategory = 'all';
  currentPage = 1;
  
  // Reset category tabs
  document.querySelectorAll('.category-tab').forEach(tab => {
    tab.classList.remove('active');
    if (tab.dataset.category === 'all') {
      tab.classList.add('active');
    }
  });
  
  filteredPosts = [...blogPosts];
  filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  renderFeaturedPost();
  renderBlogGrid();
  renderPagination();
}

// Open post - navigate to individual post page
function openPost(postId) {
  const post = blogPosts.find(p => p.id === postId);
  if (post) {
    // Navigate to the blog post page with the post ID
    window.location.href = `blog-post.html?id=${postId}`;
  }
}

// Format date
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

// Newsletter subscription
function subscribeNewsletter() {
  const emailInput = document.getElementById('newsletterEmail');
  const email = emailInput.value.trim();
  
  if (!email) {
    alert('Please enter your email address.');
    return;
  }
  
  if (!isValidEmail(email)) {
    alert('Please enter a valid email address.');
    return;
  }
  
  // Simulate subscription
  alert(`Thank you for subscribing!\n\nWe'll send career tips and updates to: ${email}`);
  emailInput.value = '';
}

// Email validation
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
// Load blog posts via Netlify Proxy API
async function loadBlogPosts() {
  try {
    console.log('🔍 Starting to load posts from CMS Proxy...');
    const response = await fetch('https://draftacv-blog-cms.netlify.app/api/get-posts');
    
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    console.log('📦 Total documents fetched:', data.length);

    blogPosts = data
      .filter(post => post.published === true)
      .map(post => {
        // Safe Date Parsing
        let displayDate = new Date().toISOString().split('T')[0];
        if (post.publish_date) {
          if (post.publish_date.seconds) {
            displayDate = new Date(post.publish_date.seconds * 1000).toISOString().split('T')[0];
          } else {
            displayDate = new Date(post.publish_date).toISOString().split('T')[0];
          }
        }

        return {
          id: post.id,
          title: post.title || 'Untitled',
          excerpt: post.excerpt || '',
          content: post.content || '',
          category: post.category || 'general',
          // Mapping to the variable name used in your HTML template
          categoryLabel: post.category_label || (typeof getCategoryLabel === 'function' ? getCategoryLabel(post.category) : post.category),
          date: displayDate,
          readTime: post.read_time || '5 min read',
          image: post.featured_image || 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80',
          featured: post.featured || false,
          slug: post.slug || '',
          author: post.author || 'DraftaCV Team',
          tags: post.tags || []
        };
      });

    blogPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
    filteredPosts = [...blogPosts];
    
    const totalEl = document.getElementById('totalArticles');
    if (totalEl) totalEl.textContent = blogPosts.length;
    
    renderFeaturedPost();
    renderBlogGrid();
    renderPagination();
    
  } catch (error) {
    console.error('❌ Error loading blog posts:', error);
    const grid = document.getElementById('blogGrid');
    if (grid) grid.innerHTML = '<p>Error loading posts.</p>';
  }
}
// Render blog grid
function renderBlogGrid() {
  const blogGrid = document.getElementById('blogGrid');
  const noResults = document.getElementById('noResults');
  
  console.log('📊 Rendering blog grid...');
  console.log('📊 Filtered posts:', filteredPosts.length);
  
  // Filter out featured post from grid to avoid duplication
  const featuredPost = filteredPosts.find(post => post.featured);
  let gridPosts = filteredPosts.filter(post => !post.featured || (searchQuery || currentCategory !== 'all'));
  
  // If filtering/searching, include all matching posts
  if (searchQuery || currentCategory !== 'all') {
    gridPosts = filteredPosts;
  }
  
  console.log('📊 Grid posts to show:', gridPosts.length);
  
  // Calculate pagination
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const paginatedPosts = gridPosts.slice(startIndex, endIndex);
  
  console.log('📊 Paginated posts:', paginatedPosts.length);
  
  if (paginatedPosts.length === 0) {
    blogGrid.innerHTML = '';
    noResults.style.display = 'block';
    console.log('⚠️ No posts to display in grid');
    return;
  }
  
  noResults.style.display = 'none';
  console.log('✅ Rendering', paginatedPosts.length, 'posts in grid');
  
  blogGrid.innerHTML = paginatedPosts.map(post => `
    <article class="blog-card" onclick="openPost('${post.id}')">
      <div class="blog-card-image">
        <img src="${post.image}" alt="${post.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80'">
      </div>
      <div class="blog-card-content">
        <span class="blog-card-category">${post.categoryLabel}</span>
        <h3 class="blog-card-title">${post.title}</h3>
        <p class="blog-card-excerpt">${post.excerpt}</p>
        <div class="blog-card-meta">
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            ${post.date}
          </span>
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            ${post.readTime}
          </span>
        </div>
      </div>
    </article>
  `).join('');
}
// Helper to turn IDs into readable labels
function getCategoryLabel(category) {
    const labels = {
        'resume-tips': 'Resume Tips',
        'career-advice': 'Career Advice',
        'interview-prep': 'Interview Prep',
        'job-search': 'Job Search'
    };
    return labels[category] || 'General';
}