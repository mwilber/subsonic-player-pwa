import { ApiSubsonic } from '../../api-subsonic';

import cssData from './media-search.css';

window.customElements.define('media-search', class extends HTMLElement {

	constructor(node, mediaPlayer){
		super();
		
		this.api = new ApiSubsonic();
		this.resultsElement = null;
		this.listing = null;

		let shadowRoot = this.attachShadow({mode: 'open'});
	}

	async connectedCallback() {
		this.render();
	}

	async LoadListing(query){
		this.listing = await this.api.GetSearch2(query);
		if(!this.listing) return;
		
		// Creates a new list item
		let CreateListItem = function({id, title}){
			let item = document.createElement('li');
			let button = document.createElement('button');
			button.dataset.id = id;
			button.dataset.type = 'album';
			button.innerText = title;
			
			item.appendChild(button);
			return item;
		};

		// Clear out the list
		while (this.resultsElement.firstChild) {
			this.resultsElement.removeChild(this.resultsElement.firstChild);
		}

		// Add Albums
		if(this.listing.albums)
			this.listing.albums.forEach((album)=>{
				let item = CreateListItem(album);
				if(item) this.resultsElement.appendChild(item);
			});
		// Add Songs
		if(this.listing.songs)
			this.listing.songs.forEach((album)=>{
				let item = CreateListItem(album);
				if(item) this.resultsElement.appendChild(item);
			});
	}

	render(){

		this.shadowRoot.innerHTML = `
			<style>
				${cssData}
			</style>

			<input type="text" name="query" placeholder="Search" value="Ten" />
			<button class="search">Go</button>
			<ul></ul>
		`;

		this.resultsElement = this.shadowRoot.querySelector('ul');
		this.shadowRoot.querySelector('button.search').addEventListener('click', (evt) => {
			let query = this.shadowRoot.querySelector('input[name="query"]');
			if(!query) return;
			this.LoadListing(query.value);
		});

	}

});