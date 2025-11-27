// ========================================
// 健身词汇卡片 - 简化版
// ========================================

class FitnessCards {
  constructor() {
    this.currentIndex = 0;
    this.currentCategory = 'all';
    this.filteredWords = [];

    // API 配置
    this.audioApiUrl = 'https://aihubmix.com/v1/audio/speech';
    this.audioApiKey = 'sk-fgnLlQcNwEn8rT5r3cD16d9a431b4f17A5Eb342a0d9a902f';
    this.audioCache = {};
    this.currentAudio = null;

    this.init();
  }

  init() {
    this.filterWords();
    this.bindEvents();
    this.showCard();
  }

  // 筛选单词
  filterWords() {
    if (this.currentCategory === 'all') {
      this.filteredWords = [...fitnessWords];
    } else {
      this.filteredWords = fitnessWords.filter(w => w.category === this.currentCategory);
    }
    this.currentIndex = 0;
  }

  // 绑定事件
  bindEvents() {
    // 分类切换
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const category = e.currentTarget.dataset.category;
        this.switchCategory(category);
      });
    });

    // 导航按钮
    document.getElementById('prev-btn').addEventListener('click', () => this.prev());
    document.getElementById('next-btn').addEventListener('click', () => this.next());

    // 音频按钮
    document.getElementById('audio-btn').addEventListener('click', () => this.playAudio());

    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.prev();
      } else if (e.key === 'ArrowRight') {
        this.next();
      } else if (e.key === ' ') {
        e.preventDefault();
        this.playAudio();
      }
    });

    // 触摸滑动
    let touchStartX = 0;
    const card = document.querySelector('.card');

    card.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    });

    card.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    });
  }

  // 切换分类
  switchCategory(category) {
    this.currentCategory = category;

    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === category);
    });

    this.filterWords();
    this.showCard();
  }

  // 显示卡片
  showCard() {
    const word = this.filteredWords[this.currentIndex];
    if (!word) return;

    // 获取分类名称
    const categoryName = categories[word.category]?.name || word.category;

    // 更新内容
    document.getElementById('card-badge').textContent = categoryName;
    document.getElementById('card-emoji').textContent = word.emoji;
    document.getElementById('word-text').textContent = word.word;
    document.getElementById('card-meaning').textContent = word.meaning;
    document.getElementById('example-en').textContent = word.example;
    document.getElementById('example-cn').textContent = word.exampleCn;

    // 更新进度
    document.getElementById('current-num').textContent = this.currentIndex + 1;
    document.getElementById('total-num').textContent = this.filteredWords.length;

    // 添加动画
    const card = document.querySelector('.card');
    card.style.animation = 'none';
    card.offsetHeight; // 触发重绘
    card.style.animation = 'slideUp 0.3s ease';
  }

  // 上一个
  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.showCard();
    } else {
      // 循环到最后
      this.currentIndex = this.filteredWords.length - 1;
      this.showCard();
    }
  }

  // 下一个
  next() {
    if (this.currentIndex < this.filteredWords.length - 1) {
      this.currentIndex++;
      this.showCard();
    } else {
      // 循环到开头
      this.currentIndex = 0;
      this.showCard();
    }
  }

  // 播放发音
  async playAudio() {
    const word = this.filteredWords[this.currentIndex];
    if (!word) return;

    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }

    const btn = document.getElementById('audio-btn');
    btn.classList.add('playing');

    if (!this.audioApiUrl || !this.audioApiKey) {
      btn.classList.remove('playing');
      return;
    }

    try {
      let audioUrl;

      if (this.audioCache[word.word]) {
        audioUrl = this.audioCache[word.word];
      } else {
        const response = await fetch(this.audioApiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.audioApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'tts-1-hd',
            input: word.word,
            voice: 'coral'
          })
        });

        if (!response.ok) throw new Error('API error');

        const audioBlob = await response.blob();
        audioUrl = URL.createObjectURL(audioBlob);
        this.audioCache[word.word] = audioUrl;
      }

      this.currentAudio = new Audio(audioUrl);
      this.currentAudio.onended = () => btn.classList.remove('playing');
      this.currentAudio.onerror = () => btn.classList.remove('playing');
      await this.currentAudio.play();

    } catch (err) {
      console.error('Audio error:', err);
      btn.classList.remove('playing');
    }
  }
}

// 启动
document.addEventListener('DOMContentLoaded', () => {
  window.app = new FitnessCards();
});
