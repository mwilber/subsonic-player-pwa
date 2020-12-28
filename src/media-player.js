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
		this.artwork = node.querySelector('.artwork');

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
		return query;
	}

	LoadMediaFile(){
		this.UnloadMediaFile();
		fetch(this.GetServerQuery('getSong',{id: '300002162'}))
			.then(response => response.json())
			.then(
				(data)=>{
					console.log("json data", data);
				}
			);
		this.howl = new Howl({
			src: [this.GetServerQuery('download',{id: '300002162'})],
			html5: true
		});
		this.artwork.style.backgroundImage = 'url('+this.GetServerQuery('getCoverArt',{id: '300002162'})+')';
	}

	UnloadMediaFile(){
		console.log('Unloading audio file', this.howl);
		if(this.howl && this.howl.unload) this.howl.unload();
	}

	PlayMediaFile(){
		this.howl.play();
	}

	PauseMediaFile(){
		this.howl.pause();
	}
}