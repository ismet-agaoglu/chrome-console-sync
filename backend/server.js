const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'console_logs.sqlite');

app.use(cors());
app.use(bodyParser.json());

// Veritabanı kurulumu
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) console.error('DB Error:', err);
    else {
        console.log('SQLite veritabanı bağlandı.');
        db.run(`CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            raw_text TEXT,
            tarih TEXT,
            hasta_ad TEXT,
            protokol_no TEXT,
            tetkik_adi TEXT,
            sonuc TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    }
});

// Veri Kaydetme Endpoint'i
app.post('/api/log', (req, res) => {
    const { data } = req.body;
    if (!data) return res.status(400).send('Veri yok.');

    console.log('Gelen veri:', data);

    // Veriyi parçala: Tarih + İsim + Protokol + Tetkik + Sonuç
    const parts = data.split(' + ').map(p => p.trim());
    
    if (parts.length >= 5) {
        const [tarih, hasta_ad, protokol_no, tetkik_adi, sonuc] = parts;
        
        db.run(`INSERT INTO logs (raw_text, tarih, hasta_ad, protokol_no, tetkik_adi, sonuc) VALUES (?, ?, ?, ?, ?, ?)`,
            [data, tarih, hasta_ad, protokol_no, tetkik_adi, sonuc],
            function(err) {
                if (err) {
                    console.error('Kayıt Hatası:', err);
                    return res.status(500).send('Hata');
                }
                res.status(200).json({ success: true, id: this.lastID });
            }
        );
    } else {
        // Format dışı ise yine de kaydet ama raw_text olarak
        db.run(`INSERT INTO logs (raw_text) VALUES (?)`, [data], (err) => {
            res.status(200).json({ success: true, note: 'Raw saved' });
        });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend çalışıyor: http://0.0.0.0:${PORT}`);
});
