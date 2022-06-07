export default class KeyManager {
    constructor() {
        console.log("Keystroke Manager Loaded");
        
        document.addEventListener('keyup', (evt) => {
            console.log('KeyManager', 'keypress', evt)
            if (/^[0-9]$/i.test(evt.key)) {
                const numVal = parseInt(evt.key);
                if (numVal || numVal === 0) this.ChangeVolume({value: (numVal * 10)});
            } else {
                switch (evt.key) {
                    case 'ArrowUp':
                        this.ChangeVolume({increment: 1});
                        break;
                    case 'ArrowDown':
                        this.ChangeVolume({increment: -1});
                        break;
                    default:
                        break;
                }
            }
        });
    }

    ChangeVolume({increment, value} = {}) {
        const mediaPlayer = document.querySelector('media-player');
        let currVol = parseInt(mediaPlayer.controls.volume.value);

        if (value || value === 0) currVol = value;
        if (increment) currVol += increment;

        mediaPlayer.controls.volume.value = currVol;
        const evt = document.createEvent("HTMLEvents");
        evt.initEvent("change", false, false);
        mediaPlayer.controls.volume.dispatchEvent(evt);
    }
}