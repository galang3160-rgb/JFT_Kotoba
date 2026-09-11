// =========================================================
// KANJI LEARNING — Start Page Script
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
  // 1. Munculkan halaman dengan animasi Fade-In
  document.body.classList.add('page-loaded');

  // 2. Interaksi tombol Start
  const btnStart = document.getElementById('btnStart');

  if (btnStart) {
    btnStart.addEventListener('click', (e) => {
      // Mengambil alamat href tujuan
      const targetUrl = btnStart.getAttribute('href');

      // Jika tombol memiliki link href yang valid
      if (targetUrl && targetUrl !== '#') {
        e.preventDefault(); // Tahan sejenak untuk animasi
        
        // Efek klik tombol
        btnStart.style.transform = 'scale(0.95)';
        
        // Pindah halaman setelah animasi singkat (150ms)
        setTimeout(() => {
          window.location.href = targetUrl;
        }, 150);
      }
    });
  }
});