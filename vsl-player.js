/* ══════════════════════════════════════
   MAO — Custom VSL Player
   No forward scrubbing. Branded controls.
   ══════════════════════════════════════ */

class MAOVslPlayer {
  constructor(root) {
    this.root = root;
    this.video = root.querySelector('.mvp-video');
    this.poster = root.querySelector('.mvp-poster');
    this.bigPlay = root.querySelector('.mvp-big-play');
    this.playPauseBtn = root.querySelector('.mvp-play-pause');
    this.rewind10 = root.querySelector('.mvp-rewind-10');
    this.rewind30 = root.querySelector('.mvp-rewind-30');
    this.muteBtn = root.querySelector('.mvp-mute');
    this.volSlider = root.querySelector('.mvp-vol');
    this.ccBtn = root.querySelector('.mvp-cc');
    this.fsBtn = root.querySelector('.mvp-fs');
    this.progressFill = root.querySelector('.mvp-progress-fill');
    this.progressWatched = root.querySelector('.mvp-progress-watched');
    this.timeEl = root.querySelector('.mvp-time');

    this.maxWatched = 0;
    this.ccEnabled = true;
    this.hideTimer = null;
    this.milestones = new Set();

    this.init();
  }

  init() {
    // Set initial state: hide native controls always
    this.video.controls = false;
    this.video.playsInline = true;

    // Custom caption overlay — fully controllable, immune to iOS caption
    // accessibility settings.
    this.captionsEl = document.createElement('div');
    this.captionsEl.className = 'mvp-captions';
    this.root.appendChild(this.captionsEl);

    this.cues = [];

    // NUCLEAR APPROACH: detach the <track> element entirely. iOS can't
    // force-render native captions if there's no track in the DOM. We fetch
    // and parse the VTT ourselves, then render into .mvp-captions on
    // timeupdate. Trade-off: iOS native fullscreen won't show captions
    // either — acceptable since the user's primary complaint was oversized
    // inline captions.
    const trackEl = this.video.querySelector(
      'track[kind="captions"], track[kind="subtitles"]'
    );
    if (trackEl) {
      const vttUrl = trackEl.src || trackEl.getAttribute('src');
      trackEl.parentNode.removeChild(trackEl);
      this.loadCues(vttUrl);
    }

    this.bindEvents();
  }

  loadCues(url) {
    fetch(url)
      .then(r => (r.ok ? r.text() : Promise.reject(r.status)))
      .then(text => {
        this.cues = this.parseVtt(text);
        if (this.cues.length > 0) {
          this.ccBtn?.classList.add('active');
          this.updateCaption();
        }
      })
      .catch(() => { /* silent — no captions if fetch fails */ });
  }

  parseVtt(text) {
    const cues = [];
    const lines = text.split(/\r?\n/);
    let i = 0;
    while (i < lines.length) {
      const line = lines[i].trim();
      if (!line || line === 'WEBVTT' || /^NOTE\b/.test(line)) { i++; continue; }
      // Cues may be preceded by an optional ID line; match the timestamp line.
      const ts = line.match(
        /((?:\d+:)?\d+:\d+\.\d+)\s+-->\s+((?:\d+:)?\d+:\d+\.\d+)/
      );
      if (ts) {
        const start = this.parseVttTime(ts[1]);
        const end = this.parseVttTime(ts[2]);
        const textLines = [];
        i++;
        while (i < lines.length && lines[i].trim()) {
          textLines.push(lines[i]);
          i++;
        }
        const cueText = textLines
          .join('\n')
          .replace(/<\/?[^>]+>/g, '') // strip <v Speaker>, <c.className>, etc.
          .trim();
        cues.push({ start, end, text: cueText });
      }
      i++;
    }
    return cues;
  }

  parseVttTime(s) {
    const parts = s.split(':').map(parseFloat);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return parts[0] * 60 + parts[1];
  }

  updateCaption() {
    if (!this.captionsEl) return;
    if (!this.ccEnabled || !this.cues || !this.cues.length) {
      if (this.captionsEl.textContent) this.captionsEl.textContent = '';
      return;
    }
    const t = this.video.currentTime;
    let active = null;
    for (let i = 0; i < this.cues.length; i++) {
      const c = this.cues[i];
      if (t >= c.start && t <= c.end) { active = c; break; }
      if (c.start > t) break; // cues are sorted by start time
    }
    const text = active ? active.text : '';
    if (this.captionsEl.textContent !== text) {
      this.captionsEl.textContent = text;
    }
  }

  bindEvents() {
    // Poster click → start playback
    this.poster?.addEventListener('click', () => this.startPlayback());
    this.bigPlay?.addEventListener('click', e => {
      e.stopPropagation();
      this.startPlayback();
    });

    // Play/pause toggle
    this.playPauseBtn?.addEventListener('click', () => this.togglePlay());
    this.video.addEventListener('click', () => {
      if (!this.poster.classList.contains('hidden')) return;
      this.togglePlay();
    });

    // Rewind
    this.rewind10?.addEventListener('click', () => this.rewind(10));
    this.rewind30?.addEventListener('click', () => this.rewind(30));

    // Mute
    this.muteBtn?.addEventListener('click', () => this.toggleMute());

    // Volume slider
    this.volSlider?.addEventListener('input', e => {
      this.video.volume = parseFloat(e.target.value);
      this.video.muted = this.video.volume === 0;
      this.updateMuteIcon();
    });

    // CC toggle
    this.ccBtn?.addEventListener('click', () => this.toggleCC());

    // Fullscreen
    this.fsBtn?.addEventListener('click', e => {
      this.toggleFullscreen();
      e.currentTarget.blur();
    });

    // Blur all control buttons after click so focus doesn't stick
    this.root.querySelectorAll('.mvp-ctrl').forEach(btn => {
      btn.addEventListener('click', e => e.currentTarget.blur());
    });

    // Video events
    this.video.addEventListener('timeupdate', () => this.onTimeUpdate());
    this.video.addEventListener('play', () => this.onPlay());
    this.video.addEventListener('pause', () => this.onPause());
    this.video.addEventListener('ended', () => this.onEnded());
    this.video.addEventListener('loadedmetadata', () => this.updateTime());

    // Block forward seeking
    this.video.addEventListener('seeking', () => {
      if (this.video.currentTime > this.maxWatched + 0.5) {
        this.video.currentTime = this.maxWatched;
      }
    });

    // Keyboard: spacebar toggles play/pause when focused
    this.root.addEventListener('keydown', e => {
      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        this.togglePlay();
      }
    });
    this.root.tabIndex = 0;

    // Auto-hide controls on mouse inactivity during playback
    this.root.addEventListener('mousemove', () => this.showControls());
    this.root.addEventListener('mouseleave', () => {
      if (!this.video.paused) this.hideControls();
    });
  }

  showControls() {
    this.root.classList.add('show-controls');
    clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => {
      if (!this.video.paused) this.hideControls();
    }, 2200);
  }

  hideControls() {
    this.root.classList.remove('show-controls');
    clearTimeout(this.hideTimer);
  }

  startPlayback() {
    this.poster.classList.add('hidden');
    this.video.play();
  }

  togglePlay() {
    if (this.video.paused) this.video.play();
    else this.video.pause();
  }

  rewind(seconds) {
    this.video.currentTime = Math.max(0, this.video.currentTime - seconds);
  }

  toggleMute() {
    this.video.muted = !this.video.muted;
    if (!this.video.muted && this.video.volume === 0) {
      this.video.volume = 0.8;
      this.volSlider.value = 0.8;
    }
    this.updateMuteIcon();
  }

  updateMuteIcon() {
    const muted = this.video.muted || this.video.volume === 0;
    this.muteBtn.classList.toggle('muted', muted);
  }

  toggleCC() {
    if (!this.cues || this.cues.length === 0) return;
    this.ccEnabled = !this.ccEnabled;
    this.ccBtn.classList.toggle('active', this.ccEnabled);
    this.updateCaption();
  }

  toggleFullscreen() {
    // Already fullscreen? exit via whichever vendor path got us in.
    const fsEl =
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.webkitCurrentFullScreenElement;
    if (fsEl) {
      const exit =
        document.exitFullscreen ||
        document.webkitExitFullscreen ||
        document.webkitCancelFullScreen;
      exit?.call(document);
      return;
    }

    // iOS Safari only supports fullscreen on the <video> element itself,
    // via webkitEnterFullscreen(). The native iOS player takes over; our
    // `seeking` guard still fires so forward-scrubbing stays blocked.
    if (typeof this.video.webkitEnterFullscreen === 'function' &&
        !this.root.requestFullscreen) {
      const enter = () => {
        try { this.video.webkitEnterFullscreen(); } catch (_) {}
      };
      if (this.video.readyState >= 1) enter();
      else {
        this.video.addEventListener('loadedmetadata', enter, { once: true });
        if (this.video.paused && this.video.currentTime === 0) this.video.load();
      }
      return;
    }

    // Android Chrome + desktop: fullscreen the player root so our custom
    // controls, captions and frame all scale up with the video.
    const reqRoot =
      this.root.requestFullscreen ||
      this.root.webkitRequestFullscreen ||
      this.root.webkitRequestFullScreen;
    if (reqRoot) {
      const p = reqRoot.call(this.root);
      if (p && typeof p.catch === 'function') {
        p.catch(() => this.fullscreenVideoFallback());
      }
      return;
    }

    this.fullscreenVideoFallback();
  }

  fullscreenVideoFallback() {
    const reqVid =
      this.video.requestFullscreen ||
      this.video.webkitRequestFullscreen ||
      this.video.webkitEnterFullscreen;
    reqVid?.call(this.video);
  }

  onTimeUpdate() {
    const t = this.video.currentTime;
    const d = this.video.duration || 0;

    if (t > this.maxWatched) this.maxWatched = t;

    if (d > 0) {
      const pct = (t / d) * 100;
      const watchedPct = (this.maxWatched / d) * 100;
      if (this.progressFill) this.progressFill.style.width = pct + '%';
      if (this.progressWatched) this.progressWatched.style.width = watchedPct + '%';
    }
    this.updateTime();
    this.updateCaption();
    this.checkMilestones(t, d);
  }

  checkMilestones(t, d) {
    if (d <= 0) return;
    const pct = (t / d) * 100;
    [25, 50, 75, 100].forEach(m => {
      if (pct >= m && !this.milestones.has(m)) {
        this.milestones.add(m);
        this.clarityEvent('vsl_' + m + 'pct');
      }
    });
  }

  clarityEvent(name) {
    if (typeof clarity === 'function') clarity('event', name);
  }

  onPlay() {
    this.root.classList.add('is-playing');
    this.root.classList.remove('is-paused');
    this.clarityEvent('vsl_play');
  }

  onPause() {
    this.root.classList.remove('is-playing');
    this.root.classList.add('is-paused');
    this.clarityEvent('vsl_pause');
  }

  onEnded() {
    this.root.classList.remove('is-playing');
    this.root.classList.add('is-ended');
    this.clarityEvent('vsl_completed');
  }

  updateTime() {
    const t = this.video.currentTime;
    const d = this.video.duration || 0;
    if (this.timeEl) this.timeEl.textContent = this.fmt(t) + ' / ' + this.fmt(d);
  }

  fmt(s) {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ':' + sec.toString().padStart(2, '0');
  }
}

document.querySelectorAll('.mao-vsl-player').forEach(el => new MAOVslPlayer(el));
