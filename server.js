const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;
const SECRET_KEY = "superSecretKey123";  // Güçlü bir anahtar belirleyin

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Admin paneline giriş için doğrulama
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === "admin" && password === "myPassword123") {  // Kullanıcı adı ve şifreyi ayarlayın
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
        let posts = data ? JSON.parse(data) : [];
        posts.push(post);

        fs.writeFile('posts.json', JSON.stringify(posts, null, 2), (err) => {
            if (err) return res.status(500).send("Post kaydedilemedi.");
            res.send("Post başarıyla eklendi.");
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor.`);
});