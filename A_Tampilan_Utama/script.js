// =========================================================
// KANJI LEARNING — Homepage Clean Script
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
  // Menambahkan efek interaktif sederhana jika diperlukan
  const cards = document.querySelectorAll('.part-card');
  
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'all 0.25s ease';
    });
  });
});