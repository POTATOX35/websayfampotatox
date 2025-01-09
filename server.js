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
    
    if ((username === "Potatox35" && password === "P0TATOX3Sa.")||(username === "AAB" && password === "AAB59.panel")||(username == 'andropanda' && password == 'andropanda')) {  // Kullanıcı adı ve şifreyi ayarlayın
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
app.post('/add-comment/:id', (req, res) => {
    const { id } = req.params;  // URL'den post ID'sini alıyoruz
    const { username, content } = req.body;  // Yorumun içeriği ve kullanıcı adını alıyoruz

    // Hatalı giriş kontrolü
    if (!username || !content) {
        return res.status(400).send("Kullanıcı adı ve yorum içeriği gereklidir.");
    }

    // posts.json dosyasını oku
    fs.readFile('posts.json', 'utf8', (err, data) => {
        if (err) return res.status(500).send("Postlar yüklenemedi.");
        
        let posts;
        try {
            posts = JSON.parse(data);  // JSON verisini çözüyoruz
        } catch (parseError) {
            return res.status(500).send("JSON format hatası.");
        }

        console.log('Tüm Postlar:', posts);  // Tüm postları kontrol edin

        // İlgili postu bul
        const post = posts.find(p => p.id === id);
        console.log('Bulunan Post:', post);  // Bulunan postu kontrol edin

        // Eğer post bulunmazsa 404 hatası dön
        if (!post) {
            return res.status(405).send("Post bulunamadı.");
          console.log('anan');
        }

        // Yorum objesini oluştur
        const comment = {
            username: username,
            content: content,
            date: new Date().toISOString()  // Yorumun eklenme tarihini kaydediyoruz
        };

        // Postun comments kısmına ekle
        if (!post.comments) {
            post.comments = [];  // Eğer comments kısmı yoksa, boş bir array başlat
        }
        post.comments.push(comment);

        // posts.json dosyasına yeni verileri yaz
        fs.writeFile('posts.json', JSON.stringify(posts, null, 2), (err) => {
            if (err) return res.status(500).send("Yorum eklenemedi.");
            res.send("Yorum başarıyla eklendi.");
        });
    });
});



app.post('/admin/add-post', authenticateToken, (req, res) => {
    const post = req.body;
    if (!post.title || !post.content) return res.status(400).send("Başlık ve içerik gerekli.");

    fs.readFile('posts.json', 'utf8', (err, data) => {
        if (err) return res.status(500).send("Postlar okunamadı.");

        let posts = data ? JSON.parse(data) : [];

        // Benzersiz bir ID oluştur ve kontrol et
       let uniqueId;

do {
    // 6 basamaklı rastgele bir sayı oluşturuyor
    uniqueId = Math.floor(100000 + Math.random() * 900000).toString();
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
            res.status(404).sendFile(path.join(__dirname,'public', '404.html'));  // 404 hata sayfasına yönlendir
        }
    });
});
app.get('/getPost/:id', (req, res) => {
    const id = req.params.id;
    console.log("uganda");
    fs.readFile('posts.json', 'utf8', (err, data) => {
        if (err) return res.status(500).send("Post yüklenemedi.");
        const posts = JSON.parse(data);
        const post = posts.find(p => p.id === id);
        if (post) {
            res.send(JSON.stringify(post));  // HTML dosyasını gönder
        } else {
            res.status(404).sendFile(path.join(__dirname,'public', '404.html'));  // 404 hata sayfasına yönlendir
        }
    });
    });

// Herhangi bir route bulunamazsa burası devreye girer.
app.post('/alexa-command', (req, res) => {
    const requestBody = req.body;

    if (requestBody.request.type === 'LaunchRequest') {
        console.log('Alexa skill has been launched.');
        res.json({
            version: '1.0',
            response: {
                shouldEndSession: false,
                outputSpeech: {
                    type: 'PlainText',
                    text: "MrOnlyKemal'e ne yapmak istersin ?"
                }
            }
        });
    } else if (requestBody.request.type === 'IntentRequest') {
        const intentName = requestBody.request.intent.name;
        console.log(`Received intent: ${intentName}`);
        
        // poweron intent
        if (intentName === 'poweron') {
            res.json({
                version: '1.0',
                response: {
                    shouldEndSession: true,
                    outputSpeech: {
                        type: 'PlainText',
                        text: 'Tamamdır, mr onlykemal sikiliyor'
                    }
                }
            });
        }
        // poweroff intent
        else if (intentName === 'poweroff') {
            res.json({
                version: '1.0',
                response: {
                    shouldEndSession: true,
                    outputSpeech: {
                        type: 'PlainText',
                        text: 'Shutting down your computer.'
                    }
                }
            });
        }
        // Handling unsupported intents
        else {
            res.json({
                version: '1.0',
                response: {
                    shouldEndSession: true,
                    outputSpeech: {
                        type: 'PlainText',
                        text: `Sorry, I couldn't understand the command "${intentName}".`
                    }
                }
            });
        }
    } else {
        // Invalid request type (could add additional handling for errors)
        res.json({
            version: '1.0',
            response: {
                shouldEndSession: true,
                outputSpeech: {
                    type: 'PlainText',
                    text: 'Something went wrong. Please try again later.'
                }
            }
        });
    }
});


app.post('/api/command', (req, res) => {
    const command = req.body.command;
    console.log(`Received command: ${command}`);

    // Gelen komut üzerinde işlem yap
    if (command === 'execute_task') {
        // İstemciye bir mesaj gönderin veya işlem yapın
        res.status(200).send('Task executed');
    } else {
        res.status(400).send('Unknown command');
    }
});

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
// Yorum ekleme endpointi
