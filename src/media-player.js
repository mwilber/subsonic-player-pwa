import {Howl, Howler} from 'howler';

export class MediaPlayer{
	constructor(node){
		console.log('Created Media Player');
		this.controls = {
			load: node.querySelector('.btn.load'),
			play: node.querySelector('.btn.play'),
			pause: node.querySelector('.btn.pause')
		};
		this.display = {
			timer: node.querySelector('.display .timer'),
			duration: node.querySelector('.display .duration')
		}
		this.artwork = node.querySelector('.artwork');

		// Audio playback managed by Howler.js
		this.howl = null;
		this.meta = null;
		
		this.SetControls();

		document.getElementById('server').value = localStorage['server'];
		document.getElementById('user').value = localStorage['user'];
		document.getElementById('pass').value = localStorage['pass'];
	}

	// TODO: implement this instead of inline in play function
	InitMediaSessionHandlers(){
		const actionsAndHandlers = [
			['play', () => { /*...*/ }],
			['pause', () => { /*...*/ }],
			['previoustrack', () => { /*...*/ }],
			['nexttrack', () => { /*...*/ }],
			['seekbackward', (details) => { /*...*/ }],
			['seekforward', (details) => { /*...*/ }],
			['seekto', (details) => { /*...*/ }],
			['stop', () => { /*...*/ }]
		]
		 
		for (const [action, handler] of actionsAndHandlers) {
			try {
			  navigator.mediaSession.setActionHandler(action, handler);
			} catch (error) {
			  console.log(`The media session action, ${action}, is not supported`);
			}
		}
	}

	Step(){
		let self = this;

		// Get the Howl we want to manipulate.
		let sound = self.howl;

		// Determine our current seek position.
		let seek = sound.seek() || 0;
		let duration = this.howl.duration();
		self.display.timer.innerHTML = self.formatTime(Math.round(seek));
		//progress.style.width = (((seek / sound.duration()) * 100) || 0) + '%';

		// Update the media session api
		if ('mediaSession' in navigator) {
			navigator.mediaSession.setPositionState({
				duration: duration,
				playbackRate: this.howl.rate(),
				position: seek
			});
		}

		// If the sound is still playing, continue stepping.
		if (sound.playing()) {
			requestAnimationFrame(self.Step.bind(self));
		}
	}

	formatTime(secs) {
		var minutes = Math.floor(secs / 60) || 0;
		var seconds = (secs - minutes * 60) || 0;
	
		return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
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

		localStorage['server'] = document.getElementById('server').value;
		localStorage['user'] = document.getElementById('user').value;
		localStorage['pass'] = document.getElementById('pass').value;

		let server = localStorage['server'];
		let user = localStorage['user'];
		let pass = localStorage['pass'];

		if(server && user && pass){
			let query = server+'/rest/'+method+'.view?u='+user+'&p='+pass+'&v=1.12.0&f=json&c=greenzeta';
			for (const key in params) {
				if (Object.hasOwnProperty.call(params, key)) {
					query += '&'+key+'='+params[key];
				}
			}
			return query;
	}
	}

	LoadMediaFile(){
		this.UnloadMediaFile();
		fetch(this.GetServerQuery('getSong',{id: '300002556'}))
			.then(response => response.json())
			.then(
				(data)=>{
					this.meta = data['subsonic-response'].song[0]
					console.log("json data", this.meta, data);

					this.howl = new Howl({
						src: [this.GetServerQuery('download',{id: '300002556'})],
						html5: true,
						onplay: ()=>{
							// Display the duration.
							this.display.duration.innerHTML = this.formatTime(Math.round(this.howl.duration()));
				  
							// Start upating the progress of the track.
							requestAnimationFrame(this.Step.bind(this));
						},
					});
					this.meta.artwork = [
						{
							src: this.GetServerQuery('getCoverArt',{id: '300002556', size: 256}),
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
			navigator.mediaSession.playbackState = "playing";
			navigator.mediaSession.setActionHandler('play', () => {
				this.PlayMediaFile();
			});
			navigator.mediaSession.setActionHandler('pause', () => {
				this.PauseMediaFile();
			});
			navigator.mediaSession.setActionHandler('stop', () => {
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
			navigator.mediaSession.setActionHandler('seekto', (details) => {
				// if (details.fastSeek && 'fastSeek' in alright) {
				//   alright.fastSeek(details.seekTime);
				//   return;
				// }
				this.howl.seek( details.seekTime );
			});
		}
	}

	PauseMediaFile(){
		this.howl.pause();
		navigator.mediaSession.playbackState = "paused";
	}
}