function adjustMainMargin() {
    const headerHeight = document.querySelector('.sabit-bar').offsetHeight;
    const mainElement = document.querySelector('.sort-bar');
    console.log("Header Height:", headerHeight); // Konsola header yüksekliğini yazdırıyoruz
    console.log("Main Element:", mainElement);  // Konsola main elementini yazdırıyoruz
    mainElement.style.marginTop = `${headerHeight + 20}px`;
}

function adfixed(str) {
    if (str.length > 15) {
        return str.substring(0, 15);
    }
    return str;
}

function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function (match) {
        switch (match) {
            case '&': return '&amp;';
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '"': return '&quot;';
            case "'": return '&#39;';
        }
    });
}

const sortCriteriaSelect = document.getElementById('sortCriteria');
const sortOrderSelect = document.getElementById('sortOrder');

sortCriteriaSelect.addEventListener('change', function () {
    const selectedCriteria = sortCriteriaSelect.value;
    if (selectedCriteria === 'time') {
        sortOrderSelect.options[0].textContent = 'En Yeni';
        sortOrderSelect.options[1].textContent = 'En Eski';
    } else {
        sortOrderSelect.options[0].textContent = 'Azalan';
        sortOrderSelect.options[1].textContent = 'Artan';
    }
});

window.addEventListener('load', function () {
    const selectedCriteria = sortCriteriaSelect.value;
    if (selectedCriteria === 'time') {
        sortOrderSelect.options[0].textContent = 'En Yeni';
        sortOrderSelect.options[1].textContent = 'En Eski';
    } else {
        sortOrderSelect.options[0].textContent = 'Azalan';
        sortOrderSelect.options[1].textContent = 'Artan';
    }
});

fetch('/posts')
    .then(response => response.json())
    .then(posts => {
        const sortCriteria = document.getElementById('sortCriteria');
        const sortOrder = document.getElementById('sortOrder');

        function sortPosts(posts) {
            const criteria = sortCriteria.value;
            const order = sortOrder.value === 'asc' ? 1 : -1;
            posts.sort((a, b) => {
                if (criteria === 'time') {
                    return order * (new Date(a.date) - new Date(b.date));
                } else if (criteria === 'user') {
                    return order * a.userad.localeCompare(b.userad);
                }
            });
            updatePostList(posts);
        }

        function updatePostList(posts) {
            const postList = document.getElementById('postList');
            postList.innerHTML = ''; // Eski postları temizle
            posts.forEach(post => {
                const postElement = document.createElement('div');
                let cleanContent = post.content.replace(/\n/g, ' ').replace(/'/g, '"');
                const maxLength = 100;
                let truncatedContent = cleanContent.slice(0, maxLength);
                if (truncatedContent.length < cleanContent.length) {
                    const lastSpaceIndex = truncatedContent.lastIndexOf(' ');
                    if (lastSpaceIndex > -1) {
                        truncatedContent = truncatedContent.slice(0, lastSpaceIndex);
                    }
                    truncatedContent += ' (...)';
                }

                let namename = adfixed(escapeHtml(post.userad));
                postElement.classList.add('post-card', 'hidden');
                postElement.innerHTML = `
                    <h3>${escapeHtml(post.title)}</h3>
                    <p>${escapeHtml(truncatedContent)}</p>
                    <button onclick="viewPost('${escapeHtml(post.title)}', '${escapeHtml(cleanContent)}', '${escapeHtml(post.id)}')">POSTU OKU</button>
                    <div class="post-date">
  ${new Date(post.date).toLocaleDateString()}<br>
  ${new Date(post.date).toLocaleTimeString('tr-TR', {
  hour: '2-digit',
  minute: '2-digit'
})}
</div>
                    <div class="post-user">
                        <div id="UserNameSpan">${namename}</div>
                    </div>
                    
                `;

              
                // Profile Image'ı dinamik olarak oluşturuyoruz
                const profileImage = document.createElement('img');
                profileImage.src = post.profileimage || 'https://via.placeholder.com/50';
                profileImage.alt = 'Profile Image';
                profileImage.classList.add('profile-image');
// Son 24 saat içinde mi kontrolü
const postDate = new Date(post.date);
const now = new Date();
const timeDifference = now - postDate;
const oneDay = 24 * 60 * 60 * 1000; // 24 saat
if (timeDifference <= oneDay) {
    const todayLabel = document.createElement('div');
    todayLabel.classList.add('today-label'); // Stil için sınıf
    todayLabel.textContent = 'Yeni!';
    postElement.appendChild(todayLabel);
}
              
                const postUserDiv = postElement.querySelector('.post-user');
                postUserDiv.insertBefore(profileImage, postUserDiv.firstChild);

                const hoverBanner = document.createElement('div');
                hoverBanner.classList.add('hover-banner');
                hoverBanner.innerHTML = `<p>${post.userad}</p>`;
                postUserDiv.appendChild(hoverBanner);

                profileImage.addEventListener('mouseover', () => {
                    hoverBanner.style.display = 'block';
                    hoverBanner.style.opacity = '1';
                    hoverBanner.style.zIndex = 10000;
                });

                profileImage.addEventListener('mouseout', () => {
                    hoverBanner.style.opacity = '0';
                    hoverBanner.style.zIndex = 5000;
                    setTimeout(() => {
                        hoverBanner.style.display = 'none';
                    }, 300);
                });

                const userNameSpan = postElement.querySelector('#UserNameSpan');
                if (userNameSpan && (post.userad.length > 15)) {
                    userNameSpan.id = `UserNameSpann`;
                }

                postList.appendChild(postElement);
            });

            const postCards = document.querySelectorAll('.post-card');
            const animatePosts = () => {
                postCards.forEach(card => {
                    const rect = card.getBoundingClientRect();
                    if (rect.top >= -150 && rect.bottom <= window.innerHeight + 225) {
                        card.classList.add('show');
                        card.classList.remove('hidden');
                    } else {
                        card.classList.add('hidden');
                        card.classList.remove('show');
                    }
                });
            };

            window.addEventListener('scroll', () => requestAnimationFrame(animatePosts));
            animatePosts();
        }

        sortPosts(posts);
        sortCriteria.addEventListener('change', () => sortPosts(posts));
        sortOrder.addEventListener('change', () => sortPosts(posts));
    });

function viewPost(title, content, id) {
    window.location.href = '/post/' + encodeURIComponent(id);
}

if (location.protocol != 'https:') {
    location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
}

window.addEventListener('load', adjustMainMargin);
window.addEventListener('resize', adjustMainMargin);

window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.style.display = 'none';
});
