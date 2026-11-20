document.addEventListener('DOMContentLoaded', () => {
  // --- CHẶN COPY, BÔI ĐEN, CTRL+A, CTRL+C TRÊN GIAO DIỆN ---
  document.addEventListener('keydown', (e) => {
    const isTypingInInput = e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT';
    if (isTypingInInput) return;

    if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'x', 'u', 's'].includes(e.key.toLowerCase())) {
      e.preventDefault();
    }
  });

  document.addEventListener('copy', (e) => {
    const isTypingInInput = e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT';
    if (!isTypingInInput) e.preventDefault();
  });

  document.addEventListener('contextmenu', (e) => {
    const isTypingInInput = e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT';
    if (!isTypingInInput) e.preventDefault();
  });

  // --- TÍNH NĂNG KÉO THẢ DI CHUYỂN TÙY Ý CHO CÁC TIỆN ÍCH ---
  let highestZIndex = 30;

  function makeDraggable(element) {
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    element.addEventListener('pointerdown', (e) => {
      if (['TEXTAREA', 'INPUT', 'BUTTON', 'IFRAME', 'A'].includes(e.target.tagName)) return;

      isDragging = true;
      element.classList.add('is-dragging');

      highestZIndex++;
      element.style.zIndex = highestZIndex;

      const rect = element.getBoundingClientRect();
      element.style.transform = 'none';
      element.style.left = `${rect.left}px`;
      element.style.top = `${rect.top}px`;
      element.style.right = 'auto';
      element.style.bottom = 'auto';

      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;

      element.setPointerCapture(e.pointerId);
    });

    element.addEventListener('pointermove', (e) => {
      if (!isDragging) return;

      let newLeft = e.clientX - offsetX;
      let newTop = e.clientY - offsetY;

      const maxLeft = window.innerWidth - element.offsetWidth;
      const maxTop = window.innerHeight - element.offsetHeight;

      newLeft = Math.max(0, Math.min(newLeft, maxLeft));
      newTop = Math.max(0, Math.min(newTop, maxTop));

      element.style.left = `${newLeft}px`;
      element.style.top = `${newTop}px`;
    });

    const stopDragging = (e) => {
      if (!isDragging) return;
      isDragging = false;
      element.classList.remove('is-dragging');
      if (element.hasPointerCapture(e.pointerId)) {
        element.releasePointerCapture(e.pointerId);
      }
    };

    element.addEventListener('pointerup', stopDragging);
    element.addEventListener('pointercancel', stopDragging);
  }

  // 0. Khởi tạo bong bóng Hydro tự động ngay khi load trang
  const particlesContainer = document.getElementById('particlesContainer');
  for (let i = 0; i < 28; i++) {
    const bubble = document.createElement('div');
    bubble.classList.add('bubble');
    const size = Math.random() * 14 + 6;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${Math.random() * 100}vw`;
    bubble.style.animationDuration = `${Math.random() * 6 + 5}s`;
    bubble.style.animationDelay = `${Math.random() * 5}s`;
    particlesContainer.appendChild(bubble);
  }

  // Điều khiển Menu 3 gạch / Dấu X + Tự động mờ nền
  const menuToggle = document.getElementById('menuToggle');
  const dropdownMenu = document.getElementById('dropdownMenu');

  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    dropdownMenu.classList.toggle('active');
    document.body.classList.toggle('menu-open');
  });

  // 1. Tiện ích: Đổi tone màu nền
  const btnChangeColor = document.getElementById('btnChangeColor');
  const colors = ['#08121f', '#0c243c', '#10375c', '#151931'];
  let colorIdx = 0;

  btnChangeColor.addEventListener('click', () => {
    colorIdx = (colorIdx + 1) % colors.length;
    document.body.style.backgroundColor = colors[colorIdx];
  });

  // 2. Tiện ích: Đồng hồ thời gian thực
  const btnToggleClock = document.getElementById('btnToggleClock');
  const clockStatus = document.getElementById('clockStatus');
  const floatingClock = document.getElementById('floatingClock');
  let clockInterval = null;

  makeDraggable(floatingClock);

  function updateClock() {
    floatingClock.textContent = new Date().toLocaleTimeString('vi-VN');
  }

  btnToggleClock.addEventListener('click', () => {
    const isShow = floatingClock.classList.toggle('show');
    clockStatus.textContent = isShow ? 'Bật' : 'Tắt';
    if (isShow) {
      updateClock();
      clockInterval = setInterval(updateClock, 1000);
    } else {
      clearInterval(clockInterval);
    }
  });

  // 3. Tiện ích: Ghi chú nhanh (Tự lưu vào LocalStorage)
  const btnToggleNote = document.getElementById('btnToggleNote');
  const noteStatus = document.getElementById('noteStatus');
  const noteWidget = document.getElementById('noteWidget');
  const quickNoteInput = document.getElementById('quickNoteInput');

  makeDraggable(noteWidget);

  quickNoteInput.value = localStorage.getItem('bro_quick_note') || '';
  quickNoteInput.addEventListener('input', () => {
    localStorage.setItem('bro_quick_note', quickNoteInput.value);
  });

  btnToggleNote.addEventListener('click', () => {
    const isShow = noteWidget.classList.toggle('show');
    noteStatus.textContent = isShow ? 'Bật' : 'Tắt';
  });

  // 4. Tiện ích: Đồng hồ tập trung Pomodoro 25 phút
  const btnTogglePomo = document.getElementById('btnTogglePomo');
  const pomoStatus = document.getElementById('pomoStatus');
  const pomoWidget = document.getElementById('pomoWidget');
  const pomoDisplay = document.getElementById('pomoDisplay');
  const pomoStartBtn = document.getElementById('pomoStartBtn');
  const pomoResetBtn = document.getElementById('pomoResetBtn');

  makeDraggable(pomoWidget);

  let pomoSeconds = 25 * 60;
  let pomoInterval = null;
  let isPomoRunning = false;

  function renderPomo() {
    const mins = String(Math.floor(pomoSeconds / 60)).padStart(2, '0');
    const secs = String(pomoSeconds % 60).padStart(2, '0');
    pomoDisplay.textContent = `${mins}:${secs}`;
  }

  btnTogglePomo.addEventListener('click', () => {
    const isShow = pomoWidget.classList.toggle('show');
    pomoStatus.textContent = isShow ? 'Bật' : 'Tắt';
  });

  pomoStartBtn.addEventListener('click', () => {
    if (isPomoRunning) {
      clearInterval(pomoInterval);
      pomoStartBtn.textContent = 'Chạy';
      isPomoRunning = false;
    } else {
      isPomoRunning = true;
      pomoStartBtn.textContent = 'Tạm dừng';
      pomoInterval = setInterval(() => {
        if (pomoSeconds > 0) {
          pomoSeconds--;
          renderPomo();
        } else {
          clearInterval(pomoInterval);
          isPomoRunning = false;
          pomoStartBtn.textContent = 'Chạy';
          alert('Hết 25 phút tập trung rồi cộng sự!');
        }
      }, 1000);
    }
  });

  pomoResetBtn.addEventListener('click', () => {
    clearInterval(pomoInterval);
    isPomoRunning = false;
    pomoStartBtn.textContent = 'Chạy';
    pomoSeconds = 25 * 60;
    renderPomo();
  });

  // 5. Tiện ích: YouTube Hub (Tìm danh sách video + chọn phát)
  const btnToggleYtb = document.getElementById('btnToggleYtb');
  const ytbStatus = document.getElementById('ytbStatus');
  const ytbWidget = document.getElementById('ytbWidget');
  const ytbInput = document.getElementById('ytbInput');
  const ytbSearchBtn = document.getElementById('ytbSearchBtn');
  const ytbIframe = document.getElementById('ytbIframe');
  const ytbPlayerWrapper = document.querySelector('.ytb-player-wrapper');
  const ytbResults = document.getElementById('ytbResults');
  const ytbStatusText = document.getElementById('ytbStatusText');
  const ytbExternalLink = document.getElementById('ytbExternalLink');

  makeDraggable(ytbWidget);

  btnToggleYtb.addEventListener('click', () => {
    const isShow = ytbWidget.classList.toggle('show');
    ytbStatus.textContent = isShow ? 'Bật' : 'Tắt';
  });

  function extractYouTubeId(url) {
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  }

  function playVideoById(videoId, title = 'Video YouTube') {
    if (!videoId) return;
    ytbIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    ytbPlayerWrapper.classList.add('has-video');
    ytbStatusText.textContent = `Đang phát: ${title}`;
    ytbExternalLink.href = `https://www.youtube.com/watch?v=${videoId}`;
  }

  function formatDuration(sec) {
    if (!sec || isNaN(sec)) return '';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  function renderSearchList(items, activeId = null) {
    ytbResults.innerHTML = '';
    if (!items || items.length === 0) {
      ytbResults.innerHTML = '<div class="ytb-empty">Không tìm thấy video phù hợp.</div>';
      return;
    }

    items.forEach((item) => {
      const div = document.createElement('div');
      div.className = `ytb-item${item.id === activeId ? ' active' : ''}`;
      const durationLabel = formatDuration(item.duration);
      const subText = [item.author, durationLabel].filter(Boolean).join(' • ');

      div.innerHTML = `
        <img src="${item.thumbnail}" alt="" loading="lazy" />
        <div class="ytb-item-info">
          <div class="ytb-item-title">${item.title}</div>
          <div class="ytb-item-sub">${subText}</div>
        </div>
      `;

      div.addEventListener('click', () => {
        ytbResults.querySelectorAll('.ytb-item').forEach((el) => el.classList.remove('active'));
        div.classList.add('active');
        playVideoById(item.id, item.title);
      });

      ytbResults.appendChild(div);
    });
  }

  async function searchVideosFromPublicApi(query) {
    const endpoints = [
      `https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(query)}&filter=videos`,
      `https://vid.puffyan.us/api/v1/search?q=${encodeURIComponent(query)}&type=video`
    ];

    for (const url of endpoints) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const data = await res.json();

        // Chuẩn hóa dữ liệu từ Piped hoặc Invidious
        const rawList = Array.isArray(data) ? data : (data.items || []);
        const videos = rawList
          .map((v) => {
            const id = v.url ? extractYouTubeId(`https://youtube.com${v.url}`) : v.videoId;
            if (!id) return null;
            return {
              id,
              title: v.title || 'Không có tiêu đề',
              author: v.uploaderName || v.author || '',
              duration: v.duration || v.lengthSeconds || 0,
              thumbnail: v.thumbnail || `https://i.ytimg.com/vi/${id}/mqdefault.jpg`
            };
          })
          .filter(Boolean)
          .slice(0, 10);

        if (videos.length > 0) return videos;
      } catch (_) {
        // Thử endpoint tiếp theo
      }
    }
    return null;
  }

  async function handleYouTubeSearch() {
    const raw = ytbInput.value.trim();
    if (!raw) return;

    const directId = extractYouTubeId(raw);
    if (directId) {
      playVideoById(directId, 'Video từ liên kết');
      renderSearchList([
        {
          id: directId,
          title: 'Video từ link đã dán',
          author: 'YouTube',
          duration: 0,
          thumbnail: `https://i.ytimg.com/vi/${directId}/mqdefault.jpg`
        }
      ], directId);
      return;
    }

    ytbStatusText.textContent = 'Đang tìm video...';
    ytbResults.innerHTML = '<div class="ytb-empty">Đang tải danh sách kết quả...</div>';

    const list = await searchVideosFromPublicApi(raw);
    if (list && list.length > 0) {
      ytbStatusText.textContent = `Tìm thấy ${list.length} video — bấm để phát`;
      renderSearchList(list);
    } else {
      // Dự phòng nếu API công khai đang bận: mở thẳng tìm kiếm YouTube ở tab mới
      ytbStatusText.textContent = 'API tạm bận — mở tìm kiếm trên YouTube';
      ytbExternalLink.href = `https://www.youtube.com/results?search_query=${encodeURIComponent(raw)}`;
      ytbResults.innerHTML = `<div class="ytb-empty">Không tải được danh sách tự động. Bấm <b>Mở trên YouTube ↗</b> hoặc dán thẳng link video vào ô tìm kiếm.</div>`;
    }
  }

  ytbSearchBtn.addEventListener('click', handleYouTubeSearch);
  ytbInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      handleYouTubeSearch();
    }
  });

  // 6. Tiện ích: Toàn màn hình
  const btnFullscreen = document.getElementById('btnFullscreen');
  const fsStatus = document.getElementById('fsStatus');

  btnFullscreen.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      fsStatus.textContent = 'Thoát';
    } else {
      document.exitFullscreen();
      fsStatus.textContent = 'Mở';
    }
  });
});