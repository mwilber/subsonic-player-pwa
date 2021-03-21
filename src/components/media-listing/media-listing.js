
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
		localStorage.setItem('mediaListing', JSON.stringify({id: id, type: type}))
	}

	ClearListing(){
		this.listing = {
			name: '...',
			songs: []
		};
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
				<button class="back">&lt;</button>
				<button class="cache">Cache</button>
				<button class="play-playlist">PL Play</button>
				<button class="shuffle">Shuffle</button>
			</div>
			<ul>${list}</ul>
		`;
		
		this.shadowRoot.querySelector('button.play-playlist').addEventListener('click', (evt)=>{
			this.PlayIndex(0);
		});

		this.shadowRoot.querySelector('button.back').addEventListener('click', (evt)=>{
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