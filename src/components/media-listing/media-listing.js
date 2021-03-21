
import { ApiSubsonic } from '../../api-subsonic';
import { MediaCache } from '../../media-cache';
import '../media-list-item/media-list-item';

import cssData from './media-listing.css';

window.customElements.define('media-listing', class extends HTMLElement {

	constructor(node, mediaPlayer){
		super();

		this.api = new ApiSubsonic();
		this.mediaCache = new MediaCache();
		let shadowRoot = this.attachShadow({mode: 'open'});

		document.addEventListener('PlaylistPlayIndex',(evt)=>{
			console.log('PlaylistPlayIndex', evt);
			let {index} = evt.detail;
			if(!isNaN(index)) this.PlayIndex(index);
		});

		document.addEventListener('PlaylistPlayNext',(evt)=>{
			this.PlayNextIndex();
		});
		document.addEventListener('PlaylistPlayPrevious',(evt)=>{
			this.PlayPreviousIndex();
		});
		document.addEventListener('PlaylistLoadListing',(evt)=>{
			this.dataset.id = '';
			this.dataset.type = evt.detail.type;
			this.dataset.id = evt.detail.id;
			document.gzNavigator.SetSlot();
		});

	}

	static get observedAttributes() {
		return ['data-type', 'data-id'];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		switch(name){
			case 'data-type':
			case 'data-id':
				this.LoadListing();
				break;
			default:
				break;
		}
	}

	async LoadListing(){
		this.ClearListing();
		this.render();
		let {id, type} = this.dataset;
		if(!id || !type) return;
		console.log('<media-listing>', 'LoadListing', id, type);
		let data;
		switch(type){
			case 'playlist':
				data = await this.api.GetPlaylist(id);
				this.SetListing(data);
				break;
			case 'album':
				data = await this.api.GetAlbum(id);
				this.SetListing(data);
				break;
			default:
				break;
		}
		localStorage.setItem('mediaListing', JSON.stringify({id: id, type: type}));
	}

	ClearListing(){
		this.listing = {
			name: '...',
			songs: []
		};
		localStorage.removeItem('mediaListing');
	}

	SetListing(listing){
		if(!listing || !listing.songs || !listing.songs.length) return;
		this.listing = {
			name: (listing.name || ""),
			songs: listing.songs.slice()
		};
		this.render();
	}

	ShuffleListing(){
		/* Shuffle the playlist using Durstenfeld algorithm */
		console.log('before', JSON.stringify(this.listing));
		for (let i = this.listing.songs.length - 1; i > 0; i--) {
			let j = Math.floor(Math.random() * (i + 1));
			let temp = this.listing.songs[i];
			this.listing.songs[i] = this.listing.songs[j];
			this.listing.songs[j] = temp;
		}
		console.log('after', JSON.stringify(this.listing));
	}

	SortListing(method){
		//TODO: fill this with sorty goodness
	}

	async render(){
		// Display this media listing
		this.classList.add('active');

		let title = this.listing.name;
		let list = "";

		for( let idx=0; idx<this.listing.songs.length; idx++ ){
			let song = this.listing.songs[idx];
			let songTitle = song.title + ' [' + song.album + ']';
			let songUrl = song.src;
			let songCached = (await this.mediaCache.IsCached(song.src)) ? 'true' : 'false';
			list += `
				<li>
					<media-list-item
						data-index="${idx}"
						data-title="${songTitle}"
						data-url="${songUrl}"
						data-cached="${songCached}"
					>
					</media-list-item>
				</li>
			`;
		}

		this.shadowRoot.innerHTML = `
			<style>
			  ${cssData}
			</style>

			<h2>${title}</h2>
			<div class="controls">
				<button class="back">
					<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="chevron-left" class="svg-inline--fa fa-chevron-left fa-w-10" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path fill="currentColor" d="M34.52 239.03L228.87 44.69c9.37-9.37 24.57-9.37 33.94 0l22.67 22.67c9.36 9.36 9.37 24.52.04 33.9L131.49 256l154.02 154.75c9.34 9.38 9.32 24.54-.04 33.9l-22.67 22.67c-9.37 9.37-24.57 9.37-33.94 0L34.52 272.97c-9.37-9.37-9.37-24.57 0-33.94z"></path></svg>
				</button>
				<button class="cache">
					<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="cloud-download-alt" class="svg-inline--fa fa-cloud-download-alt fa-w-20" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M537.6 226.6c4.1-10.7 6.4-22.4 6.4-34.6 0-53-43-96-96-96-19.7 0-38.1 6-53.3 16.2C367 64.2 315.3 32 256 32c-88.4 0-160 71.6-160 160 0 2.7.1 5.4.2 8.1C40.2 219.8 0 273.2 0 336c0 79.5 64.5 144 144 144h368c70.7 0 128-57.3 128-128 0-61.9-44-113.6-102.4-125.4zm-132.9 88.7L299.3 420.7c-6.2 6.2-16.4 6.2-22.6 0L171.3 315.3c-10.1-10.1-2.9-27.3 11.3-27.3H248V176c0-8.8 7.2-16 16-16h48c8.8 0 16 7.2 16 16v112h65.4c14.2 0 21.4 17.2 11.3 27.3z"></path></svg>
				</button>
				<button class="play-playlist">
					<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="play" class="svg-inline--fa fa-play fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"></path></svg>
				</button>
				<button class="shuffle">
					<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="random" class="svg-inline--fa fa-random fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M504.971 359.029c9.373 9.373 9.373 24.569 0 33.941l-80 79.984c-15.01 15.01-40.971 4.49-40.971-16.971V416h-58.785a12.004 12.004 0 0 1-8.773-3.812l-70.556-75.596 53.333-57.143L352 336h32v-39.981c0-21.438 25.943-31.998 40.971-16.971l80 79.981zM12 176h84l52.781 56.551 53.333-57.143-70.556-75.596A11.999 11.999 0 0 0 122.785 96H12c-6.627 0-12 5.373-12 12v56c0 6.627 5.373 12 12 12zm372 0v39.984c0 21.46 25.961 31.98 40.971 16.971l80-79.984c9.373-9.373 9.373-24.569 0-33.941l-80-79.981C409.943 24.021 384 34.582 384 56.019V96h-58.785a12.004 12.004 0 0 0-8.773 3.812L96 336H12c-6.627 0-12 5.373-12 12v56c0 6.627 5.373 12 12 12h110.785c3.326 0 6.503-1.381 8.773-3.812L352 176h32z"></path></svg>
				</button>
			</div>
			<ul>${list}</ul>
		`;
		
		this.shadowRoot.querySelector('button.play-playlist').addEventListener('click', (evt)=>{
			this.PlayIndex(0);
		});

		this.shadowRoot.querySelector('button.back').addEventListener('click', (evt)=>{
			this.ClearListing();
			this.classList.remove('active');
		});

		this.shadowRoot.querySelector('button.cache').addEventListener('click', (evt)=>{
			this.mediaCache.CachePlaylist(this.listing);
		});

		this.shadowRoot.querySelector('button.shuffle').addEventListener('click', (evt)=>{
			this.ShuffleListing();
			this.render();
		});
	}

	PlayIndex(index){
		if(typeof index !== 'number') this.idx = parseInt(index);
		else this.idx = index;
		document.dispatchEvent(new CustomEvent('PlaySongObject', {
			detail:{
				song: this.listing.songs[this.idx],
				cb: this.PlayNextIndex.bind(this)
			}
		}));
	}

	PlayNextIndex(){
		this.PlayIndex(this.idx + 1);
	}

	PlayPreviousIndex(){
		this.PlayIndex(this.idx - 1);
	}

});