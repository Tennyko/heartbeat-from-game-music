const mascot = document.querySelector('.desk-mascot');
let timer;
mascot.addEventListener('click', event => {
  if (event.pointerType === 'mouse') return;
  clearTimeout(timer);
  mascot.dataset.dancing = 'true';
  timer = setTimeout(() => { delete mascot.dataset.dancing; }, 2400);
});

const motion = document.querySelector('#motion-toggle');
motion.addEventListener('click', () => {
  const reduced = document.body.classList.toggle('reduce-motion');
  motion.setAttribute('aria-pressed', String(reduced));
});
