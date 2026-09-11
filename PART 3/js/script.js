// =========================================================
// KOTOBA DAYU — App Logic (PART 1)
// Data dimuat dari kode/kosakata.json
// =========================================================

let KOTOBA_DATA = [];

document.addEventListener('DOMContentLoaded', init);

async function init() {
  try {
    // Memuat data dari folder kode/kosakata.json
    const res = await fetch('kode/kosakata.json');
    if (!res.ok) throw new Error('Gagal memuat data');
    KOTOBA_DATA = await res.json();
  } catch (err) {
    document.querySelector('.page').innerHTML = `
      <p style="text-align:center; color:var(--text-muted); padding:60px 20px;">
        Gagal memuat <code>kode/kosakata.json</code>.<br>
        Pastikan berkas dibuka menggunakan Local Server (misalnya extension Live Server di VS Code atau <code>python -m http.server</code>).
      </p>`;
    console.error(err);
    return;
  }

  setupTabs();
  setupFlashcards();
  setupVocabList();
  setupQuiz();
}

// ---------------------------------------------------------
// TAB NAVIGATION
// ---------------------------------------------------------
function setupTabs() {
  const buttons = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('is-active'));
      panels.forEach(p => p.classList.remove('is-active'));
      
      btn.classList.add('is-active');
      const targetPanel = document.getElementById('panel-' + btn.dataset.tab);
      if (targetPanel) {
        targetPanel.classList.add('is-active');
      }
    });
  });
}

// ---------------------------------------------------------
// TAB 1: FLASHCARDS (With Slide & Flip Animations)
// ---------------------------------------------------------
function setupFlashcards() {
  let deck = [...KOTOBA_DATA];
  let index = 0;
  let isAnimating = false;

  const flashcard = document.getElementById('flashcard');
  const elKanji = document.getElementById('fc-kanji');
  const elFurigana = document.getElementById('fc-furigana');
  const elArti = document.getElementById('fc-arti');
  const counter = document.getElementById('card-counter');
  const progress = document.getElementById('card-progress');

  function renderData() {
    const item = deck[index];
    elKanji.textContent = item.kanji;
    elFurigana.textContent = item.furigana;
    elArti.textContent = item.arti;
    counter.textContent = `${index + 1} / ${deck.length}`;
    progress.style.width = `${((index + 1) / deck.length) * 100}%`;
  }

  function flip() {
    flashcard.classList.toggle('is-flipped');
  }

  // Fungsi ganti kartu dengan animasi slide
  function changeCard(direction) {
    if (isAnimating) return;
    isAnimating = true;

    const outClass = direction === 'next' ? 'slide-out-left' : 'slide-out-right';
    const inClass = direction === 'next' ? 'slide-in-right' : 'slide-in-left';

    // Slide Keluar
    flashcard.classList.add(outClass);

    setTimeout(() => {
      // Kembalikan posisi flip ke depan secara instan saat kartu di luar layar
      flashcard.classList.remove('is-flipped');

      if (direction === 'next') {
        index = (index + 1) % deck.length;
      } else {
        index = (index - 1 + deck.length) % deck.length;
      }

      renderData();

      // Slide Masuk
      flashcard.classList.remove(outClass);
      flashcard.classList.add(inClass);

      setTimeout(() => {
        flashcard.classList.remove(inClass);
        isAnimating = false;
      }, 200);
    }, 200);
  }

  function shuffle() {
    if (isAnimating) return;
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    index = 0;
    changeCard('next');
  }

  // Event Listeners
  flashcard.addEventListener('click', flip);
  flashcard.addEventListener('keydown', (e) => {
    if (e.code === 'Space') { e.preventDefault(); flip(); }
  });

  document.getElementById('btn-next').addEventListener('click', () => changeCard('next'));
  document.getElementById('btn-prev').addEventListener('click', () => changeCard('prev'));
  document.getElementById('btn-shuffle').addEventListener('click', shuffle);

  // Navigasi Keyboard (Panah Kiri & Kanan)
  document.addEventListener('keydown', (e) => {
    const activePanel = document.getElementById('panel-kartu');
    if (!activePanel || !activePanel.classList.contains('is-active')) return;
    if (document.activeElement.tagName === 'INPUT') return;

    if (e.code === 'ArrowRight') changeCard('next');
    else if (e.code === 'ArrowLeft') changeCard('prev');
  });

  renderData();
}

// ---------------------------------------------------------
// TAB 2: VOCAB LIST & SEARCH
// ---------------------------------------------------------
function setupVocabList() {
  const listEl = document.getElementById('vocab-list');
  const searchInput = document.getElementById('search-input');

  function renderList(items) {
    if (items.length === 0) {
      listEl.innerHTML = `<p class="vocab-empty">Tidak ada kata yang cocok.</p>`;
      return;
    }

    listEl.innerHTML = items.map(item => `
      <div class="vocab-row">
        <div class="vocab-kj">
          <span class="kanji">${item.kanji}</span>
          <span class="furigana">${item.furigana}</span>
        </div>
        <div class="vocab-arti">
          <span class="romaji">${item.romaji}</span>
          <span>${item.arti}</span>
        </div>
      </div>
    `).join('');
  }

  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    const filtered = KOTOBA_DATA.filter(item =>
      item.kanji.toLowerCase().includes(q) ||
      item.furigana.toLowerCase().includes(q) ||
      item.romaji.toLowerCase().includes(q) ||
      item.arti.toLowerCase().includes(q)
    );
    renderList(filtered);
  });

  renderList(KOTOBA_DATA);
}

// ---------------------------------------------------------
// TAB 3: QUIZ
// ---------------------------------------------------------
function setupQuiz() {
  let order = shuffleArray([...KOTOBA_DATA]);
  let qIndex = 0;

  const kanjiEl = document.getElementById('quiz-kanji');
  const optionsEl = document.getElementById('quiz-options');
  const progressEl = document.getElementById('quiz-progress');
  const nextBtn = document.getElementById('quiz-next');

  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function showQuestion() {
    nextBtn.style.display = 'none';
    optionsEl.innerHTML = '';

    const current = order[qIndex];
    kanjiEl.textContent = current.kanji;
    progressEl.textContent = `Soal ${qIndex + 1} dari ${order.length}`;

    const options = generateOptions(current.furigana);
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'quiz-opt';
      btn.textContent = opt;
      btn.addEventListener('click', () => checkAnswer(btn, opt, current.furigana));
      optionsEl.appendChild(btn);
    });
  }

  function generateOptions(correct) {
    const choices = [correct];
    while (choices.length < 4 && choices.length < KOTOBA_DATA.length) {
      const rand = KOTOBA_DATA[Math.floor(Math.random() * KOTOBA_DATA.length)].furigana;
      if (!choices.includes(rand)) choices.push(rand);
    }
    return shuffleArray(choices);
  }

  function checkAnswer(selectedBtn, selected, correct) {
    const allBtns = optionsEl.querySelectorAll('.quiz-opt');
    allBtns.forEach(b => b.style.pointerEvents = 'none');

    if (selected === correct) {
      selectedBtn.classList.add('correct');
    } else {
      selectedBtn.classList.add('wrong');
      allBtns.forEach(b => {
        if (b.textContent.trim() === correct) b.classList.add('correct');
      });
    }
    nextBtn.style.display = 'inline-flex';
  }

  nextBtn.addEventListener('click', () => {
    qIndex++;
    if (qIndex >= order.length) {
      order = shuffleArray([...KOTOBA_DATA]);
      qIndex = 0;
    }
    showQuestion();
  });

  showQuestion();
}