const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Daftar kata kunci spam beserta bobot untuk simulasi model SVM linear
// Bobot menunjukkan seberapa kuat kata tersebut mengindikasikan spam
const spamKeywordsWeights = {
  'gratis': 2.0,        // Kata "gratis" memiliki bobot 2.0, sangat mempengaruhi deteksi spam
  'pemenang': 2.5,      // "pemenang" bobot 2.5, kata penting untuk spam
  'uang': 1.5,
  'hadiah': 2.0,
  'segera': 1.0,
  'bonus': 2.0,
  'klik': 1.8,
  'beli': 1.5,
  'murah': 1.5,
  'kartu': 1.0,
  'kredit': 1.0,
  'penawaran': 2.0,
  'langganan': 1.5,
  'percobaan': 1.3,
  'cash': 1.2,
  'deal': 2.0,
  'promo': 1.8,
  'diskon': 2.0
};

// Nilai bias untuk fungsi keputusan SVM
// Bias ini menyesuaikan threshold agar model dapat lebih akurat dalam mengklasifikasi spam
const bias = -3.0;

// Fungsi sigmoid untuk mengubah skor menjadi probabilitas antara 0 dan 1
// Ini membantu menginterpretasi hasil skor SVM sebagai tingkat keyakinan spam
function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

// Fungsi menghitung skor SVM berdasarkan teks email input
//  - Ubah teks menjadi huruf kecil dan pisahkan menjadi kata-kata
//  - Jumlahkan bobot kata-kata yang ada dalam teks sesuai dengan daftar kata kunci spam
//  - Tambahkan nilai bias untuk membentuk skor keputusan akhir
function svmScore(text) {
  const words = text.toLowerCase().split(/\W+/); // tokenisasi kata
  let score = 0;
  for (const word of words) {
    if (spamKeywordsWeights[word]) {
      score += spamKeywordsWeights[word]; // tambah bobot jika kata kunci spam ditemukan
    }
  }
  score += bias;
  return score;
}

// Fungsi klasifikasi email menggunakan skor dari svmScore
//  - Hitung probabilitas spam menggunakan fungsi sigmoid dari skor
//  - Jika probabilitas >= 0.5, klasifikasi sebagai "Spam", jika tidak "Bukan Spam"
//  - Kembalikan objek dengan hasil klasifikasi dan confidence (persentase probabilitas spam)
function classifyEmail(text) {
  const score = svmScore(text);
  const probSpam = sigmoid(score);
  const classification = probSpam >= 0.5 ? 'Spam' : 'Bukan Spam';
  return {
    classification,
    confidence: (probSpam * 100).toFixed(2)  // format persen dengan 2 angka di belakang koma
  };
}

// Rute utama menampilkan halaman index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Rute POST untuk klasifikasi email
//  - Menerima input email dari body request
//  - Memanggil fungsi klasifikasi email
//  - Mengirimkan response JSON dengan hasil klasifikasi dan confidence
app.post('/klasifikasi', (req, res) => {
  const isiEmail = req.body.email || '';
  const { classification, confidence } = classifyEmail(isiEmail);
  res.json({ classification, confidence });
});

// Menjalankan server pada port 3000
app.listen(port, () => {
    console.log(`Aplikasi klasifikasi spam berjalan di http://localhost:${port}`);
  });
