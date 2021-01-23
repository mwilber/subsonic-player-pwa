import { ApiSubsonic } from '../../api-subsonic';

import cssData from './playlist-listing.css';

window.customElements.define('playlist-listing', class extends HTMLElement {

	constructor(node, mediaPlayer){
		super();
		
		this.api = new ApiSubsonic();

		let shadowRoot = this.attachShadow({mode: 'open'});
	}

	async connectedCallback() {
		this.LoadListing();
	}

	async LoadListing(){
		this.listing = await this.api.GetPlaylists();
		console.log("🚀 ~ file: playlist-listing.js ~ line 19 ~ extends ~ LoadListing", this.listing)
		this.render();
	}

	render(){
		let list = "";

		this.shadowRoot.innerHTML = `
			<style>
				${cssData}
			</style>
			<ul></ul>
		`;

		let listElem = this.shadowRoot.querySelector('ul');

		this.listing.forEach((playlist, idx)=>{
			let {id, name, songCount} = playlist;
			if(songCount == 0) return;

			//let liElem = document.createElement('li');
			let button = document.createElement('button');

			button.innerText = name;
			button.dataset.id = id;
			button.addEventListener('click', (evt)=>{
				let mediaListing = document.querySelector('media-listing');
				if(!mediaListing) return;
				mediaListing.dataset.type = 'playlist';
				mediaListing.dataset.id = id;
			});
			//liElem.appendChild(button);

			listElem.appendChild(button);

		});
	}

});