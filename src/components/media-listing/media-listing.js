
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
		// this.mediaPlayer = mediaPlayer;
		// this.node = node;
		// this.listing = {
		// 	name: '',
		// 	songs: []
		// };
		// this.idx = 0;

		// this.controls = {
		// 	// load: node.querySelector('.btn.load'),
		// 	play: node.querySelector('.play-playlist')
		// 	// pause: node.querySelector('.btn.pause')
		// };
		// this.display = {
		// 	title: node.querySelector('h2'),
		// 	list: node.querySelector('ul')
		// }

		// this.SetControls();

		// this.mediaPlayer.NextMediaFile = this.PlayNextIndex.bind(this);
		// this.mediaPlayer.PreviousMediaFile = this.PlayPreviousIndex.bind(this);

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
		let {id, type} = this.dataset;
		if(!id || !type) return;
		console.log('<media-listing>', 'LoadListing', id, type);
		switch(type){
			case 'playlist':
				let data = await this.api.GetPlaylist(id);
				this.SetListing(data);
				// api.GetPlaylist('800000013').then((data)=>{
				// 	mediaListing.SetListing(data);

				// 	let cacheBtn = document.querySelector('.playlist button.cache');
				// 	cacheBtn.addEventListener('click', (evt)=>{ mediaCache.CachePlaylist(data); });
				// });
				break;
			default:
				break;
		}
	}

	SetListing(listing){
		if(!listing.songs || !listing.songs.length) return;
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

	render(){
		let title = this.listing.name;
		let list = "";

		this.listing.songs.forEach((song, idx)=>{
			// let songBtn = document.createElement('button');
			// //songBtn.song = song;
			// songBtn.dataset.index = idx;
			// songBtn.innerText = song.title + ' [' + song.album + ']';
			// songBtn.addEventListener('click',(evt)=>{
			// 	//console.log(evt.target.song);
			// 	//this.mediaPlayer.PlaySongObject(evt.target.song);
			// 	this.PlayIndex(evt.target.dataset.index);
			// });
	
			// let listElement = document.createElement('li');
			// listElement.appendChild(songBtn);
			// this.display.list.appendChild(listElement);
			// let listItem = document.createElement('gz-list-item');
			// listItem.dataset.index = idx;
			// listItem.dataset.title = song.title + ' [' + song.album + ']';
			// listItem.dataset.url = song.src;
			// let listElement = document.createElement('li');
			// listElement.appendChild(listItem);
			let songTitle = song.title + ' [' + song.album + ']';
			let songUrl = song.src;
			list += `
				<li>
					<media-list-item
						data-index="${idx}"
						data-title="${songTitle}"
						data-url="${songUrl}"
					>
					</media-list-item>
				</li>
			`;
			//this.display.list.appendChild(listElement);

		});

		this.shadowRoot.innerHTML = `
			<style>
			  ${cssData}
			</style>

			<h2>${title}</h2>
			<button class="cache">Cache</button>
			<button class="play-playlist">PL Play</button>
			<button class="shuffle">Shuffle</button>
			<ul>${list}</ul>
		`;
		
		this.shadowRoot.querySelector('button.play-playlist').addEventListener('click', (evt)=>{
			this.PlayIndex(0);
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