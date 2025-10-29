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
        this.soundThrow = new Audio('./assets/sound/flying-bottle.mp3');          // Flasche geworfen
        this.soundCoin = new Audio('./assets/sound/coin-pling.mp3');              // Münze eingesammelt
        this.soundHit = new Audio('./assets/sound/pepe-cry.mp3');                 // Treffer durch Gegner
        this.soundChickenMud = new Audio('./assets/sound/chicken-mud.mp3');       // Pepe springt auf Huhn und trifft
        this.soundJumping = new Audio('./assets/sound/jumping.mp3');              // Pepe springt
        this.soundChickenHit = new Audio('./assets/sound/chicken-clucking.mp3');  // Huhn getroffen
        this.soundBottlePickup = new Audio('./assets/sound/plopp.mp3');           // Flasche eingesammelt
        this.soundBossStart = new Audio('./assets/sound/great-Chicken-Cry.mp3');  // Endboss aktiviert

        this.lastHitSoundTime = 0;       // Zeitstempel des letzten Charakter-Treffer-Sounds
        this.hitSoundCooldown = 2000;    // Mindestzeit in Millisekunden, bevor erneut Sound möglich


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

            this.soundThrow,             // Flasche fliegt durch die Luft
            this.soundChickenHit,        // Pepe trifft Huhn von oben ... Huhn schreit
            this.soundCoin,              // Münze aufgehoben
            this.soundHit,               // Charakter wird verletzt
            this.soundBottlePickup,      // Flaschen-Sound
            this.soundBossStart,         // Endboss startet
            this.soundJumping,           // Sprung-Sound Charakter
            this.soundChickenMud,        // Pepe springt auf Huhn und zermatscht es
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
