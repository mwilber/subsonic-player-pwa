import {Howl, Howler} from 'howler';

export class MediaPlayer{
	constructor(node, api){
		this.api = api;
		
		this.controls = {
			load: node.querySelector('.btn.load'),
			play: node.querySelector('.btn.play'),
			pause: node.querySelector('.btn.pause'),
			next: node.querySelector('.btn.next'),
			previous: node.querySelector('.btn.previous'),
			scrubber: node.querySelector('.range.scrubber')
		};
		this.display = {
			title: node.querySelector('.display .title'),
			album: node.querySelector('.display .album'),
			artist: node.querySelector('.display .artist'),
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

		console.log('Created Media Player');
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

		// Update the scrubber position
		if(document.activeElement != this.controls.scrubber){
			this.controls.scrubber.value = Math.floor((seek/duration)*100);
		}

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

		this.controls.next.addEventListener('click', (evt)=>{
			this.NextMediaFile();
		});

		this.controls.previous.addEventListener('click', (evt)=>{
			this.PreviousMediaFile();
		});

		this.controls.scrubber.addEventListener('change', (evt)=>{
			console.log('scrubber changed', this.controls.scrubber.value);
			let duration = this.howl.duration();
			this.howl.seek( duration * (this.controls.scrubber.value / 100) );
		});
	}

	UnloadMediaFile(){
		console.log('Unloading audio file', this.howl);
		if(this.howl && this.howl.unload) this.howl.unload();
	}

	LoadMediaFile(){
		this.UnloadMediaFile();
		this.api.GetSong('300002556')
			.then((data)=>{
				this.meta = data;
				this.howl = new Howl({
					src: this.meta.src,
					html5: true,
					onplay: ()=>{
						// Display the duration.
						this.display.duration.innerHTML = this.formatTime(Math.round(this.howl.duration()));
						// Start upating the progress of the track.
						requestAnimationFrame(this.Step.bind(this));
					},
				});
				this.artwork.style.backgroundImage = 'url('+this.meta.coverArt[0].src+')';
				navigator.serviceWorker.controller.postMessage({
					action: 'cache-version'
				});
			});
	}

	PlaySongObject(song, cb){
		this.UnloadMediaFile();
		this.meta = song;
		this.meta.cb = cb;
		this.howl = new Howl({
			src: this.meta.src,
			html5: true,
			onplay: ()=>{
				// Display the duration.
				this.display.duration.innerHTML = this.formatTime(Math.round(this.howl.duration()));
				// Start upating the progress of the track.
				requestAnimationFrame(this.Step.bind(this));
			},
		});
		this.artwork.style.backgroundImage = 'url('+this.meta.coverArt[0].src+')';
		this.PlayMediaFile();
	}

	PlayMediaFile(){
		this.display.title.innerText = this.meta.title;
		this.display.album.innerText = this.meta.album;
		this.display.artist.innerText = this.meta.artist;
		this.howl.play();
		this.howl.on('end', this.meta.cb);
		if ('mediaSession' in navigator) {
			// TODO: Fix this, it's creating a new MediaMetadata object on each play. Should be created on load.
			navigator.mediaSession.metadata = new MediaMetadata({
			  title: this.meta.title,
			  artist: this.meta.artist,
			  album: this.meta.album,
			  artwork: this.meta.coverArt
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
				this.PreviousMediaFile();
			});
			navigator.mediaSession.setActionHandler('nexttrack', () => {
				this.NextMediaFile();
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

	NextMediaFile(){
		// Placeholder. Override in MediaListing.
	}

	PreviousMediaFile(){
		// Placeholder. Override in MediaListing.
	}
}