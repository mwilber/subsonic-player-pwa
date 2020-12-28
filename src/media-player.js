import {Howl, Howler} from 'howler';
import creds from 'credentials';

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

	GetServerQuery(method, params){
		let query = creds.server+'/rest/'+method+'.view?u='+creds.user+'&p='+creds.password+'&v=1.12.0&f=json&c=greenzeta';
		for (const key in params) {
			if (Object.hasOwnProperty.call(params, key)) {
				query += '&'+key+'='+params[key];
			}
		}
		console.log("🚀 ~ file: media-player.js ~ line 35 ~ MediaPlayer ~ GetServerQuery ~ query", query)

		return query;
	}

	LoadMediaFile(){
		this.UnloadMediaFile();
		this.GetServerQuery('getSong',{id: '300002162'})
		//fetch()
		this.howl = new Howl({
			src: [this.GetServerQuery('download',{id: '300002162'})],
			html5: true
		});
		console.log("🚀 ~ file: media-player.js ~ line 31 ~ MediaPlayer ~ LoadMediaFile ~ this.howl", this.howl)
	}

	UnloadMediaFile(){
		console.log('Unloading audio file', this.howl);
		if(this.howl && this.howl.unload) this.howl.unload();
        console.log("🚀 ~ file: media-player.js ~ line 40 ~ MediaPlayer ~ UnloadMediaFile ~ this.howl", this.howl)
	}

	PlayMediaFile(){
		this.howl.play();
	}

	PauseMediaFile(){
		this.howl.pause();
	}
}