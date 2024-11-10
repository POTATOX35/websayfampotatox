


// Fetch posts from the server and display them on the "Postlarım" page
fetch('/posts')
    .then(response => response.json())
    .then(posts => {
        // Postları tarihe göre sıralama
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        const postList = document.getElementById('postList');

        posts.forEach(post => {
            const postElement = document.createElement('div');
            // \n karakterlerini kaldır ve ' karakterlerini " ile değiştir
            let cleanContent = post.content.replace(/\n/g, '').replace(/'/g, '"');
            postElement.classList.add('post-card');
            postElement.innerHTML = `
                <h3>${post.title}</h3>
                <p>${cleanContent.slice(0, 100)}...</p>
                <button onclick="viewPost('${post.title}', \`${cleanContent}\`, '${post.id}')">Detay</button>
                <div class="post-date">${new Date(post.date).toLocaleDateString()}</div>
            `;
            postList.appendChild(postElement);
        });
    });

function viewPost(title, content,id) {
    
    window.location.href = '/post/' + encodeURIComponent(id);  // post title'ı URL'ye ekliyoruz
}











