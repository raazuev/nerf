// src/utils/videoPlayer.js

export class VideoPlayer {
  constructor(url, options = {}) {
    this.url = url;
    this.onEnd = options.onEnd;
    this.loop = options.loop || false;
    this.muted = options.muted || false;
    this.controls = options.controls || false;
    this.overlayStyle = options.style || {};
    this.videoStyle = options.videoStyle || {};

    this._overlayEl = null;
    this._videoEl = null;
    this._closeBtn = null;
    this._isPlaying = false;
    this._container = options.container || document.body;

    this._onVideoEnded = this._onVideoEnded.bind(this);
    this._onClickTogglePlay = this._onClickTogglePlay.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onCloseClick = this._onCloseClick.bind(this);
  }

  play() {
    if (this._overlayEl) return;

    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor =
      this.overlayStyle.backgroundColor || "rgba(0, 0, 0, 0.7)";
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.zIndex = this.overlayStyle.zIndex || "1000";
    Object.entries(this.overlayStyle).forEach(([k, v]) => {
      if (k !== "backgroundColor" && k !== "zIndex") {
        overlay.style[k] = v;
      }
    });

    const videoContainer = document.createElement("div");
    videoContainer.style.position = "relative";
    videoContainer.style.width = this.videoStyle.width || "60vw";
    videoContainer.style.maxHeight = this.videoStyle.maxHeight || "80vh";
    videoContainer.style.display = "flex";
    videoContainer.style.border = "5px solid #09d1e1";
    videoContainer.style.justifyContent = "center";
    videoContainer.style.alignItems = "center";
    videoContainer.style.backgroundColor =
      this.videoStyle.containerBackgroundColor || "black";
    if (this.videoStyle.containerStyle) {
      Object.entries(this.videoStyle.containerStyle).forEach(([k, v]) => {
        videoContainer.style[k] = v;
      });
    }

    const video = document.createElement("video");
    video.src = this.url;
    video.loop = this.loop;
    video.muted = this.muted;
    video.controls = this.controls;
    video.playsInline = true;
    video.preload = "auto";
    video.style.width = "100%";
    video.style.height = "100%";
    video.style.objectFit = "contain";
    Object.entries(this.videoStyle).forEach(([k, v]) => {
      if (
        k !== "width" &&
        k !== "maxHeight" &&
        k !== "containerBackgroundColor" &&
        k !== "containerStyle"
      ) {
        video.style[k] = v;
      }
    });

    const closeBtn = document.createElement("div");
    closeBtn.innerHTML = "✕";
    closeBtn.style.position = "absolute";
    closeBtn.style.top = "8px";
    closeBtn.style.right = "8px";
    closeBtn.style.width = "32px";
    closeBtn.style.height = "32px";
    closeBtn.style.lineHeight = "32px";
    closeBtn.style.textAlign = "center";
    closeBtn.style.cursor = "pointer";
    closeBtn.style.color = this.videoStyle.closeColor || "#fff";
    closeBtn.style.fontSize = this.videoStyle.closeFontSize || "24px";
    closeBtn.style.backgroundColor =
      this.videoStyle.closeBgColor || "rgba(0,0,0,0.5)";
    closeBtn.style.borderRadius = this.videoStyle.closeBorderRadius || "16px";
    closeBtn.style.zIndex = "10";
    closeBtn.addEventListener("click", this._onCloseClick);

    videoContainer.appendChild(video);
    videoContainer.appendChild(closeBtn);
    overlay.appendChild(videoContainer);

    this._prevBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    this._overlayEl = overlay;
    this._videoEl = video;
    this._closeBtn = closeBtn;
    this._container.appendChild(overlay);

    video.addEventListener("ended", this._onVideoEnded);
    video.addEventListener("click", this._onClickTogglePlay);
    document.addEventListener("keydown", this._onKeyDown);

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this._isPlaying = true;
        })
        .catch((err) => {
          console.warn("VideoPlayer: не удалось начать воспроизведение:", err);
        });
    } else {
      this._isPlaying = true;
    }
  }

  _onClickTogglePlay(e) {
    if (!this._videoEl) return;
    if (e.target !== this._videoEl) {
      return;
    }
    if (this._videoEl.paused) {
      const p = this._videoEl.play();
      if (p) {
        p.catch((err) => console.warn("VideoPlayer: play error", err));
      }
      this._isPlaying = true;
    } else {
      this._videoEl.pause();
      this._isPlaying = false;
    }
  }

  _onKeyDown(e) {
    if (e.key === "Escape") {
      this.stop();
    }
  }

  _onCloseClick(e) {
    this.stop();
    e.stopPropagation();
  }

  stop() {
    if (!this._videoEl || !this._overlayEl) return;
    this._videoEl.removeEventListener("ended", this._onVideoEnded);
    this._videoEl.removeEventListener("click", this._onClickTogglePlay);
    document.removeEventListener("keydown", this._onKeyDown);
    if (this._closeBtn) {
      this._closeBtn.removeEventListener("click", this._onCloseClick);
    }
    document.body.style.overflow = this._prevBodyOverflow || "";

    if (this._overlayEl.parentNode) {
      this._videoEl.pause();
      this._videoEl.src = "";
      this._container.removeChild(this._overlayEl);
    }
    this._overlayEl = null;
    this._videoEl = null;
    this._closeBtn = null;
    this._isPlaying = false;

    if (typeof this.onEnd === "function") {
      this.onEnd();
    }
  }

  _onVideoEnded() {
    this.stop();
  }
}
