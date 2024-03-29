// Client

// Get stored data
let storedToken = localStorage.getItem('jwtToken');
let storedUsername = localStorage.getItem('username');

// Set the username in the HTML
const usernameElement = document.getElementById('username');
usernameElement.textContent = storedUsername;

// Load page and event listeners
document.addEventListener('DOMContentLoaded', () => {
  const baseUrl = window.location.origin;
  fetchPosts(baseUrl);

  if (storedToken) {
    const storedRole = localStorage.getItem('userRole');
    if (storedRole == 'admin') {
      showAdminFeatures();
    }
  }

  const form = document.getElementById('new-post-form');
  if (form) {
    form.addEventListener('submit', (event) => createPost(event, baseUrl));
  }

  const loginForm = document.getElementById('login-form');
  loginForm.addEventListener('submit', (event) => loginUser(event, baseUrl));

  const registerForm = document.getElementById('register-form');
  registerForm.addEventListener('submit', (event) =>
    registerUser(event, baseUrl)
  );
});

// Post details
const postDetailContainer = document.getElementById('post-detail-container');

// Add a listener for detail page
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('post');
    if (postId) {
      showPostDetail(postId);
    }
  });


// Fetch posts
async function fetchPosts(baseUrl) {
    const res = await fetch(`${baseUrl}/posts`);
    const data = await res.json();
    const postsList = document.getElementById('posts-list');
    const isAdmin = localStorage.getItem('userRole') === 'admin';
  
    if (postsList) {
      postsList.innerHTML = data
        .map((post, index) => {
          const deleteButtonStyle = isAdmin ? '' : 'display: none';
          const updateButtonStyle = isAdmin ? '' : 'display: none';
  
          return `
        <div id="${post._id}" class="post">
            <img src="${post.imageUrl}" alt="Image" />
            <div class="post-title">
              ${
                index === 0
                  ? `<h1><a href="/post/${post._id}">${post.title}</a></h1>`
                  : `<h3><a href="/post/${post._id}">${post.title}</a></h3>`
              }
            </div>
            ${
              index === 0
                ? `<span><p>${post.author}</p><p>${post.timestamp}</p></span>`
                : ''
            }
            <div id="admin-buttons">
              <button class="btn" style="${deleteButtonStyle}" onclick="deletePost('${
            post._id
          }', '${baseUrl}')">Delete</button>
              <button class="btn" style="${updateButtonStyle}" onclick="showUpdateForm('${
            post._id
          }', '${post.title}', '${post.content}')">Update</button>
            </div>
            ${index === 0 ? '<hr>' : ''}
            ${index === 0 ? '<h2>All Articles</h2>' : ''}
          </div>
        `;
        })
        .join('');
    }
  }
  
  async function createPost(event, baseUrl) {
    event.preventDefault();
    const titleInput = document.getElementById('title');
    const contentInput = document.getElementById('content');
    const imageUrlInput = document.getElementById('image-url');
  
    // Get the values from the input fields
    const title = titleInput.value;
    const content = contentInput.value;
    const imageUrl = imageUrlInput.value;
  
    // Ensure that inputs are not empty
    if (!title || !content || !imageUrl) {
      alert('Please fill in all fields.');
      return;
    }
  
    const newPost = {
      title,
      content,
      imageUrl,
      author: storedUsername,
      timestamp: new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    };
  
    const headers = new Headers({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${storedToken}`,
    });
    const requestOptions = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(newPost),
    };
  
    try {
      const response = await fetch(`${baseUrl}/posts`, requestOptions);
      if (!response.ok) {
        const storedRole = localStorage.getItem('userRole');
        console.error(`Error creating the post: HTTP Status ${response.status}`);
      } else {
        // Clear the input data
        titleInput.value = '';
        contentInput.value = '';
        imageUrlInput.value = '';
        alert('Create post successful!');
      }
    } catch (error) {
      console.error('An errro occured during the fetch:', error);
      alert('Create post failed.');
    }
    fetchPosts(baseUrl);
  }

  // Delete Post
async function deletePost(postId, baseUrl) {
    const deleteUrl = `${baseUrl}/posts/${postId}`;
    try {
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });
  
      if (response.ok) {
        alert('Delete post successful!');
        fetchPosts(baseUrl);
      } else {
        alert('Delete post failed.');
      }
    } catch (error) {
      console.error(`Error while deleting post: ${error}`);
      alert('Delete post failed.');
    }
  }