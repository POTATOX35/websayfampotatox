function adjustMainMargin() {
    const headerHeight = document.querySelector('.sabit-bar').offsetHeight;
    const mainElement = document.querySelector('.sort-bar');
    console.log("Header Height:", headerHeight);  // Konsola header yüksekliğini yazdırıyoruz
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
    return str.replace(/[&<>"']/g, function(match) {
        switch(match) {
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

sortCriteriaSelect.addEventListener('change', function() {
    const selectedCriteria = sortCriteriaSelect.value;

    // Eğer zaman seçildiyse, metinleri değiştir
    if (selectedCriteria === 'time') {
        // 'Zaman' seçildiyse 'Azalan' ve 'Artan' seçeneklerini "En Yeni" ve "En Eski" olarak değiştirelim
        sortOrderSelect.options[0].textContent = 'En Yeni';  // Azalan -> En Yeni
        sortOrderSelect.options[1].textContent = 'En Eski';  // Artan -> En Eski
    } else {
        // Eğer zaman dışındaki bir seçenekse, orijinal metinleri geri yükleyelim
        sortOrderSelect.options[0].textContent = 'Azalan';  // Azalan
        sortOrderSelect.options[1].textContent = 'Artan';   // Artan
    }
});

window.addEventListener('load', function() {
    const selectedCriteria = sortCriteriaSelect.value;

    // Eğer zaman seçildiyse, metinleri değiştir
    if (selectedCriteria === 'time') {
        // 'Zaman' seçildiyse 'Azalan' ve 'Artan' seçeneklerini "En Yeni" ve "En Eski" olarak değiştirelim
        sortOrderSelect.options[0].textContent = 'En Yeni';  // Azalan -> En Yeni
        sortOrderSelect.options[1].textContent = 'En Eski';  // Artan -> En Eski
    } else {
        // Eğer zaman dışındaki bir seçenekse, orijinal metinleri geri yükleyelim
        sortOrderSelect.options[0].textContent = 'Azalan';  // Azalan
        sortOrderSelect.options[1].textContent = 'Artan';   // Artan
    }
});
fetch('/posts')
    .then(response => response.json())
    .then(posts => {
        const sortCriteria = document.getElementById('sortCriteria');
        const sortOrder = document.getElementById('sortOrder');

        // Sıralama fonksiyonu
        function sortPosts(posts) {
            const criteria = sortCriteria.value;
            const order = sortOrder.value === 'asc' ? 1 : -1;

            // Sıralama işlemi
            posts.sort((a, b) => {
                if (criteria === 'time') {
                    return order * (new Date(a.date) - new Date(b.date));
                } else if (criteria === 'user') {
                    return order * a.userad.localeCompare(b.userad);
                }
            });

            // Postları güncelle
            updatePostList(posts);
        }

        // Postları ekranda göster
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
    <div class="post-date">${new Date(post.date).toLocaleDateString()}</div>
    <div class="post-user">
        <p id="UserNameSpan">${namename}</p>
    </div>
`;

// Profile Image'ı dinamik olarak oluşturuyoruz
const profileImage = document.createElement('img');
profileImage.src = post.profileimage || 'https://via.placeholder.com/50'; // Profil resmi varsa kullan, yoksa placeholder
profileImage.alt = 'Profile Image';
profileImage.classList.add('profile-image');

// profileImage'ı postElement içine ekliyoruz
const postUserDiv = postElement.querySelector('.post-user');
postUserDiv.insertBefore(profileImage, postUserDiv.firstChild);

// Hover Banner'ı dinamik olarak oluşturuyoruz
const hoverBanner = document.createElement('div');
hoverBanner.classList.add('hover-banner');
hoverBanner.innerHTML = `<p>${post.userad}</p>`;
              

// hoverBanner'ı postUserDiv içerisine ekliyoruz
postUserDiv.appendChild(hoverBanner);

           

profileImage.addEventListener('mouseover', () => {
  hoverBanner.style.display = 'block';  // Banner'ı görünür yap
  hoverBanner.style.opacity = '1';      // Fade efekti ile görünür olmasını sağla
  console.log(post.userad)
  hoverBanner.style.zIndex = 10000;
});




profileImage.addEventListener('mouseout', () => {
  hoverBanner.style.opacity = '0';
  hoverBanner.style.zIndex = 5000;// Fade efekti ile kaybolmasını sağla
  setTimeout(() => {
    hoverBanner.style.display = 'none';  // 0 opacity ile kaybolduktan sonra banner'ı gizle
  }, 300); // Bu süre, opacity geçiş süresine uygun olmalı (0.3 saniye)
});

        
        postList.appendChild(postElement);

        // id'yi değiştirmek
        const userNameSpan = postElement.querySelector('#UserNameSpan');
        console.log(post.userad.length)
        if (userNameSpan && (post.userad.length > 15)) {
            userNameSpan.id = `UserNameSpann`; // Benzersiz bir id atıyoruz
          console.log(post.userad.length)
        }
    
              
                postList.appendChild(postElement);
            });

            // Sayfa kaydırıldıkça animasyon tetiklemek için
const postCards = document.querySelectorAll('.post-card');
const animatePosts = () => {
    postCards.forEach(card => {
        const rect = card.getBoundingClientRect();
        
        // Postun ekranın alt kısmına veya üst kısmına girmesini kontrol et
        if (rect.top >= -150 && rect.bottom <= window.innerHeight + 225) {
            card.classList.add('show');
            card.classList.remove('hidden');
        }
        // Post ekrandan tamamen çıktığında
        else {
            card.classList.add('hidden');
            card.classList.remove('show');
        }
    });
};

window.addEventListener('scroll', () => requestAnimationFrame(animatePosts));

animatePosts();

        }

        // Başlangıçta sıralama yap
        sortPosts(posts);

        // Sıralama seçeneklerini dinleyelim
        sortCriteria.addEventListener('change', () => sortPosts(posts));
        sortOrder.addEventListener('change', () => sortPosts(posts));
    });

function viewPost(title, content, id) {
    window.location.href = '/post/' + encodeURIComponent(id);  // Post başlığıyla URL'ye yönlendirme
}

// Sayfa HTTPS'e yönlendirme (isteğe bağlı, güvenlik için)
if (location.protocol != 'https:') {
    location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
}
window.addEventListener('load', adjustMainMargin);


// Pencere yeniden boyutlandığında güncelle
window.addEventListener('resize', adjustMainMargin);

window.addEventListener('load', () => {
  // Hide the loading screen after page load
  const loadingScreen = document.getElementById('loading-screen');
  loadingScreen.style.display = 'none';
});
