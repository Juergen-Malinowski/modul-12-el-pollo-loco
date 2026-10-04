/**
 * Centralizes game audio, persistent sound settings, and shared timer cleanup.
 */
class SoundHub {

    constructor() {

        this.backgroundMusic = new Audio('./assets/sound/background-music.mp3');
        this.backgroundMusic.loop = true;
        this.backgroundMusic.volume = 0.3;
        this.backgroundMusic.preload = 'auto';

        this.soundThrow = new Audio('./assets/sound/flying-bottle.mp3');
        this.soundCoin = new Audio('./assets/sound/coin-pling.mp3');
        this.soundHit = new Audio('./assets/sound/pepe-cry.mp3');
        this.soundChickenMud = new Audio('./assets/sound/chicken-mud.mp3');
        this.soundJumping = new Audio('./assets/sound/jumping.mp3');
        this.soundChickenHit = new Audio('./assets/sound/chicken-clucking.mp3');
        this.soundBottlePickup = new Audio('./assets/sound/plopp.mp3');
        this.soundBossStart = new Audio('./assets/sound/great-Chicken-Cry.mp3');
        this.soundBossCharge = new Audio('./assets/sound/thunder-attack.mp3');

        this.lastHitSoundTime = 0;
        this.hitSoundCooldown = 2000;
        this.isMuted = false;

        this.loadSettings();
        this.musicVolume = this.backgroundMusic.volume;

        this.activeIntervals = [];
        this.activeTimeouts = [];
    }

    playBackgroundMusic() {
        if (this.isMuted) return;

        if (!this.backgroundMusic.paused) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
        }

        this.backgroundMusic.volume = this.musicVolume != null ? this.musicVolume : this.backgroundMusic.volume;
        this.backgroundMusic.loop = true;

        this.backgroundMusic.play().catch(function (e) {
            console.warn("Background music could not start automatically:", e);
        });
    }

    stopBackgroundMusic() {
        if (this.backgroundMusic && !this.backgroundMusic.paused) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
        }
    }

    playEffect(audio) {
        if (!this.isMuted && audio) {
            try {
                audio.currentTime = 0;
                let playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(err => { });
                }
            } catch (err) { }
        }
    }

    getAllEffects() {
        const list = [
            this.soundThrow,
            this.soundCoin,
            this.soundHit,
            this.soundChickenMud,
            this.soundJumping,
            this.soundChickenHit,
            this.soundBottlePickup,
            this.soundBossStart,
            this.soundBossCharge,
        ];

        if (this.snoringAudio) {
            list.push(this.snoringAudio);
        }

        return list;
    }

    setMusicVolume(value) {
        var v = parseFloat(value);
        if (isNaN(v)) return;
        v = Math.min(Math.max(v, 0), 1);
        this.musicVolume = v;
        this.backgroundMusic.volume = v;
        try { localStorage.setItem('audio_music_volume', v.toString()); } catch (err) { }
    }

    setEffectsVolume(value) {
        var v = parseFloat(value);
        if (isNaN(v)) return;
        v = Math.min(Math.max(v, 0), 1);

        var effects = this.getAllEffects();
        for (var i = 0; i < effects.length; i++) {
            effects[i].volume = v;
        }

        try { localStorage.setItem('audio_effects_volume', v.toString()); } catch (err) { }
    }

    getMusicVolume() {
        return this.backgroundMusic.volume;
    }

    getEffectsVolume() {
        var effects = this.getAllEffects();
        return effects.length > 0 ? effects[0].volume : 1.0;
    }

    setMuted(isMuted) {
        this.isMuted = !!isMuted;
        this.backgroundMusic.muted = this.isMuted;
        if (this.isMuted && this.backgroundMusic && !this.backgroundMusic.paused) {
            this.backgroundMusic.pause();
        }
        var effects = this.getAllEffects();
        for (var i = 0; i < effects.length; i++) {
            effects[i].muted = this.isMuted;
        }
        try { localStorage.setItem('audio_muted', this.isMuted ? 'true' : 'false'); } catch (err) { }
    }

    toggleMute() {
        this.setMuted(!this.isMuted);
    }

    stopEffect(audio) {
        try {
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
        } catch (e) { }
    }

    stopAllEffects() {
        var effects = this.getAllEffects();
        for (var i = 0; i < effects.length; i++) {
            this.stopEffect(effects[i]);
        }
    }

    stopBossCharge() {
        try {
            if (this.soundBossCharge) {
                this.soundBossCharge.pause();
                this.soundBossCharge.currentTime = 0;
                this.soundBossCharge.loop = false;
            }
            if (this.soundBossStart) {
                this.soundBossStart.pause();
                this.soundBossStart.currentTime = 0;
                this.soundBossStart.loop = false;
            }
        } catch (e) {
            console.warn("Failed to stop boss audio:", e);
        }
    }

    loadSettings() {
        try {
            var m = localStorage.getItem('audio_music_volume');
            var e = localStorage.getItem('audio_effects_volume');
            var mute = localStorage.getItem('audio_muted');

            if (m !== null) {
                var mv = parseFloat(m);
                if (!isNaN(mv)) this.setMusicVolume(mv);
            }
            if (e !== null) {
                var ev = parseFloat(e);
                if (!isNaN(ev)) this.setEffectsVolume(ev);
            }
            if (mute !== null) {
                this.setMuted(mute === 'true');
            }
        } catch (err) {
            console.warn('Failed to load audio settings:', err);
        }
    }

    /**
     * Registers an interval for global gameplay cleanup.
     *
     * @param {number} intervalId - Browser interval identifier.
     * @returns {number} Registered interval identifier.
     */
    registerInterval(intervalId) {
        if (intervalId != null) {
            this.activeIntervals.push(intervalId);
        }
        return intervalId;
    }

    /**
     * Registers a timeout for global gameplay cleanup.
     *
     * @param {number} timeoutId - Browser timeout identifier.
     * @returns {number} Registered timeout identifier.
     */
    registerTimeout(timeoutId) {
        if (timeoutId != null) {
            this.activeTimeouts.push(timeoutId);
        }
        return timeoutId;
    }

    /**
     * Stops and clears all registered gameplay intervals.
     */
    stopAllIntervals() {
        for (let i = 0; i < this.activeIntervals.length; i++) {
            clearInterval(this.activeIntervals[i]);
        }
        this.activeIntervals = [];
    }

    /**
     * Stops and clears all registered gameplay timeouts.
     */
    stopAllTimeouts() {
        for (let i = 0; i < this.activeTimeouts.length; i++) {
            clearTimeout(this.activeTimeouts[i]);
        }
        this.activeTimeouts = [];
    }

    /**
     * Stops every audio source managed by this hub.
     */
    stopAllAudio() {
        try {
            this.stopBackgroundMusic();
        } catch (e) { }

        try {
            this.stopAllEffects();
        } catch (e) { }

        try {
            this.stopBossCharge();
        } catch (e) { }

        try {
            this.stopSnoring();
        } catch (e) { }
    }

    /**
     * Stops registered timers and all active game audio.
     */
    stopAllGameActivities() {
        try {
            this.stopAllIntervals();
            this.stopAllTimeouts();
            this.stopAllEffects();
            this.stopBackgroundMusic();
            this.stopBossCharge();
        } catch (err) {
            console.warn("Failed to stop all game activities:", err);
        }
    }

    /**
     * Resets shared audio and timer state to an idle baseline.
     */
    resetAllSystems() {
        this.stopAllAudio();
        this.stopAllIntervals();
        this.activeIntervals = [];
        this.activeTimeouts = [];
    }

    /**
     * Starts the looping snoring effect when audio is enabled.
     */
    playSnoring() {
        if (this.isMuted) return;

        if (!this.snoringAudio) {
            this.snoringAudio = new Audio('./assets/sound/snoring.mp3');
            this.snoringAudio.loop = true;
            this.snoringAudio.volume = this.getEffectsVolume();
            this.snoringAudio.preload = 'auto';
        } else {

            this.snoringAudio.volume = this.getEffectsVolume();
        }

        try {
            this.snoringAudio.currentTime = 0;
            this.snoringAudio.play().catch(err => console.warn('Snoring audio could not start:', err));
        } catch (e) { }
    }

    /**
     * Stops and rewinds the snoring effect.
     */
    stopSnoring() {
        if (this.snoringAudio) {
            this.snoringAudio.pause();
            this.snoringAudio.currentTime = 0;
        }
    }
}

(function () {
    try {

        const globalObj = typeof window !== 'undefined' ? window : globalThis;
        if (!globalObj.soundHub) {
            globalObj.soundHub = new SoundHub();
        }
    } catch (e) {
        console.warn("Failed to register SoundHub globally:", e);
    }
})();
