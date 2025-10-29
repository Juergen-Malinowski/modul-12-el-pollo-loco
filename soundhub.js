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

        // === SOUND-EFFEKTE ===
        this.soundJump = new Audio('./assets/sound/jump.mp3');                    // Sprung
        this.soundCoin = new Audio('./assets/sound/coin.mp3');                    // Münze eingesammelt
        this.soundHit = new Audio('./assets/sound/hit.mp3');                      // Treffer durch Gegner
        this.soundThrow = new Audio('./assets/sound/throw.mp3');                  // Flasche geworfen

        this.soundChickenHit = new Audio('./assets/sound/chicken-clucking.mp3');  // Huhn getroffen
        this.soundBottlePickup = new Audio('./assets/sound/plopp.mp3');           // Flasche eingesammelt
        this.soundBossStart = new Audio('./assets/sound/great-Chicken-Cry.mp3');  // Endboss aktiviert


        // === STATUS-FLAG ===
        this.isMuted = false;     // globaler Mute-Schalter
    }



    /**
     * === Musik an- oder ausschalten ===
     */
    toggleMusic() {
        if (this.backgroundMusic.paused) {
            this.backgroundMusic.play();
        } else {
            this.backgroundMusic.pause();
        }
    }



    /**
     * === ALLE Sounds stummschalten oder wieder aktivieren ===
     */
    toggleMute() {
        this.isMuted = !this.isMuted;

        // === Alle Sounds in ein Array packen ===
        var allSounds = [
            this.backgroundMusic,
            this.soundJump,
            this.soundCoin,
            this.soundHit,
            this.soundThrow,
            this.soundChickenHit,
            this.soundBottlePickup,      // Flaschen-Sound
            this.soundBossStart,         // Endboss startet
        ];

        // === Alle Sounds auf den neuen Status setzen ===
        for (var i = 0; i < allSounds.length; i++) {
            allSounds[i].muted = this.isMuted;
        }
    }



    /**
     * === Einzelnen Sound-Effekt abspielen (wenn nicht stummgeschaltet) ===
     */
    playEffect(audio) {
        if (!this.isMuted && audio) {
            audio.currentTime = 0;    // Sound von Anfang abspielen
            audio.play();
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
