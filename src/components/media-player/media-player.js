import {Howl, Howler} from 'howler';
import { ApiSubsonic } from '../../api-subsonic';
import NoSleep from 'nosleep.js';

import cssData from './media-player.css';

window.customElements.define('media-player', class extends HTMLElement {
	constructor(node, api){
		super();

		this.noSleep = new NoSleep();
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
			this.dataset.minimized = '';
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
		if (document.activeElement != this.controls.scrubber){
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

	PlaySongObject(song, cb){
		this.UnloadMediaFile();
		this.meta = song;
        console.log("🚀 ~ file: media-player.js ~ line 113 ~ extends ~ PlaySongObject ~ this.meta", this.meta)
		this.meta.cb = cb;
		this.howl = new Howl({
			src: this.meta.src,
			html5: true,
			onplay: ()=>{
				// Enable wake lock
				this.noSleep.enable();
				// Display the duration.
				this.display.duration.innerHTML = this.formatTime(Math.round(this.howl.duration()));
				// Update the media session api
				if ('mediaSession' in navigator) {
					navigator.mediaSession.playbackState = "playing";
				}
				// Start upating the progress of the track.
				requestAnimationFrame(this.Step.bind(this));
			},
			onpause: ()=>{
				// Disable wake lock
				this.noSleep.disable();
				// Update the media session api
				if ('mediaSession' in navigator) {
					navigator.mediaSession.playbackState = "paused";
				}
			},
			onstop: ()=>{
				// Disable wake lock
				this.noSleep.disable();
				// Update the media session api
				if ('mediaSession' in navigator) {
					navigator.mediaSession.playbackState = "none";
				}
			},
			onend: ()=>{
				// Disable wake lock
				this.noSleep.disable();
				// Update the media session api
				if ('mediaSession' in navigator) {
					navigator.mediaSession.playbackState = "none";
				}
			}
		});
		this.display.title.innerText = this.meta.title;
		this.display.album.innerText = this.meta.album;
		this.display.album.dataset.id = this.meta.albumId;
		this.display.artist.innerText = this.meta.artist;
		this.display.artist.dataset.id = this.meta.artistId;
		this.style.backgroundImage = 'url('+this.meta.coverArt[0].src+')';
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
	}

	PauseMediaFile(){
		if(!this.howl.playing()) return;
		this.howl.pause();
		this.controls.play.style.display = 'initial';
		this.controls.play.disabled = false;
		this.controls.pause.style.display = 'none';
		this.controls.pause.disabled = true;
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

		let miniInterface = `
			<div class="controls">
				<button class="btn previous">
					<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="fast-backward" class="svg-inline--fa fa-fast-backward fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M0 436V76c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v151.9L235.5 71.4C256.1 54.3 288 68.6 288 96v131.9L459.5 71.4C480.1 54.3 512 68.6 512 96v320c0 27.4-31.9 41.7-52.5 24.6L288 285.3V416c0 27.4-31.9 41.7-52.5 24.6L64 285.3V436c0 6.6-5.4 12-12 12H12c-6.6 0-12-5.4-12-12z"></path></svg>
				</button>
				<button class="btn reverse">
					<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="backward" class="svg-inline--fa fa-backward fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M11.5 280.6l192 160c20.6 17.2 52.5 2.8 52.5-24.6V96c0-27.4-31.9-41.8-52.5-24.6l-192 160c-15.3 12.8-15.3 36.4 0 49.2zm256 0l192 160c20.6 17.2 52.5 2.8 52.5-24.6V96c0-27.4-31.9-41.8-52.5-24.6l-192 160c-15.3 12.8-15.3 36.4 0 49.2z"></path></svg>
				</button>
				<button class="btn play" disabled>
					<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="play" class="svg-inline--fa fa-play fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"></path></svg>
				</button>
				<button class="btn pause" style="display:none;" disabled>
					<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="pause" class="svg-inline--fa fa-pause fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M144 479H48c-26.5 0-48-21.5-48-48V79c0-26.5 21.5-48 48-48h96c26.5 0 48 21.5 48 48v352c0 26.5-21.5 48-48 48zm304-48V79c0-26.5-21.5-48-48-48h-96c-26.5 0-48 21.5-48 48v352c0 26.5 21.5 48 48 48h96c26.5 0 48-21.5 48-48z"></path></svg>
				</button>
				<button class="btn forward">
					<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="forward" class="svg-inline--fa fa-forward fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M500.5 231.4l-192-160C287.9 54.3 256 68.6 256 96v320c0 27.4 31.9 41.8 52.5 24.6l192-160c15.3-12.8 15.3-36.4 0-49.2zm-256 0l-192-160C31.9 54.3 0 68.6 0 96v320c0 27.4 31.9 41.8 52.5 24.6l192-160c15.3-12.8 15.3-36.4 0-49.2z"></path></svg>
				</button>
				<button class="btn next">
					<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="fast-forward" class="svg-inline--fa fa-fast-forward fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M512 76v360c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12V284.1L276.5 440.6c-20.6 17.2-52.5 2.8-52.5-24.6V284.1L52.5 440.6C31.9 457.8 0 443.4 0 416V96c0-27.4 31.9-41.7 52.5-24.6L224 226.8V96c0-27.4 31.9-41.7 52.5-24.6L448 226.8V76c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12z"></path></svg>
				</button>
				<input class="range volume" type="range" min="0" max="100" value="0">
				<!-- Progress -->
				<div class="display">
					<div class="timer">0:00</div>
					<div class="duration">0:00</div>
				</div>
				<input class="range scrubber" type="range" min="0" max="100" value="0">
				<!-- Volume -->
			</div>
		`;

		this.shadowRoot.innerHTML = `
			<style>
			  ${cssData}
			</style>
			<div class="shade">
				<!-- Controls -->
				<button class="minimize">
					<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="chevron-up" class="svg-inline--fa fa-chevron-up fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M240.971 130.524l194.343 194.343c9.373 9.373 9.373 24.569 0 33.941l-22.667 22.667c-9.357 9.357-24.522 9.375-33.901.04L224 227.495 69.255 381.516c-9.379 9.335-24.544 9.317-33.901-.04l-22.667-22.667c-9.373-9.373-9.373-24.569 0-33.941L207.03 130.525c9.372-9.373 24.568-9.373 33.941-.001z"></path></svg>
				</button>
				<div class="display">
					<div class="artwork"></div>
					<div class="meta">
						<span class="title"></span>
						<br>
						<strong class="album"></strong>
						<br>
						<em class="artist"></em>
					</div>
				</div>
				${miniInterface}
			</div>
		`;

		this.controls = {
			play: this.shadowRoot.querySelector('.btn.play'),
			pause: this.shadowRoot.querySelector('.btn.pause'),
			next: this.shadowRoot.querySelector('.btn.next'),
			previous: this.shadowRoot.querySelector('.btn.previous'),
			forward: this.shadowRoot.querySelector('.btn.forward'),
			reverse: this.shadowRoot.querySelector('.btn.reverse'),
			scrubber: this.shadowRoot.querySelector('.range.scrubber'),
			volume: this.shadowRoot.querySelector('.range.volume'),
			minimize: this.shadowRoot.querySelector('.minimize')
		};
		this.display = {
			title: this.shadowRoot.querySelector('.meta .title'),
			album: this.shadowRoot.querySelector('.meta .album'),
			artist: this.shadowRoot.querySelector('.meta .artist'),
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
			if(this.howl) this.howl.seek( duration * (this.controls.scrubber.value / 100) );
		});

		this.controls.volume.addEventListener('change', (evt)=>{
			console.log('setting volume to',this.controls.volume.value);
			if(this.howl) this.howl.volume( this.controls.volume.value / 100 );
		});

		this.controls.forward.addEventListener('click', () => { 
			let seek = this.howl.seek() || 0;
			if(this.howl) this.howl.seek( seek + 10 ); 
		});

		this.controls.reverse.addEventListener('click', () => { 
			let seek = this.howl.seek() || 0;
			if(this.howl) this.howl.seek( seek - 10 ); 
		});

		this.controls.minimize.addEventListener('click', (evt)=>{
			//document.gzNavigator.SetSlot();
			console.log('minimize', this.dataset.minimized);
			this.dataset.minimized = ( this.dataset.minimized ) ? '' : 'true';
		});

		this.display.album.addEventListener('click', (evt)=>{
			document.dispatchEvent(new CustomEvent('PlaylistLoadListing', {
				detail:{
					id: evt.target.dataset.id,
					type: 'album',
				}
			}));
		});
	}
});