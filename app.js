/* Native audio owns playback; animation never changes the audition signal. */
const audio = document.querySelector('#audio');
const play = document.querySelector('#play-toggle');
const seek = document.querySelector('#seek');
const status = document.querySelector('#play-status');
const error = document.querySelector('#audio-error');
const artwork = document.querySelector('#artwork');
const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
let motionReduced = motionQuery.matches;
let variant = 'original';
let playRequest = 0;
let visualAnimation;
const versions = {
  original: { label: 'original', duration: 36, tag: 'A / ORIGINAL', note: 'Listen to the piano’s pace before turning to Side B.' },
  morph: { label: 'transformation', duration: 41.6630385488, tag: 'B / TRANSFORMED', note: 'Listen for the heartbeat as the piano slows. This is a prerecorded demo.' }
};
function clock(seconds) {
  const value = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  return String(Math.floor(value / 60)).padStart(2, '0') + ':' + String(value % 60).padStart(2, '0');
}
function reveal(targets) {
  visualAnimation?.cancel();
  for (const element of document.querySelectorAll('.main-composition, #artwork, #track-note')) {
    element.style.opacity = ''; element.style.transform = '';
  }
  if (motionReduced || !window.anime) return;
  visualAnimation = anime.animate(targets, { opacity: [0.25, 1], translateY: [10, 0], duration: 420, ease: 'out(3)' });
}
function updatePlayback() {
  const playing = !audio.paused && !audio.ended;
  artwork.dataset.playing = String(playing);
  play.setAttribute('aria-label', (playing ? 'Pause ' : 'Play ') + versions[variant].label);
  document.querySelector('#record-toggle').setAttribute('aria-label', (playing ? 'Pause ' : 'Play ') + versions[variant].label);
  document.querySelector('#play-icon').src = 'assets/icons/' + (playing ? 'pause' : 'play') + '.svg';
  if (error.hidden) status.textContent = audio.ended ? 'Finished' : playing ? 'Playing · ' + versions[variant].label : 'Paused · ' + versions[variant].label;
}
function updateTime() {
  const duration = Number.isFinite(audio.duration) ? audio.duration : versions[variant].duration;
  seek.max = duration;
  seek.value = Math.min(audio.currentTime, duration);
  seek.setAttribute('aria-valuetext', `${Math.floor(audio.currentTime)} of ${Math.round(duration)} seconds`);
  document.querySelector('#current-time').textContent = clock(audio.currentTime);
  document.querySelector('#total-time').textContent = clock(duration);
}
function showError(message) {
  error.textContent = message;
  error.hidden = false;
  status.textContent = 'Unable to play';
  updatePlayback();
}
function selectVersion(next) {
  if (next === variant) return;
  playRequest++;
  audio.pause();
  variant = next;
  audio.src = `assets/audio/slowpiano-${variant}.wav`;
  audio.load();
  error.hidden = true;
  document.querySelectorAll('button[data-variant]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.variant === variant)));
  artwork.dataset.variant = variant;
  document.querySelector('#art-version').textContent = versions[variant].tag;
  document.querySelector('#record-side').textContent = variant === 'original' ? 'SIDE A' : 'SIDE B';
  document.querySelector('.record-edition').textContent = variant === 'original' ? 'ARE 001 · ORIGINAL MUSIC' : 'ARE 001 · MUSIC TO HEARTBEAT';
  document.querySelector('#art-duration').textContent = clock(versions[variant].duration);
  document.querySelector('#track-note').textContent = versions[variant].note;
  document.querySelector('#waveform').src = `assets/wave-${variant}.svg`;
  document.querySelector('#waveform').alt = `Measured amplitude overview of Slowpiano, ${versions[variant].label} version`;
  updatePlayback();
  updateTime();
  status.textContent = 'Version selected · press play';
  reveal([artwork, document.querySelector('#track-note')]);
}
document.querySelectorAll('button[data-variant]').forEach(button => button.addEventListener('click', () => selectVersion(button.dataset.variant)));
async function togglePlayback() {
  const request = ++playRequest;
  if (!audio.paused) { audio.pause(); return; }
  error.hidden = true;
  status.textContent = 'Loading…';
  try {
    await audio.play();
  } catch (failure) {
    if (request !== playRequest || failure.name === 'AbortError') return;
    showError('This audio could not play. Press play to retry.');
  }
}
play.addEventListener('click', togglePlayback);
document.querySelector('#record-toggle').addEventListener('click', togglePlayback);
audio.addEventListener('play', updatePlayback);
audio.addEventListener('pause', updatePlayback);
audio.addEventListener('ended', updatePlayback);
audio.addEventListener('timeupdate', updateTime);
audio.addEventListener('loadedmetadata', updateTime);
audio.addEventListener('error', () => showError('This audio could not load. Try the other version or reload the page.'));
seek.addEventListener('input', () => { if (Number.isFinite(audio.duration)) { audio.currentTime = Number(seek.value); updateTime(); } });
document.querySelector('#mute-toggle').addEventListener('click', () => {
  audio.muted = !audio.muted;
  document.querySelector('#mute-toggle').setAttribute('aria-pressed', String(audio.muted));
  document.querySelector('#mute-toggle').setAttribute('aria-label', audio.muted ? 'Unmute' : 'Mute');
  document.querySelector('#volume-icon').src = 'assets/icons/' + (audio.muted ? 'volume-x' : 'volume-2') + '.svg';
});
audio.volume = 0.5;

function applyMotionPreference() {
  document.body.classList.toggle('reduce-motion', motionReduced);
  document.querySelector('#motion-toggle').setAttribute('aria-pressed', String(motionReduced));
  if (motionReduced) {
    visualAnimation?.cancel();
    for (const element of document.querySelectorAll('.main-composition, #artwork, #track-note')) {
      element.style.opacity = ''; element.style.transform = '';
    }
  }
}
document.querySelector('#motion-toggle').addEventListener('click', () => { motionReduced = !motionReduced; applyMotionPreference(); });
motionQuery.addEventListener('change', event => { motionReduced = event.matches; applyMotionPreference(); });
applyMotionPreference();
reveal(document.querySelector('.main-composition'));

const mascot = document.querySelector('.desk-mascot');
let mascotTimer;
mascot.addEventListener('click', event => {
  if (event.pointerType === 'mouse') return; // Mouse input is handled by hover.
  clearTimeout(mascotTimer);
  mascot.dataset.dancing = 'true';
  mascotTimer = setTimeout(() => { delete mascot.dataset.dancing; }, 2400);
});

const notes = {
  about: ['NOTEBOOK', 'Yuxin Liu', '<p>My current project, ARE, explores how game music can follow a listener’s heart rate and gradually become a heartbeat-like sound.</p><p>The Sound Desk is where I keep listening studies and notes on things I’m curious about, from sound in games to film, anime and science.</p>'],
  credits: ['LISTENING NOTES / 16 SEP 2026', 'About this recording.', '<p><strong>Music:</strong> Slowpiano by celestialghost8, from <a href="https://opengameart.org/content/cc0-scraps" target="_blank" rel="noreferrer">CC0 Scraps ↗</a>.</p><p><strong>Original:</strong> 36 seconds. <strong>Transformed:</strong> about 41.66 seconds. Both are unchanged copies of the existing 16 Sep 2026 development files.</p><p>The transformation follows a preset progression, with no live heart-rate input. This example is separate from the poster evaluation. The waveform shows audio amplitude, not measured heart rate.</p><p><small>Icons: Lucide 0.468.0 (ISC). Animation: Anime.js 4.2.2 (MIT). <a href="project.html">More about ARE ↗</a></small></p>'],
};
const dialog = document.querySelector('#info-dialog');
document.querySelectorAll('[data-dialog]').forEach(button => button.addEventListener('click', () => {
  const [kicker, title, content] = notes[button.dataset.dialog];
  document.querySelector('#dialog-kicker').textContent = kicker;
  document.querySelector('#dialog-title').textContent = title;
  document.querySelector('#dialog-content').innerHTML = content;
  dialog.showModal();
}));
document.querySelector('#close-dialog').addEventListener('click', () => dialog.close());
document.querySelector('#dialog-done').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const box = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
});
