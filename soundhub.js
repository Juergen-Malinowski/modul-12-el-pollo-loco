/**
 * ===========================================================
 *  SOUNDHUB-KLASSE
 *  -----------------
 *  Verwaltet alle Audio-Sounds des Spiels (Musik & Effekte)
 *  ===========================================================
 */
class SoundHub {

    constructor() {
        // === HINTERGRUNDMUSIK ===
        this.backgroundMusic = new Audio('./assets/sound/background-music.mp3');
        this.backgroundMusic.loop = true;
        this.backgroundMusic.volume = 0.3;
        this.backgroundMusic.preload = 'auto';

        // === SOUND-EFFEKTE ===
        this.soundThrow = new Audio('./assets/sound/flying-bottle.mp3');          // Flasche geworfen
        this.soundCoin = new Audio('./assets/sound/coin-pling.mp3');              // Münze eingesammelt
        this.soundHit = new Audio('./assets/sound/pepe-cry.mp3');                 // Treffer durch Gegner
        this.soundChickenMud = new Audio('./assets/sound/chicken-mud.mp3');       // Pepe springt auf Huhn und trifft
        this.soundJumping = new Audio('./assets/sound/jumping.mp3');              // Pepe springt
        this.soundChickenHit = new Audio('./assets/sound/chicken-clucking.mp3');  // Huhn getroffen
        this.soundBottlePickup = new Audio('./assets/sound/plopp.mp3');           // Flasche eingesammelt
        this.soundBossStart = new Audio('./assets/sound/great-Chicken-Cry.mp3');  // Endboss aktiviert
        this.soundBossCharge = new Audio('./assets/sound/thunder-attack.mp3');    // Blitzangriff Endboss


        // === ALLGEMEINE VARIABLEN ===
        this.lastHitSoundTime = 0;        // Zeitstempel des letzten Charakter-Treffer-Sounds
        this.hitSoundCooldown = 2000;     // Mindestzeit in Millisekunden, bevor erneut Sound möglich
        this.isMuted = false;             // globaler Mute-Schalter

        // === Audioeinstellungen aus localStorage laden / speichern background-volume ===
        this.loadSettings();
        this.musicVolume = this.backgroundMusic.volume;
    }



    /**
     * === HINTERGRUNDMUSIK sicher starten ===
     */
    playBackgroundMusic() {
        if (this.isMuted) {
            return; // Wenn global stummgeschaltet, nichts tun
        }

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



    /**
     * === HINTERGRUNDMUSIK stoppen ===
     */
    stopBackgroundMusic() {
        if (this.backgroundMusic && !this.backgroundMusic.paused) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
        }
    }

    /**
     * Einzelnen Sound-Effekt abspielen (wenn nicht stummgeschaltet) ...
     */
    playEffect(audio) {
        if (!this.isMuted && audio) {
            try {
                audio.currentTime = 0;               // Sound von Anfang abspielen
                let playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(err => { });
                }
            } catch (err) { }
        }
    }





    /**
     * === Alle Effekt-Sounds als Liste zurückgeben ===
     */
    getAllEffects() {
        return [
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
    }



    /**
     * === Musiklautstärke 0..1 setzen ===
     */
    setMusicVolume(value) {
        var v = parseFloat(value);
        if (isNaN(v)) return;
        if (v < 0) v = 0;
        if (v > 1) v = 1;

        this.musicVolume = v;
        this.backgroundMusic.volume = v;

        try {
            localStorage.setItem('audio_music_volume', v.toString());
        } catch (err) { }
    }



    /**
     * === Effektlautstärke 0..1 für alle Effekte setzen ===
     */
    setEffectsVolume(value) {
        var v = parseFloat(value);
        if (isNaN(v)) return;
        if (v < 0) v = 0;
        if (v > 1) v = 1;

        var effects = this.getAllEffects();
        for (var i = 0; i < effects.length; i++) {
            effects[i].volume = v;
        }

        try {
            localStorage.setItem('audio_effects_volume', v.toString());
        } catch (err) { }
    }



    /**
     * === Global stumm schalten / wieder aktivieren ===
     */
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

        try {
            localStorage.setItem('audio_muted', this.isMuted ? 'true' : 'false');
        } catch (err) { }
    }

    /**
     * === Umschalten (Mute / Unmute) ===
     */
    toggleMute() {
        this.setMuted(!this.isMuted);
    }

    /**
     * === Musiklautstärke abrufen ===
     */
    getMusicVolume() {
        return this.backgroundMusic.volume;
    }

    /**
     * === Einzelnen Effekt-Sound sicher stoppen (pausieren & zurücksetzen) ===
     */
    stopEffect(audio) {
        try {
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
        } catch (e) {
            // leise Fehlerbehandlung
        }
    }

    /**
     * === Alle Effekt-Sounds stoppen (für Spielende / Szenenwechsel) ===
     */
    stopAllEffects() {
        var effects = this.getAllEffects();
        for (var i = 0; i < effects.length; i++) {
            this.stopEffect(effects[i]);
        }
    }

    /**
     * === Effektlautstärke abrufen ===
     */
    getEffectsVolume() {
        var effects = this.getAllEffects();
        if (effects.length > 0) {
            return effects[0].volume;
        }
        return 1.0;
    }



    /**
     * === Audioeinstellungen aus dem localStorage laden ===
     */
    loadSettings() {
        try {
            var m = localStorage.getItem('audio_music_volume');
            var e = localStorage.getItem('audio_effects_volume');
            var mute = localStorage.getItem('audio_muted');

            if (m !== null) {
                var mv = parseFloat(m);
                if (!isNaN(mv)) {
                    this.setMusicVolume(mv);
                }
            }
            if (e !== null) {
                var ev = parseFloat(e);
                if (!isNaN(ev)) {
                    this.setEffectsVolume(ev);
                }
            }
            if (mute !== null) {
                this.setMuted(mute === 'true');
            }
        } catch (err) {
            console.warn('Audioeinstellungen konnten nicht geladen werden:', err);
        }
    }
}



/**
 * ===========================================================
 *  GLOBALE VARIABLE
 *  -----------------
 *  Damit das SoundHub-Objekt im gesamten Spiel erreichbar ist.
 * ===========================================================
 */
var soundHub = new SoundHub();
