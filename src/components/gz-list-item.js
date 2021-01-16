//import cssData from './gz-if.css';

window.customElements.define('gz-list-item', class extends HTMLElement {

	constructor(){
		super();

		let shadowRoot = this.attachShadow({mode: 'open'});

		this.mediaCacheName = 'media_v0.8';
		this.cached = false;
	}

	// get dataBind() {
	//   return this.getAttribute('databind');
	// }
	// set dataBind(newValue) {
	//   this.setAttribute('databind', newValue);
	//   this.render();
	// }

	static get observedAttributes() {
		return ['data-index', 'data-title'];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		switch(name){
			case 'data-index':
				this.index = parseInt(newValue);
				break;
			case 'data-title':
				console.log('data title changed')
				this.render();
			default:
				break;
		}
	}

	async connectedCallback() {
		if(await this.IsCached() === true){
			this.cached = true;
		}
		this.render();
	}

	disconnectedCallback(){

	}

	async IsCached(){
		let {url} = this.dataset;
		if(!url) return null;
		let cache = await caches.open(this.mediaCacheName);
		let match = await cache.match(url);
		if(match && match.body){
			return true;
		}else{
			return false;
		}
	}

	PlayTrack(){
		document.dispatchEvent(new CustomEvent('PlaylistPlayIndex', {
			detail:{
				index: this.index,
			}
		}));
	}
	
	render(){
		let {title} = this.dataset;
		let cacheStatus = '';

		if(this.cached) cacheStatus = `
			<span>cached</span>
		`;

		this.shadowRoot.innerHTML = `
			<button>${title}</button> ${cacheStatus}
		`;

		this.shadowRoot.querySelector('button').addEventListener('click', (evt)=>this.PlayTrack());
	}
	// render(){

	//   this.shadowRoot.innerHTML = `
	//     <style>
	//       ${cssData}
	//     </style>
			
	//     <slot name="${slotName}"></slot>
	//   `;
	// }
});