import {Howl, Howler} from 'howler';

export class MediaPlayer{
	constructor(node){
		console.log('Created Media Player');
		this.controls = {
			load: node.querySelector('.btn.load'),
			play: node.querySelector('.btn.play'),
			pause: node.querySelector('.btn.pause')
		};

		// Audio playback managed by Howler.js
		this.howl = null;
		
		this.SetControls();
	}

	SetControls(){
		this.controls.load.addEventListener('click', (evt)=>{
			this.LoadMediaFile();
		});

		this.controls.play.addEventListener('click', (evt)=>{
			this.PlayMediaFile();
		});

		this.controls.pause.addEventListener('click', (evt)=>{
			this.PauseMediaFile();
		});
	}

	LoadMediaFile(){
		this.UnloadMediaFile();
		this.howl = new Howl({
			src: ['http://music.mwilber.com/rest/download.view?u=mwilber&p=d4rkw4rr!0r&v=1.12.0&c=myapp&id=300002162'],
			html5: true
		});
		console.log("🚀 ~ file: media-player.js ~ line 31 ~ MediaPlayer ~ LoadMediaFile ~ this.howl", this.howl)
	}

	UnloadMediaFile(){
		console.log('Unloading audio file', this.howl);
		if(this.howl) this.howl.unload();
        console.log("🚀 ~ file: media-player.js ~ line 40 ~ MediaPlayer ~ UnloadMediaFile ~ this.howl", this.howl)
	}

	PlayMediaFile(){
		this.howl.play();
	}

	PauseMediaFile(){
		this.howl.pause();
	}
}