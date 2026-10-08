const STORAGE_KEY = 'teum-prototype-state';
const PAGE = 132;

if (new URLSearchParams(location.search).get('reset') === '1') {
  localStorage.removeItem(STORAGE_KEY);
  history.replaceState(null, '', location.pathname);
}

const defaults = {
  selectedActivity: null,
  hasSavedPosition: false,
  savedPage: PAGE,
  activityStatus: 'idle',
  resumeCount: 0,
  readMinutes: 12,
  finishPage: 151,
};

function readSavedState() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return { ...defaults, ...value, savedPage: PAGE };
  } catch {
    return { ...defaults };
  }
}

const state = readSavedState();
let screen = 'home';
let navigation = ['home'];
let selectedActivity = null;

const app = document.querySelector('#app');

const iconPaths = {
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  back: '<path d="m15 18-6-6 6-6"/><path d="M9 12h11"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21z"/><path d="M4 5.5v15A2.5 2.5 0 0 1 6.5 18H20"/><path d="M9 7h7"/>',
  bookOpen: '<path d="M12 7v14"/><path d="M3 18V5.8a1 1 0 0 1 1.2-1L12 6.5l7.8-1.7a1 1 0 0 1 1.2 1V18l-9 2-9-2Z"/><path d="M3 18 12 20l9-2"/>',
  play: '<path d="m8 5 11 7-11 7z" fill="currentColor" stroke="none"/>',
  pause: '<path d="M8 5h3v14H8z" fill="currentColor" stroke="none"/><path d="M15 5h3v14h-3z" fill="currentColor" stroke="none"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  video: '<rect x="3" y="5" width="13" height="14" rx="3"/><path d="m16 10 5-3v10l-5-3z"/>',
  news: '<path d="M5 4h14v17H5z"/><path d="M8 8h8M8 12h8M8 16h5"/><path d="M3 7v12a2 2 0 0 0 2 2"/>',
  train: '<rect x="5" y="3" width="14" height="16" rx="5"/><path d="M8 19 6 22m10-3 2 3M8 8h8M8 13h.01M16 13h.01M7 17h10"/>',
  bookmark: '<path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-4-6 4z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  route: '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h3a3 3 0 0 0 3-3V9a3 3 0 0 1 3-3"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
  arrowRight: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
  spark: '<path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z"/><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z"/>',
};

function icon(name, size = 18) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name] || ''}</svg>`;
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function navigate(next) {
  navigation.push(next);
  screen = next;
  render();
}

function goBack() {
  if (navigation.length > 1) navigation.pop();
  screen = navigation[navigation.length - 1] || 'home';
  render();
}

function goHome() {
  navigation = ['home'];
  screen = 'home';
  render();
}

function topBar(label, isHome = false) {
  if (isHome) {
    return `<div class="topbar home-topbar">
      <button class="brand-button" data-action="go-home" aria-label="메인 화면으로 이동">
        <span class="brand-mark">${icon('spark', 15)}</span><span>틈</span>
      </button>
      <span class="topbar-note">오늘의 여정</span>
      <button class="icon-button top-home" data-action="go-home" aria-label="메인 화면으로 이동">${icon('home', 16)}</button>
    </div>`;
  }
  return `<div class="topbar">
    <button class="icon-button" data-action="back" aria-label="이전 화면">${icon('back', 19)}</button>
    <div class="screen-title">${label}</div>
    <button class="icon-button" data-action="go-home" aria-label="메인 화면으로 이동">${icon('home', 16)}</button>
  </div>`;
}

function footerButton(action, label, iconName = 'arrowRight', disabled = false) {
  return `<footer class="screen-footer"><button class="primary-button" data-action="${action}" ${disabled ? 'disabled' : ''}>${icon(iconName, 16)}<span>${label}</span></button></footer>`;
}

function activityIcon(name) {
  return `<span class="activity-icon ${name}">${icon(name === 'ebook' ? 'book' : name === 'video' ? 'video' : 'news', 17)}</span>`;
}

function homeStatusCard() {
  if (state.activityStatus === 'completed') {
    return `<button class="saved-activity-card completed-card" data-action="open-status">
      <span class="status-card-icon">${icon('check', 17)}</span>
      <span class="status-card-copy"><strong>오늘의 활동을 마쳤어요</strong><small>이동하는 마음 · 32분 읽었어요</small></span>
      <span class="status-card-action">기록 보기 ${icon('chevron', 13)}</span>
    </button>`;
  }
  if (state.hasSavedPosition) {
    return `<button class="saved-activity-card" data-action="open-status">
      <span class="status-card-icon">${icon('book', 17)}</span>
      <span class="status-card-copy"><strong>읽던 곳을 저장했어요</strong><small>이동하는 마음 · 132p에서 이어갈 수 있어요</small></span>
      <span class="status-card-action">이어읽기 ${icon('chevron', 13)}</span>
    </button>`;
  }
  if (state.activityStatus === 'reading' || state.activityStatus === 'paused') {
    return `<button class="saved-activity-card" data-action="open-status">
      <span class="status-card-icon">${icon('book', 17)}</span>
      <span class="status-card-copy"><strong>활동을 이어갈 수 있어요</strong><small>이동하는 마음 · 마지막 위치 132p</small></span>
      <span class="status-card-action">계속하기 ${icon('chevron', 13)}</span>
    </button>`;
  }
  return '';
}

function renderHome() {
  const bookSubtitle = state.hasSavedPosition ? '저장된 위치 · 132p' : '마지막 132p';
  return `<div class="app-window">
    <div class="device-status" aria-hidden="true"><span>9:41</span><span class="dynamic-island"></span><span class="status-symbols">● ▮ ▰</span></div>
    ${topBar('', true)}
    <main class="screen-content home-content">
      <div class="commute-pill"><span class="live-dot"></span>출근길 · 약 48분</div>
      <h1>오늘의 이동을<br>시작해볼까요?</h1>
      <p class="lead-copy">이동하는 시간도, 내가 고른 시간으로.</p>
      ${homeStatusCard()}
      <section class="activity-list home-activity-list">
        <div class="section-heading"><h2>등록된 활동</h2><span>3개</span></div>
        <article class="home-activity">${activityIcon('ebook')}<span class="activity-copy"><strong>전자책 이어읽기</strong><small>${bookSubtitle}</small></span>${icon('chevron', 16)}</article>
        <article class="home-activity">${activityIcon('video')}<span class="activity-copy"><strong>해리포터 이어보기</strong><small>마지막 01:01:18</small></span>${icon('chevron', 16)}</article>
        <article class="home-activity">${activityIcon('news')}<span class="activity-copy"><strong>트렌드·뉴스 읽기</strong><small>최근 기사</small></span>${icon('chevron', 16)}</article>
      </section>
    </main>
    ${footerButton('open-activities', '오늘의 활동 선택하기', 'arrowRight')}
  </div>`;
}

function optionCard(key, title, subtitle, iconName, color) {
  const selected = selectedActivity === key;
  const selection = selected ? `<span class="selection-check">${icon('check', 12)}</span>` : `<span class="empty-check"></span>`;
  return `<button class="option-card ${selected ? 'selected' : ''}" data-action="select-activity" data-activity="${key}" aria-pressed="${selected}">
    ${activityIcon(color)}<span class="activity-copy"><strong>${title}</strong><small>${subtitle}</small></span>${selection}
  </button>`;
}

function renderActivities() {
  const disabled = selectedActivity !== 'ebook';
  return `<div class="app-window">
    <div class="device-status" aria-hidden="true"><span>9:41</span><span class="dynamic-island"></span><span class="status-symbols">● ▮ ▰</span></div>
    ${topBar('활동 선택')}
    <main class="screen-content select-content">
      <div class="eyebrow">오늘의 선택</div>
      <h1>오늘 이동에서는<br>무엇을 하고 싶나요?</h1>
      <p class="lead-copy">한 가지를 골라 이동을 시작해보세요.</p>
      <div class="activity-options">
        ${optionCard('ebook', '전자책 이어읽기', state.hasSavedPosition ? '저장한 위치 · 132p' : '마지막 132p', 'book', 'ebook')}
        ${optionCard('video', '해리포터 이어보기', '마지막 01:01:18', 'video', 'video')}
        ${optionCard('news', '트렌드·뉴스 읽기', '최근 기사', 'news', 'news')}
      </div>
      <p class="selection-hint ${selectedActivity === 'video' || selectedActivity === 'news' ? 'visible' : ''}">이 테스트에서는 전자책 이어읽기 흐름을 진행할 수 있어요.</p>
    </main>
    ${footerButton('continue-activity', '이 활동으로 시작하기', 'arrowRight', disabled)}
  </div>`;
}

function bookCover() {
  return `<div class="book-stage">
    <div class="cover-glow"></div>
    <div class="book-cover"><span class="cover-overline">THE MOMENT</span><strong>이동하는<br>마음</strong><small>김하루 장편소설</small></div>
    <div class="cover-tag">${state.hasSavedPosition ? '저장한 위치' : '마지막 위치'}</div>
    <div class="page-badge">132p</div>
  </div>`;
}

function renderPrepare() {
  const saved = state.hasSavedPosition;
  return `<div class="app-window">
    <div class="device-status" aria-hidden="true"><span>9:41</span><span class="dynamic-island"></span><span class="status-symbols">● ▮ ▰</span></div>
    ${topBar(saved ? '다시 이어하기' : '시작 준비')}
    <main class="screen-content prepare-content">
      ${bookCover()}
      <div class="prepare-copy">
        <div class="eyebrow">${saved ? '저장한 위치에서' : '바로 이어서'}</div>
        <h1>${saved ? '저장한 132p에서<br>다시 시작할게요.' : '지난번 읽던 132p에서<br>바로 시작할게요.'}</h1>
        <p>${saved ? '멈춘 곳을 그대로 기억하고 있어요.' : '찾아 헤맬 필요 없이, 그대로 이어져요.'}</p>
      </div>
    </main>
    ${footerButton('start-reading', '이어읽기 시작', 'book')}
  </div>`;
}

const passage = '어떤 시간은 목적지에 도착하기 전까지 그저 흘러가는 것처럼 보인다. 하지만 우리는 그 틈에서도 분명히 무언가를 시작할 수 있다.\n\n창밖의 풍경이 천천히 뒤로 밀려났다. 주인공은 책장을 한 장 넘기고 잠시 고개를 들었다. 익숙한 안내 방송과 철로의 진동이 조용한 문장 사이로 스며들었다.\n\n멈추는 것은 끝내는 것과 다르다. 다시 돌아올 자리를 기억한다면, 이야기는 언제든 그곳에서 계속될 수 있었다.';

function renderReader(resumed = false) {
  const minutes = resumed ? 24 : 12;
  return `<div class="app-window">
    <div class="device-status" aria-hidden="true"><span>9:41</span><span class="dynamic-island"></span><span class="status-symbols">● ▮ ▰</span></div>
    <div class="reader-topbar">
      <button class="icon-button" data-action="back" aria-label="이전 화면">${icon('back', 19)}</button>
      <button class="icon-button tiny-home" data-action="go-home" aria-label="메인 화면으로 이동">${icon('home', 14)}</button>
      <div class="reader-book-name">이동하는 마음</div>
      <span class="reader-page-chip">132p</span>
    </div>
    <main class="screen-content reader-content">
      ${resumed ? `<div class="resume-banner">${icon('check', 13)}<span>132p부터 이어 읽는 중</span></div>` : ''}
      <div class="chapter-label">제 8 장&nbsp;&nbsp; 이동하는 마음</div>
      <article class="reading-text">${passage.split('\n\n').map((paragraph) => `<p>${paragraph}</p>`).join('')}</article>
    </main>
    <footer class="reader-footer">
      <div class="reading-meta"><span>오늘 ${minutes}분 읽는 중</span><span>132 / 284p</span></div>
      <div class="progress-track"><span style="width:46.5%"></span></div>
      <button class="primary-button" data-action="${resumed ? 'finish-trip' : 'pause-reading'}">${icon(resumed ? 'check' : 'pause', 15)}<span>${resumed ? '이동 완료하기' : '잠시 멈추기'}</span></button>
    </footer>
  </div>`;
}

function renderPause() {
  return `<div class="app-window">
    <div class="device-status" aria-hidden="true"><span>9:41</span><span class="dynamic-island"></span><span class="status-symbols">● ▮ ▰</span></div>
    ${topBar('활동 중단')}
    <main class="screen-content centered-content pause-content">
      <div class="illustration-circle transit-circle">${icon('train', 30)}<span class="mini-orbit">${icon('pause', 11)}</span></div>
      <div class="eyebrow">잠시 멈춤</div>
      <h1>이동 환경이 바뀌었어요</h1>
      <p class="center-copy">지금은 읽기 어려운 상황이에요.<br>읽던 위치를 저장하고<br>잠시 멈출까요?</p>
      <div class="location-chip">${icon('book', 14)}<span>현재 읽던 위치 · 132p</span></div>
    </main>
    ${footerButton('save-position', '읽던 위치 저장하기', 'bookmark')}
  </div>`;
}

function renderSaved() {
  return `<div class="app-window">
    <div class="device-status" aria-hidden="true"><span>9:41</span><span class="dynamic-island"></span><span class="status-symbols">● ▮ ▰</span></div>
    ${topBar('저장 완료')}
    <main class="screen-content centered-content saved-content">
      <div class="illustration-circle saved-circle"><span class="bookmark-large">${icon('book', 24)}</span><span class="success-dot">${icon('check', 12)}</span></div>
      <div class="eyebrow">위치 저장 완료</div>
      <h1>132p에서 저장했어요.</h1>
      <p class="center-copy">이동이 끝난 뒤 바로<br>이어갈 수 있어요.</p>
      <div class="saved-note">${icon('check', 13)}<span>마지막 위치를 안전하게 저장했어요</span></div>
    </main>
    ${footerButton('confirm-save', '확인', 'check')}
  </div>`;
}

function renderResumeReady() {
  return `<div class="app-window">
    <div class="device-status" aria-hidden="true"><span>9:41</span><span class="dynamic-island"></span><span class="status-symbols">● ▮ ▰</span></div>
    ${topBar('다시 이어하기')}
    <main class="screen-content prepare-content resume-ready-content">
      ${bookCover()}
      <div class="prepare-copy">
        <div class="eyebrow">저장한 위치에서</div>
        <h1>지난번 읽던 132p에서<br>바로 시작할게요.</h1>
        <p>찾아 헤맬 필요 없이, 그대로 이어져요.</p>
      </div>
    </main>
    ${footerButton('resume-reading', '이어읽기 시작', 'book')}
  </div>`;
}

function renderComplete() {
  return `<div class="app-window">
    <div class="device-status" aria-hidden="true"><span>9:41</span><span class="dynamic-island"></span><span class="status-symbols">● ▮ ▰</span></div>
    ${topBar('이동 완료')}
    <main class="screen-content complete-content">
      <div class="completion-mark">${icon('check', 19)}</div>
      <div class="eyebrow">이동 완료</div>
      <h1>오늘의 이동을 마쳤어요.</h1>
      <p class="lead-copy">이동하는 동안 읽던 책을 이어갔어요.</p>
      <section class="summary-card">
        <span class="summary-label">오늘의 독서</span>
        <div class="summary-minutes">32<small>분 읽었어요</small></div>
        <div class="summary-divider"></div>
        <div class="summary-row"><span>읽은 페이지</span><strong>132p → 151p</strong></div>
      </section>
      <div class="resume-success-card"><span class="resume-success-icon">${icon('route', 16)}</span><p>한 번 멈췄지만 마지막 위치에서<br>자연스럽게 다시 시작했어요.</p></div>
    </main>
    ${footerButton('view-record', '오늘의 기록 보기', 'arrowRight')}
  </div>`;
}

function renderRecord() {
  return `<div class="app-window">
    <div class="device-status" aria-hidden="true"><span>9:41</span><span class="dynamic-island"></span><span class="status-symbols">● ▮ ▰</span></div>
    ${topBar('오늘의 기록')}
    <main class="screen-content record-content">
      <div class="eyebrow">오늘 · 출근길</div>
      <h1>오늘의 활동 기록</h1>
      <p class="lead-copy">이동 중에도 하려던 활동을<br>끝까지 이어갔어요.</p>
      <section class="record-book-card">
        <div class="record-book-heading">${activityIcon('ebook')}<span class="activity-copy"><strong>이동하는 마음</strong><small>전자책</small></span><span class="complete-tag">완료</span></div>
        <div class="record-divider"></div>
        <div class="record-stat"><span>활동 시간</span><strong>32분</strong></div>
        <div class="record-stat"><span>읽은 페이지</span><strong>132p → 151p</strong></div>
        <div class="record-stat"><span>다시 이어간 횟수</span><strong>${state.resumeCount || 1}회</strong></div>
      </section>
      <section class="journey-card">
        <span class="journey-title">오늘의 흐름</span>
        <div class="journey-line"><span class="journey-dot book-dot">${icon('book', 13)}</span><span class="journey-connector"></span><span class="journey-dot pause-dot">${icon('pause', 12)}</span><span class="journey-connector"></span><span class="journey-dot finish-dot">${icon('check', 14)}</span></div>
        <div class="journey-captions"><span>시작</span><span>저장</span><span>이어읽기</span></div>
      </section>
      <div class="record-message"><span class="record-check">${icon('check', 13)}</span><span><strong>마지막 위치에서 바로 시작했어요</strong><small>중단 후에도 활동을 자연스럽게 이어갔어요.</small></span></div>
    </main>
  </div>`;
}

function render() {
  const views = {
    home: renderHome,
    activities: renderActivities,
    prepare: renderPrepare,
    reader: () => renderReader(false),
    pause: renderPause,
    saved: renderSaved,
    resumeReady: renderResumeReady,
    resumedReader: () => renderReader(true),
    complete: renderComplete,
    record: renderRecord,
  };
  app.innerHTML = `<div class="device-frame">${(views[screen] || renderHome)()}</div>`;
  const content = app.querySelector('.screen-content');
  if (content) content.scrollTop = 0;
}

app.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button || button.disabled) return;
  const action = button.dataset.action;

  if (action === 'go-home') return goHome();
  if (action === 'back') return goBack();
  if (action === 'open-activities') {
    selectedActivity = null;
    return navigate('activities');
  }
  if (action === 'select-activity') {
    selectedActivity = button.dataset.activity;
    return render();
  }
  if (action === 'continue-activity') {
    if (selectedActivity !== 'ebook') return;
    state.selectedActivity = 'ebook';
    persist();
    return navigate('prepare');
  }
  if (action === 'start-reading') {
    state.activityStatus = 'reading';
    state.readMinutes = state.hasSavedPosition ? 24 : 12;
    persist();
    return navigate(state.hasSavedPosition ? 'resumedReader' : 'reader');
  }
  if (action === 'pause-reading') {
    state.activityStatus = 'paused';
    persist();
    return navigate('pause');
  }
  if (action === 'save-position') {
    state.hasSavedPosition = true;
    state.savedPage = PAGE;
    state.activityStatus = 'saved';
    persist();
    return navigate('saved');
  }
  if (action === 'confirm-save') return navigate('resumeReady');
  if (action === 'resume-reading') {
    state.activityStatus = 'reading';
    state.resumeCount = Math.max(1, state.resumeCount + 1);
    state.readMinutes = 24;
    persist();
    return navigate('resumedReader');
  }
  if (action === 'finish-trip') {
    state.activityStatus = 'completed';
    state.finishPage = 151;
    state.readMinutes = 32;
    state.hasSavedPosition = true;
    persist();
    return navigate('complete');
  }
  if (action === 'view-record') return navigate('record');
  if (action === 'open-status') {
    if (state.activityStatus === 'completed') return navigate('record');
    if (state.hasSavedPosition) return navigate('resumeReady');
    if (state.activityStatus === 'reading' || state.activityStatus === 'paused') return navigate('reader');
  }
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' || (event.altKey && event.key === 'ArrowLeft')) {
    event.preventDefault();
    goBack();
  }
});

render();
