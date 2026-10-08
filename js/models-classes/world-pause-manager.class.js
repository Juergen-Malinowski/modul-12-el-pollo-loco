/**
 * Controls pausing and resuming active gameplay without rebuilding the World.
 */
class WorldPauseManager {
  constructor(world) {
    this.world = world;
    this.pausedAudio = [];
  }

  /** Toggles pause while the current level is active. */
  togglePause() {
    if (!this.canTogglePause()) return;
    if (this.world.isPaused) this.resumeGame();
    else this.pauseGame();
  }

  /** Returns whether gameplay can currently enter or leave pause. */
  canTogglePause() {
    const world = this.world;
    const boss = world.level.enemies.find(function (enemy) {
      return enemy instanceof Endboss;
    });
    return !world.gameOver && !world.playerDefeated && !world.showYouWin &&
      !(boss && boss.isDeadBoss);
  }

  /** Pauses gameplay input and active game audio. */
  pauseGame() {
    this.world.isPaused = true;
    this.resetKeyboard();
    this.pauseAudio();
  }

  /** Resumes gameplay and previously active audio. */
  resumeGame() {
    this.world.isPaused = false;
    this.resumeAudio();
  }

  /** Clears held gameplay keys when pause starts. */
  resetKeyboard() {
    const keyboard = this.world.keyboard;
    keyboard.LEFT = false;
    keyboard.RIGHT = false;
    keyboard.UP = false;
    keyboard.DOWN = false;
    keyboard.SPACE = false;
    keyboard.SHIFT = false;
    keyboard.ENTER = false;
  }

  /** Pauses active audio sources without resetting playback positions. */
  pauseAudio() {
    const sources = this.getAudioSources();
    this.pausedAudio = [];
    for (let i = 0; i < sources.length; i++) {
      if (!sources[i] || sources[i].paused) continue;
      sources[i].pause();
      this.pausedAudio.push(sources[i]);
    }
  }

  /** Resumes audio sources that were active before pause. */
  resumeAudio() {
    if (soundHub.isMuted) {
      this.pausedAudio = [];
      return;
    }
    for (let i = 0; i < this.pausedAudio.length; i++) {
      this.playAudio(this.pausedAudio[i]);
    }
    this.pausedAudio = [];
  }

  /** Returns the SoundHub-managed audio sources used by gameplay. */
  getAudioSources() {
    const sources = [soundHub.backgroundMusic].concat(soundHub.getAllEffects());
    return sources.filter(function (audio, index) {
      return audio && sources.indexOf(audio) === index;
    });
  }

  /** Safely resumes one paused audio source. */
  playAudio(audio) {
    try {
      const promise = audio.play();
      if (promise) promise.catch(function () {});
    } catch (error) {}
  }
}
