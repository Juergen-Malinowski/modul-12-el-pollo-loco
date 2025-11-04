/**
 * ===========================================================
 *  SOUND- & GAMEHUB-KLASSE
 *  -----------------------
 *  Zentrale Steuerung für:
 *    - alle Audio-Sounds (Musik & Effekte)
 *    - Intervalle und Timeouts
 *    - globale Cleanup-Funktion (Spielende / Neustart)
 * ===========================================================
 *  (C) Jürgen Malinowski – Erweiterung am: 04.11.2025
 * ===========================================================
 */

class SoundHub {

    constructor() {
        // === HINTERGRUNDMUSIK ===
        this.backgroundMusic = new Audio('./assets/sound/background-music.mp3');
        this.backgroundMusic.loop = true;
        this.backgroundMusic.volume = 0.3;
        this.backgroundMusic.preload = 'auto';

        // === SOUND-EFFEKTE ===
        this.soundThrow = new Audio('./assets/sound/flying-bottle.mp3');
        this.soundCoin = new Audio('./assets/sound/coin-pling.mp3');
        this.soundHit = new Audio('./assets/sound/pepe-cry.mp3');
        this.soundChickenMud = new Audio('./assets/sound/chicken-mud.mp3');
        this.soundJumping = new Audio('./assets/sound/jumping.mp3');
        this.soundChickenHit = new Audio('./assets/sound/chicken-clucking.mp3');
        this.soundBottlePickup = new Audio('./assets/sound/plopp.mp3');
        this.soundBossStart = new Audio('./assets/sound/great-Chicken-Cry.mp3');
        this.soundBossCharge = new Audio('./assets/sound/thunder-attack.mp3');

        // === SYSTEM-STATUS ===
        this.lastHitSoundTime = 0;
        this.hitSoundCooldown = 2000;
        this.isMuted = false;

        // === AUDIO-EINSTELLUNGEN LADEN ===
        this.loadSettings();
        this.musicVolume = this.backgroundMusic.volume;

        // === NEU: INTERVALL-/TIMEOUT-VERWALTUNG ===
        this.activeIntervals = [];     // alle aktiven Intervall-IDs
        this.activeTimeouts = [];      // alle aktiven Timeout-IDs
    }


    /* ===========================================================
     *  AUDIO-STEUERUNG
     * ===========================================================
     */

    playBackgroundMusic() {
        if (this.isMuted) return;

        if (!this.backgroundMusic.paused) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
        }

        this.backgroundMusic.volume = this.musicVolume != null ? this.musicVolume : this.backgroundMusic.volume;
        this.backgroundMusic.loop = true;

        this.backgroundMusic.play().catch(function (e) {
            console.warn("Musik konnte nicht automatisch gestartet werden:", e);
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
        // Schnarchen nur anhängen, wenn schon initialisiert
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
            console.warn("Fehler beim Stoppen der Boss-Sounds:", e);
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
            console.warn('Audioeinstellungen konnten nicht geladen werden:', err);
        }
    }


    /* ===========================================================
     *  NEU: INTERVALL- UND TIMEOUT-VERWALTUNG
     * ===========================================================
     */

    registerInterval(intervalId) {
        if (intervalId != null) {
            this.activeIntervals.push(intervalId);
        }
        return intervalId;
    }

    registerTimeout(timeoutId) {
        if (timeoutId != null) {
            this.activeTimeouts.push(timeoutId);
        }
        return timeoutId;
    }

    stopAllIntervals() {
        for (let i = 0; i < this.activeIntervals.length; i++) {
            clearInterval(this.activeIntervals[i]);
        }
        this.activeIntervals = [];
    }

    stopAllTimeouts() {
        for (let i = 0; i < this.activeTimeouts.length; i++) {
            clearTimeout(this.activeTimeouts[i]);
        }
        this.activeTimeouts = [];
    }


    /* ===========================================================
     *  NEU: GLOBALE CLEANUP-FUNKTION
     * ===========================================================
     */

    /**
     * Stoppt ALLE Audioquellen dieses Hubs (Musik, Effekte, Schnarchen, Boss).
     * Kann gefahrlos mehrfach aufgerufen werden.
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


    stopAllGameActivities() {
        try {
            this.stopAllIntervals();
            this.stopAllTimeouts();
            this.stopAllEffects();
            this.stopBackgroundMusic();
            this.stopBossCharge();
        } catch (err) {
            console.warn("Fehler beim globalen Stoppen aller Aktivitäten:", err);
        }
    }
    /**
     * Stoppt und leert sämtliche Sound-, Video- und Intervall-Elemente
     */
    resetAllSystems() {
        this.stopAllAudio();
        this.stopAllIntervals();
        this.activeIntervals = [];
        this.activeTimeouts = [];
    }
    /**
 * Spielt den Schnarchsound ab (sofern nicht stumm).
 */
    playSnoring() {
        if (this.isMuted) return;

        if (!this.snoringAudio) {
            this.snoringAudio = new Audio('./assets/sound/snoring.mp3');
            this.snoringAudio.loop = true;
            this.snoringAudio.volume = this.getEffectsVolume(); // an Effekte anlehnen
            this.snoringAudio.preload = 'auto';
        } else {
            // falls sich Effekte geändert haben
            this.snoringAudio.volume = this.getEffectsVolume();
        }

        try {
            this.snoringAudio.currentTime = 0;
            this.snoringAudio.play().catch(err => console.warn('Snoring konnte nicht gestartet werden:', err));
        } catch (e) { }
    }


    /**
     * Stoppt das Schnarchen sofort.
     */
    stopSnoring() {
        if (this.snoringAudio) {
            this.snoringAudio.pause();
            this.snoringAudio.currentTime = 0;
        }
    }
}

/**
 * ===========================================================
 *  Globale Initialisierung des SoundHub – sicher auch auf Servern
 * ===========================================================
 */
(function () {
    try {
        // Prüfen, ob wir uns im Browser befinden
        const globalObj = typeof window !== 'undefined' ? window : globalThis;
        if (!globalObj.soundHub) {
            globalObj.soundHub = new SoundHub();
            console.log("✅ SoundHub global initialisiert (safe mode).");
        } else {
            console.log("ℹ️ SoundHub war bereits vorhanden.");
        }
    } catch (e) {
        console.warn("⚠️ Konnte SoundHub nicht global registrieren:", e);
    }
})();



/**
 * ===========================================================
 *  SOUND- & GAMEHUB - DATEI-STATUS
 *  -----------------
 *  (C) Jürgen Malinowski – Letzte Bearbeitung:
 *  04.11.2025 – 14:00 Uhr
 * ===========================================================
 */
