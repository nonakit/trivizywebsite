// Blog CMS JavaScript
// Handles all CMS functionality

// Initialize Firebase for CMS
let db;
if (typeof firebase !== 'undefined') {
  firebase.initializeApp(window.firebaseConfig);
  db = firebase.firestore();
}

// Global state
let posts = [];
let currentEditId = null;
let savedSelection = null;

// Category labels mapping
const categoryLabels = {
  'resume-tips': 'Resume Tips',
  'career-advice': 'Career Advice',
  'interview-prep': 'Interview Prep',
  'job-search': 'Job Search'
};

// Initialize CMS
document.addEventListener('DOMContentLoaded', function() {
  loadPosts();
  setupMetaCharCount();
  setDefaultDate();
  setupFeaturedImagePreview();
});

// Load all posts from Firestore
async function loadPosts() {
  try {
    console.log('🔍 Loading posts from Firestore...');
    const data = await FirestoreAPI.getAll();
    posts = data.data || [];
    console.log('✅ Loaded', posts.length, 'posts');
    
    updateDashboardStats();
    updateCategoryCounts();
    renderRecentPosts();
    renderPostsTable();
  } catch (error) {
    console.error('Error loading posts:', error);
    showToast('Failed to load posts', 'error');
  }
}

// Update dashboard statistics
function updateDashboardStats() {
  document.getElementById('total-posts').textContent = posts.length;
  document.getElementById('published-posts').textContent = posts.filter(p => p.published).length;
  document.getElementById('draft-posts').textContent = posts.filter(p => !p.published).length;
  document.getElementById('featured-posts').textContent = posts.filter(p => p.featured).length;
}

// Update category counts
function updateCategoryCounts() {
  const categories = ['resume-tips', 'career-advice', 'interview-prep', 'job-search'];
  categories.forEach(cat => {
    const count = posts.filter(p => p.category === cat).length;
    const elem = document.getElementById(`cat-${cat}`);
    if (elem) {
      elem.textContent = `${count} posts`;
    }
  });
}

// Render recent posts on dashboard
function renderRecentPosts() {
  const container = document.getElementById('recent-posts');
  const recentPosts = posts.slice(0, 5);
  
  if (recentPosts.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-file-alt"></i>
        <h3>No posts yet</h3>
        <p>Create your first blog post to get started</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = recentPosts.map(post => `
    <div class="recent-post-item" onclick="editPost('${post.id}')">
      <img src="${post.featured_image || 'https://via.placeholder.com/60x60?text=No+Image'}" alt="${post.title}" class="recent-post-image">
      <div class="recent-post-info">
        <div class="recent-post-title">${post.title || 'Untitled'}</div>
        <div class="recent-post-meta">
          <span class="post-status ${post.published ? 'published' : 'draft'}">
            ${post.published ? 'Published' : 'Draft'}
          </span>
          <span>${formatDate(post.publish_date)}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// Render posts table
function renderPostsTable() {
  const tbody = document.getElementById('posts-table-body');
  const emptyState = document.getElementById('posts-empty');
  
  if (posts.length === 0) {
    tbody.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }
  
  emptyState.style.display = 'none';
  tbody.innerHTML = posts.map(post => `
    <tr>
      <td>
        <div class="post-title-cell">
          <img src="${post.featured_image || 'https://via.placeholder.com/48x48?text=No+Image'}" alt="" class="post-thumb">
          <span class="post-title-text">${post.title || 'Untitled'}</span>
        </div>
      </td>
      <td>
        <span class="category-badge">${categoryLabels[post.category] || 'Uncategorized'}</span>
      </td>
      <td>
        <span class="post-status ${post.published ? 'published' : 'draft'}">
          ${post.published ? 'Published' : 'Draft'}
        </span>
      </td>
      <td>${formatDate(post.publish_date)}</td>
      <td>
        <div class="action-btns">
          <button class="action-btn" onclick="editPost('${post.id}')" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-btn" onclick="viewPost('${post.id}')" title="View">
            <i class="fas fa-eye"></i>
          </button>
          <button class="action-btn delete" onclick="deletePost('${post.id}')" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Filter posts
function filterPosts() {
  const search = document.getElementById('posts-search').value.toLowerCase();
  const filter = document.getElementById('posts-filter').value;
  
  let filtered = posts;
  
  if (search) {
    filtered = filtered.filter(p => 
      (p.title || '').toLowerCase().includes(search) ||
      (p.excerpt || '').toLowerCase().includes(search)
    );
  }
  
  if (filter === 'published') {
    filtered = filtered.filter(p => p.published);
  } else if (filter === 'draft') {
    filtered = filtered.filter(p => !p.published);
  }
  
  // Temporarily update posts array for rendering
  const originalPosts = posts;
  posts = filtered;
  renderPostsTable();
  posts = originalPosts;
}

// Switch view
function switchView(view) {
  document.querySelectorAll('.cms-view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  
  document.getElementById(`${view}-view`).classList.add('active');
  document.querySelector(`.nav-item[data-view="${view}"]`).classList.add('active');
}

// Reset editor for new post
function resetEditor() {
  currentEditId = null;
  document.getElementById('editor-mode-label').textContent = 'New Post';
  document.getElementById('post-title').value = '';
  document.getElementById('post-excerpt').value = '';
  document.getElementById('post-content').innerHTML = '';
  document.getElementById('post-category').value = '';
  document.getElementById('post-read-time').value = '5';
  document.getElementById('post-featured').checked = false;
  document.getElementById('post-author').value = 'DraftaCV Team';
  document.getElementById('post-meta').value = '';
  document.getElementById('post-tags').value = '';
  document.getElementById('featured-image-url').value = '';
  
  const preview = document.getElementById('featured-image-preview');
  preview.innerHTML = `
    <i class="fas fa-cloud-upload-alt"></i>
    <span>Click to add image URL</span>
  `;
  
  document.getElementById('delete-card').style.display = 'none';
  setDefaultDate();
}

// Set default date to now
function setDefaultDate() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  document.getElementById('post-date').value = now.toISOString().slice(0, 16);
}

// Edit existing post
async function editPost(id) {
  const post = posts.find(p => p.id === id);
  if (!post) {
    showToast('Post not found', 'error');
    return;
  }
  
  currentEditId = id;
  switchView('editor');
  
  document.getElementById('editor-mode-label').textContent = 'Edit Post';
  document.getElementById('post-title').value = post.title || '';
  document.getElementById('post-excerpt').value = post.excerpt || '';
  document.getElementById('post-content').innerHTML = post.content || '';
  document.getElementById('post-category').value = post.category || '';
  document.getElementById('post-read-time').value = parseInt(post.read_time) || 5;
  document.getElementById('post-featured').checked = post.featured || false;
  document.getElementById('post-author').value = post.author || 'DraftaCV Team';
  document.getElementById('post-meta').value = post.meta_description || '';
  document.getElementById('post-tags').value = (post.tags || []).join(', ');
  document.getElementById('featured-image-url').value = post.featured_image || '';
  
 // Set publish date - handle Firestore timestamp
if (post.publish_date) {
  let date;
  if (post.publish_date.seconds) {
    date = new Date(post.publish_date.seconds * 1000);
  } else {
    date = new Date(post.publish_date);
  }
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  document.getElementById('post-date').value = date.toISOString().slice(0, 16);
}

  // Update featured image preview
  const preview = document.getElementById('featured-image-preview');
  if (post.featured_image) {
    preview.innerHTML = `<img src="${post.featured_image}" alt="Featured image">`;
  } else {
    preview.innerHTML = `
      <i class="fas fa-cloud-upload-alt"></i>
      <span>Click to add image URL</span>
    `;
  }
  
  // Show delete button
  document.getElementById('delete-card').style.display = 'block';
  
  // Update meta char count
  updateMetaCharCount();
}

// Get post data from form
function getPostData() {
  const title = document.getElementById('post-title').value.trim();
  const excerpt = document.getElementById('post-excerpt').value.trim();
  const content = document.getElementById('post-content').innerHTML;
  const category = document.getElementById('post-category').value;
  const readTime = document.getElementById('post-read-time').value;
  const featured = document.getElementById('post-featured').checked;
  const publishDate = document.getElementById('post-date').value;
  const author = document.getElementById('post-author').value.trim();
  const metaDescription = document.getElementById('post-meta').value.trim();
  const tagsStr = document.getElementById('post-tags').value.trim();
  const featuredImage = document.getElementById('featured-image-url').value.trim();
  
  // Generate slug from title
  const slug = title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  // Parse tags
  const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(t => t) : [];
  
  return {
    title,
    slug,
    excerpt,
    content,
    category,
    category_label: categoryLabels[category] || '',
    featured_image: featuredImage,
    read_time: `${readTime} min read`,
    featured,
    publish_date: publishDate ? new Date(publishDate).getTime() : Date.now(),
    author,
    meta_description: metaDescription,
    tags
  };
}

// Validate post data
function validatePost(data) {
  if (!data.title) {
    showToast('Please enter a post title', 'warning');
    return false;
  }
  if (!data.category) {
    showToast('Please select a category', 'warning');
    return false;
  }
  return true;
}

// Save as draft
async function saveDraft() {
  const data = getPostData();
  if (!data.title) {
    showToast('Please enter a post title', 'warning');
    return;
  }
  
  data.published = false;
  await savePost(data);
}

// Publish post
async function publishPost() {
  const data = getPostData();
  if (!validatePost(data)) return;
  
  data.published = true;
  await savePost(data);
}

// Save post to Firestore
async function savePost(data) {
  try {
    console.log('💾 Saving post...', data);
    let savedPost;
    
    if (currentEditId) {
      // Update existing post
      savedPost = await FirestoreAPI.update(currentEditId, data);
      console.log('✅ Post updated');
    } else {
      // Create new post
      savedPost = await FirestoreAPI.create(data);
      console.log('✅ Post created');
    }
    
    // Reload posts and switch to posts view
    await loadPosts();
    switchView('posts');
    
  } catch (error) {
    console.error('Error saving post:', error);
    showToast('Failed to save post. Please try again.', 'error');
  }
}

// Delete post
async function deletePost(id) {
  const post = posts.find(p => p.id === id);
  if (!post) return;
  
  currentEditId = id;
  openModal('delete-modal');
}

// Delete current post (from editor)
function deleteCurrentPost() {
  if (!currentEditId) return;
  openModal('delete-modal');
}

// Confirm delete
async function confirmDeletePost() {
  if (!currentEditId) return;
  
  try {
    console.log('🗑️ Deleting post:', currentEditId);
    await FirestoreAPI.delete(currentEditId);
    console.log('✅ Post deleted');
    
    showToast('Post deleted successfully', 'success');
    closeModal('delete-modal');
    currentEditId = null;
    
    await loadPosts();
    switchView('posts');
    
  } catch (error) {
    console.error('Error deleting post:', error);
    showToast('Failed to delete post', 'error');
  }
}

// View post (open blog page)
function viewPost(id) {
  const post = posts.find(p => p.id === id);
  if (!post) return;
  
  // Open the blog post in a new tab
  window.open(`../blog-post.html?id=${id}`, '_blank');
}

// Rich text editor commands
function execCommand(command, value = null) {
  document.getElementById('post-content').focus();
  
  if (command === 'formatBlock') {
    document.execCommand('formatBlock', false, `<${value}>`);
  } else {
    document.execCommand(command, false, value);
  }
}

// Insert link
function insertLink() {
  saveSelection();
  document.getElementById('modal-link-url').value = '';
  document.getElementById('modal-link-text').value = '';
  openModal('link-modal');
}

// Confirm insert link
function confirmInsertLink() {
  const url = document.getElementById('modal-link-url').value.trim();
  const text = document.getElementById('modal-link-text').value.trim() || url;
  
  if (!url) {
    showToast('Please enter a URL', 'warning');
    return;
  }
  
  restoreSelection();
  document.execCommand('insertHTML', false, `<a href="${url}" target="_blank">${text}</a>`);
  closeModal('link-modal');
}

// Insert image
function insertImage() {
  saveSelection();
  document.getElementById('modal-image-url').value = '';
  document.getElementById('modal-image-alt').value = '';
  openModal('image-modal');
}

// Confirm insert image
function confirmInsertImage() {
  const url = document.getElementById('modal-image-url').value.trim();
  const alt = document.getElementById('modal-image-alt').value.trim() || 'Image';
  
  if (!url) {
    showToast('Please enter an image URL', 'warning');
    return;
  }
  
  restoreSelection();
  document.execCommand('insertHTML', false, `<img src="${url}" alt="${alt}" style="max-width: 100%; height: auto;">`);
  closeModal('image-modal');
}

// Insert code block
function insertCodeBlock() {
  document.getElementById('post-content').focus();
  document.execCommand('insertHTML', false, '<pre><code>// Your code here</code></pre>');
}

// Set featured image
function setFeaturedImage() {
  const currentUrl = document.getElementById('featured-image-url').value;
  document.getElementById('modal-featured-url').value = currentUrl;
  
  const previewModal = document.getElementById('modal-featured-preview');
  if (currentUrl) {
    previewModal.innerHTML = `<img src="${currentUrl}" alt="Preview">`;
  } else {
    previewModal.innerHTML = '';
  }
  
  openModal('featured-image-modal');
}

// Confirm featured image
function confirmFeaturedImage() {
  const url = document.getElementById('modal-featured-url').value.trim();
  document.getElementById('featured-image-url').value = url;
  
  const preview = document.getElementById('featured-image-preview');
  if (url) {
    preview.innerHTML = `<img src="${url}" alt="Featured image">`;
  } else {
    preview.innerHTML = `
      <i class="fas fa-cloud-upload-alt"></i>
      <span>Click to add image URL</span>
    `;
  }
  
  closeModal('featured-image-modal');
}

// Setup featured image preview in modal
function setupFeaturedImagePreview() {
  const urlInput = document.getElementById('modal-featured-url');
  urlInput.addEventListener('input', debounce(function() {
    const url = this.value.trim();
    const preview = document.getElementById('modal-featured-preview');
    if (url) {
      preview.innerHTML = `<img src="${url}" alt="Preview" onerror="this.parentElement.innerHTML='<span style=\\'color: var(--danger)\\'>Invalid image URL</span>'">`;
    } else {
      preview.innerHTML = '';
    }
  }, 500));
}

// Save selection for later restore
function saveSelection() {
  const sel = window.getSelection();
  if (sel.rangeCount > 0) {
    savedSelection = sel.getRangeAt(0);
  }
}

// Restore saved selection
function restoreSelection() {
  const editor = document.getElementById('post-content');
  editor.focus();
  if (savedSelection) {
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(savedSelection);
  }
}

// Modal functions
function openModal(modalId) {
  document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

// Toast notifications
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  };
  
  toast.innerHTML = `
    <i class="fas ${icons[type] || icons.info}"></i>
    <span>${message}</span>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Setup meta description character count
function setupMetaCharCount() {
  const metaInput = document.getElementById('post-meta');
  metaInput.addEventListener('input', updateMetaCharCount);
}

function updateMetaCharCount() {
  const metaInput = document.getElementById('post-meta');
  const countSpan = document.getElementById('meta-char-count');
  countSpan.textContent = metaInput.value.length;
  
  if (metaInput.value.length > 160) {
    countSpan.style.color = 'var(--danger)';
  } else {
    countSpan.style.color = 'var(--text-light)';
  }
}

// Format date - handle Firestore timestamp
function formatDate(timestamp) {
  if (!timestamp) return 'No date';
  
  let date;
  if (timestamp.seconds) {
    // Firestore Timestamp
    date = new Date(timestamp.seconds * 1000);
  } else {
    // Regular timestamp
    date = new Date(timestamp);
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Debounce helper
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func.apply(this, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Close modals when clicking outside
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal')) {
    e.target.classList.remove('active');
  }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
  // Ctrl/Cmd + S to save
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    const editorView = document.getElementById('editor-view');
    if (editorView.classList.contains('active')) {
      saveDraft();
    }
  }
  
  // Escape to close modals
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));
  }
});

// Firestore API wrapper functions
const FirestoreAPI = {
  async getAll() {
    const snapshot = await db.collection('blog_posts').orderBy('publish_date', 'desc').get();
    const data = [];
    snapshot.forEach(doc => {
      data.push({ id: doc.id, ...doc.data() });
    });
    return { data };
  },
  
  async getOne(id) {
    const doc = await db.collection('blog_posts').doc(id).get();
    if (!doc.exists) throw new Error('Not found');
    return { id: doc.id, ...doc.data() };
  },
  
  async create(data) {
    const docRef = await db.collection('blog_posts').add(data);
    return { id: docRef.id, ...data };
  },
  
  async update(id, data) {
    await db.collection('blog_posts').doc(id).update(data);
    return { id, ...data };
  },
  
  async delete(id) {
    await db.collection('blog_posts').doc(id).delete();
    return { success: true };
  }
};