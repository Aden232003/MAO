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

    this.init();
  }

  init() {
    // Set initial state: hide native controls always
    this.video.controls = false;
    this.video.playsInline = true;

    // Enable CC by default when track loads
    const enableTracks = () => {
      const tracks = this.video.textTracks;
      for (let i = 0; i < tracks.length; i++) tracks[i].mode = 'showing';
      if (tracks.length > 0) this.ccBtn?.classList.add('active');
    };
    enableTracks();
    this.video.textTracks.addEventListener?.('addtrack', enableTracks);

    this.bindEvents();
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
    const tracks = this.video.textTracks;
    if (tracks.length === 0) return;
    this.ccEnabled = !this.ccEnabled;
    for (let i = 0; i < tracks.length; i++) {
      tracks[i].mode = this.ccEnabled ? 'showing' : 'hidden';
    }
    this.ccBtn.classList.toggle('active', this.ccEnabled);
  }

  toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      this.root.requestFullscreen?.();
    }
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
  }

  onPlay() {
    this.root.classList.add('is-playing');
    this.root.classList.remove('is-paused');
  }

  onPause() {
    this.root.classList.remove('is-playing');
    this.root.classList.add('is-paused');
  }

  onEnded() {
    this.root.classList.remove('is-playing');
    this.root.classList.add('is-ended');
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
