const menuButton = document.querySelector('.menu-btn');
const nav = document.querySelector('.nav');

menuButton.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? '关闭导航' : '打开导航');
});

nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', '打开导航');
}));

window.addEventListener('resize', () => {
  if (window.innerWidth > 960 && nav.classList.contains('open')) {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', '打开导航');
  }
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));

const radarBlips = document.querySelector('.radar-blips');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (radarBlips) {
  const blips = Array.from({ length: 16 }, (_, index) => {
    const blip = document.createElement('span');
    blip.style.setProperty('--size', `${3 + Math.random() * 4}px`);
    blip.style.setProperty('--delay', `${-Math.random() * 3}s`);
    blip.style.setProperty('--pulse', `${1.6 + Math.random() * 2.2}s`);
    blip.style.setProperty('--color', index % 5 === 0 ? 'var(--cyan)' : 'var(--green)');
    radarBlips.appendChild(blip);
    return blip;
  });

  const moveBlip = blip => {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.sqrt(Math.random()) * 45;
    blip.style.setProperty('--x', `${50 + Math.cos(angle) * radius}%`);
    blip.style.setProperty('--y', `${50 + Math.sin(angle) * radius}%`);
    blip.classList.toggle('hot', Math.random() > 0.35);
  };

  blips.forEach(moveBlip);
  if (!reducedMotion) {
    setInterval(() => {
      const moves = 3 + Math.floor(Math.random() * 4);
      for (let index = 0; index < moves; index += 1) {
        moveBlip(blips[Math.floor(Math.random() * blips.length)]);
      }
    }, 1250);
  }
}

const output = document.querySelector('#type-text');
const phrases = ['发现 3 项风险，正在生成处置建议…', '证据链已整理，报告摘要已就绪。', '任务完成。等待下一条安全指令。'];
let phraseIndex = 0;
let characterIndex = 0;
let deleting = false;

function typeTerminal() {
  const phrase = phrases[phraseIndex];
  output.textContent = phrase.slice(0, characterIndex);
  if (!deleting && characterIndex < phrase.length) {
    characterIndex += 1;
    setTimeout(typeTerminal, 55);
  } else if (!deleting) {
    deleting = true;
    setTimeout(typeTerminal, 1800);
  } else if (characterIndex > 0) {
    characterIndex -= 1;
    setTimeout(typeTerminal, 25);
  } else {
    deleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    setTimeout(typeTerminal, 420);
  }
}

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) typeTerminal();
else output.textContent = phrases[0];

const commandPresets = {
  basic: {
    command: 'AiScan-N',
    note: '使用默认端口启动：Web 20000，外部 MCP 10000。'
  },
  secure: {
    command: 'AiScan-N --host 0.0.0.0 --password 强登录密码 --mcp-port 12000 --mcp-token 强访问令牌',
    note: '监听外部地址时，请务必设置强登录密码与 MCP Token。'
  },
  model: {
    command: 'AiScan-N --llm-base-url https://your-api.example/v1 --llm-api-key sk-xxx --llm-model your-model',
    note: '通过 OpenAI 兼容参数指定云端、第三方或本地模型接口。'
  }
};

const commandOutput = document.querySelector('#command-output');
const commandNote = document.querySelector('#command-note');

document.querySelectorAll('.command-tabs button').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.command-tabs button').forEach(item => {
      item.classList.remove('active');
      item.setAttribute('aria-selected', 'false');
    });
    button.classList.add('active');
    button.setAttribute('aria-selected', 'true');
    const preset = commandPresets[button.dataset.command];
    commandOutput.textContent = preset.command;
    commandNote.textContent = preset.note;
  });
});

document.querySelector('#copy-command').addEventListener('click', async event => {
  try {
    await navigator.clipboard.writeText(commandOutput.textContent);
    event.currentTarget.textContent = '已复制';
    setTimeout(() => { event.currentTarget.textContent = '复制命令'; }, 1200);
  } catch {
    event.currentTarget.textContent = '请手动复制';
  }
});

const lightbox = document.querySelector('.lightbox');
const lightboxImage = lightbox.querySelector('img');

function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('lightbox-open');
  lightboxImage.src = '';
}

document.querySelectorAll('.shot').forEach(shot => {
  shot.addEventListener('click', () => {
    lightboxImage.src = shot.dataset.full;
    lightboxImage.alt = shot.querySelector('img').alt;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    lightbox.querySelector('.lightbox-close').focus();
  });
});

lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', event => {
  if (event.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
});
