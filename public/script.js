// Fetch posts from the server and display them on the "Postlarım" page
fetch('/posts')
    .then(response => response.json())
    .then(posts => {
        const postList = document.getElementById('postList');
        
        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.classList.add('post-card');
            postElement.innerHTML = `
                <h3>${post.title}</h3>
                <p>${post.content.slice(0, 100)}...</p>
                <button onclick="viewPost('${post.title}', '${post.content}')">Detay</button>
            `;
            postList.appendChild(postElement);
        });
    });

function viewPost(title, content) {
    localStorage.setItem('selectedPost', JSON.stringify({ title, content }));
    window.location.href = 'postDetay.html';
}
