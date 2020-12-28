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
		this.meta = null;
		
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
					this.meta = data['subsonic-response'].song[0]
					console.log("json data", this.meta, data);

					this.howl = new Howl({
						src: [this.GetServerQuery('download',{id: '300002162'})],
						html5: true
					});
					this.meta.artwork = [
						{
							src: this.GetServerQuery('getCoverArt',{id: '300002162', size: 256}),
							sizes: '256x256', 
							type: 'image/png'
						}
					];
					this.artwork.style.backgroundImage = 'url('+this.meta.artwork[0].src+')';
				}
			);
	}

	UnloadMediaFile(){
		console.log('Unloading audio file', this.howl);
		if(this.howl && this.howl.unload) this.howl.unload();
	}

	PlayMediaFile(){
		this.howl.play();
		if ('mediaSession' in navigator) {
			navigator.mediaSession.metadata = new MediaMetadata({
			  title: this.meta.title,
			  artist: this.meta.artist,
			  album: this.meta.album,
			  artwork: this.meta.artwork
			//   artwork: [
			// 	{ src: 'https://mytechnicalarticle/kendrick-lamar/to-pimp-a-butterfly/alright/96x96', sizes: '96x96', type: 'image/png' },
			// 	{ src: 'https://mytechnicalarticle/kendrick-lamar/to-pimp-a-butterfly/alright/128x128', sizes: '128x128', type: 'image/png' },
			// 	// More sizes, like 192x192, 256x256, 384x384, and 512x512
			//   ]
			});
			navigator.mediaSession.setActionHandler('play', () => {
				this.PlayMediaFile();
			});
			navigator.mediaSession.setActionHandler('pause', () => {
				this.PauseMediaFile();
			});
			navigator.mediaSession.setActionHandler('previoustrack', () => {
				console.log('prev track');
			});
			navigator.mediaSession.setActionHandler('nexttrack', () => {
				console.log('next track');
			});
			navigator.mediaSession.setActionHandler('seekbackward', (details) => {
				let seek = this.howl.seek() || 0;
				this.howl.seek( seek - (details.seekOffset || 10) );
			});
			navigator.mediaSession.setActionHandler('seekforward', (details) => {
				let seek = this.howl.seek() || 0;
				this.howl.seek( seek + (details.seekOffset || 10) );
			});
		}
	}

	PauseMediaFile(){
		this.howl.pause();
	}
}