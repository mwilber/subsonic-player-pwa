import cssData from './media-list-item.css';

window.customElements.define('media-list-item', class extends HTMLElement {

	constructor(){
		super();

		let shadowRoot = this.attachShadow({mode: 'open'});
		this.cached = false;
	}

	static get observedAttributes() {
		return ['data-index', 'data-cached'];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		switch(name){
			case 'data-index':
				this.index = parseInt(newValue);
				break;
			case 'data-cached':
				this.cached = (newValue === "true") ? true : false;
				break;
			default:
				break;
		}
	}

	connectedCallback() {
		this.render();
	}

	disconnectedCallback(){

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
			<style>
			  ${cssData}
			</style>

			<button>${title}</button> ${cacheStatus}
		`;

		this.shadowRoot.querySelector('button').addEventListener('click', (evt)=>this.PlayTrack());
	}
});