const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors'); 
const { v4: uuidv4 } = require('uuid');// CORS modülünü içe aktar

const app = express();
const PORT = 3000;
const SECRET_KEY = "superSecretKey123";  // Güçlü bir anahtar belirleyin

app.use(cors({
    origin: '*',  // Geliştirme ortamında her yerden gelen istekleri kabul edebiliriz
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
// Admin paneline giriş için doğrulama
app.post('/login', (req, res) => {
    
    const { username, password } = req.body;
    
    if (username === "P0TATOX35" && password === "P0TATOX3Sa.") {  // Kullanıcı adı ve şifreyi ayarlayın
        const token = jwt.sign({}, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    } else {
        res.status(403).send("Yanlış kullanıcı adı veya şifre!");
    }
});

// Token doğrulama middleware'i
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err) => {
        if (err) return res.sendStatus(403);
        next();
    });
}

// Postları listeleme
app.get('/posts', (req, res) => {
    fs.readFile('posts.json', 'utf8', (err, data) => {
        if (err) return res.status(500).send("Postlar yüklenemedi.");
        res.json(JSON.parse(data));
    });
});

// Post ekleme (sadece admin erişimi)

app.post('/admin/add-post', authenticateToken, (req, res) => {
    const post = req.body;
    if (!post.title || !post.content) return res.status(400).send("Başlık ve içerik gerekli.");

    fs.readFile('posts.json', 'utf8', (err, data) => {
        if (err) return res.status(500).send("Postlar okunamadı.");

        let posts = data ? JSON.parse(data) : [];

        // Benzersiz bir ID oluştur ve kontrol et
        let uniqueId;
        do {
            uniqueId = uuidv4();
        } while (posts.some(p => p.id === uniqueId));
        
        post.id = uniqueId;
        post.date = new Date().toISOString();

        posts.push(post);

        fs.writeFile('posts.json', JSON.stringify(posts, null, 2), (err) => {
            if (err) return res.status(500).send("Post kaydedilemedi.");
            res.send("Post başarıyla eklendi.");
        });
    });
});
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'postlarim.html'));
});
app.get('/panel', (req, res) => {
    res.sendFile(path.join(__dirname,'public', 'panel.html'));
});

app.get('/post/:id', (req, res) => {
    const id = req.params.id;
    
    fs.readFile('posts.json', 'utf8', (err, data) => {
        if (err) return res.status(500).send("Post yüklenemedi.");
        const posts = JSON.parse(data);
        const post = posts.find(p => p.id === id);
        if (post) {
            res.sendFile(path.join(__dirname, 'public', 'postDetay.html'));  // HTML dosyasını gönder
        } else {
            res.status(404).send("Post bulunamadı.");
        }
    });
});
app.get('/getPost/:id', (req, res) => {
    const id = req.params.id;
    fs.readFile('posts.json', 'utf8', (err, data) => {
        if (err) return res.status(500).send("Post yüklenemedi.");
        const posts = JSON.parse(data);
        const post = posts.find(p => p.id === id);
        if (post) {
            res.send(JSON.stringify(post));  // HTML dosyasını gönder
        } else {
            res.status(404).send("Post bulunamadı.");
        }
    });
    });

// Herhangi bir route bulunamazsa burası devreye girer.
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname,'public', '404.html'));  // 404 hata sayfasına yönlendir
});


app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor.`);
});

app.post('/log', (req, res) => {
  console.log("Client Log:", req.body);
  res.sendStatus(200);
});

