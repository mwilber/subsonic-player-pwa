import {Howl, Howler} from 'howler';
import { ApiSubsonic } from '../../api-subsonic';

import cssData from './media-player.css';

window.customElements.define('media-player', class extends HTMLElement {
	constructor(node, api){
		super();

		this.api = new ApiSubsonic();
		let shadowRoot = this.attachShadow({mode: 'open'});

		// Audio playback managed by Howler.js
		this.howl = null;
		this.meta = null;

		document.addEventListener('PlaySongObject',(evt)=>{
			console.log('PlaySongObject', evt);
			let {song, cb} = evt.detail;
			if(!song) return;
			this.PlaySongObject(song, cb);
		});

		this.InitMediaSessionHandlers();

		console.log('Created Media Player');
	}

	connectedCallback() {
		this.render();
	}

	disconnectedCallback(){

	}

	InitMediaSessionHandlers(){
		const actionsAndHandlers = [
			['play', () => { this.PlayMediaFile(); }],
			['pause', () => { this.PauseMediaFile(); }],
			['previoustrack', () => { this.PreviousMediaFile(); }],
			['nexttrack', () => { this.NextMediaFile(); }],
			['seekbackward', (details) => { 
				let seek = this.howl.seek() || 0;
				this.howl.seek( seek - (details.seekOffset || 10) ); 
			}],
			['seekforward', (details) => {
				let seek = this.howl.seek() || 0;
				this.howl.seek( seek + (details.seekOffset || 10) );
			}],
			['seekto', (details) => { this.howl.seek( details.seekTime ); }],
			['stop', () => { this.PauseMediaFile(); }]
		];
		 
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

	UnloadMediaFile(){
		console.log('Unloading audio file', this.howl);
		if(this.howl && this.howl.unload) this.howl.unload();
	}

	// LoadMediaFile(){
	// 	this.UnloadMediaFile();
	// 	this.api.GetSong('300002556')
	// 		.then((data)=>{
	// 			this.meta = data;
	// 			this.howl = new Howl({
	// 				src: this.meta.src,
	// 				html5: true,
	// 				onplay: ()=>{
	// 					// Display the duration.
	// 					this.display.duration.innerHTML = this.formatTime(Math.round(this.howl.duration()));
	// 					// Start upating the progress of the track.
	// 					requestAnimationFrame(this.Step.bind(this));
	// 				},
	// 			});
	// 			this.artwork.style.backgroundImage = 'url('+this.meta.coverArt[0].src+')';
	// 			navigator.serviceWorker.controller.postMessage({
	// 				action: 'cache-version'
	// 			});
	// 		});
	// }

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
		this.display.title.innerText = this.meta.title;
		this.display.album.innerText = this.meta.album;
		this.display.artist.innerText = this.meta.artist;
		this.artwork.style.backgroundImage = 'url('+this.meta.coverArt[0].src+')';

		this.howl.on('end', this.meta.cb);

		this.UpdateMediaSessionApi();
		this.PlayMediaFile();
	}

	PlayMediaFile(){
		if(this.howl.playing()) return;
		this.howl.play();
		this.controls.play.style.display = 'none';
		this.controls.play.disabled = true;
		this.controls.pause.style.display = 'initial';
		this.controls.pause.disabled = false;
		if ('mediaSession' in navigator) {
			navigator.mediaSession.playbackState = "playing";
		}
	}

	PauseMediaFile(){
		if(!this.howl.playing()) return;
		this.howl.pause();
		this.controls.play.style.display = 'initial';
		this.controls.play.disabled = false;
		this.controls.pause.style.display = 'none';
		this.controls.pause.disabled = true;
		if ('mediaSession' in navigator) {
			navigator.mediaSession.playbackState = "paused";
		}
	}

	NextMediaFile(){
		document.dispatchEvent(new CustomEvent('PlaylistPlayNext', {
			detail:{}
		}));
	}

	PreviousMediaFile(){
		document.dispatchEvent(new CustomEvent('PlaylistPlayPrevious', {
			detail:{}
		}));
	}

	UpdateMediaSessionApi(){
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
			
			
		}
	}

	render(){

		this.shadowRoot.innerHTML = `
			<style>
			  ${cssData}
			</style>

			<!-- Controls -->
			<div class="display">
				<span class="title"></span>
				<br>
				<span class="album"></span>
				<br>
				<span class="artist"></span>
				<div class="timer">0:00</div>
				<div class="duration">0:00</div>
			</div>
			<div class="artwork"></div>
			<div class="controls">
				<button class="btn play" disabled>Play</button>
				<button class="btn pause" disabled>Pause</button>
				<button class="btn next">Next</button>
				<button class="btn previous">Previous</button>
				<!-- Progress -->
				<input class="range scrubber" type="range" min="0" max="100" value="0">
				<!-- Volume -->
			</div>
		`;

		this.controls = {
			play: this.shadowRoot.querySelector('.btn.play'),
			pause: this.shadowRoot.querySelector('.btn.pause'),
			next: this.shadowRoot.querySelector('.btn.next'),
			previous: this.shadowRoot.querySelector('.btn.previous'),
			scrubber: this.shadowRoot.querySelector('.range.scrubber')
		};
		this.display = {
			title: this.shadowRoot.querySelector('.display .title'),
			album: this.shadowRoot.querySelector('.display .album'),
			artist: this.shadowRoot.querySelector('.display .artist'),
			timer: this.shadowRoot.querySelector('.display .timer'),
			duration: this.shadowRoot.querySelector('.display .duration')
		}
		this.artwork = this.shadowRoot.querySelector('.artwork');

		this.SetControls();
	}

	SetControls(){

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
});