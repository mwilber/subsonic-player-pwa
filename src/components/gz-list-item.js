//import cssData from './gz-if.css';

window.customElements.define('gz-list-item', class extends HTMLElement {

	constructor(){
		super();

		let shadowRoot = this.attachShadow({mode: 'open'});

		this.render();
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
				this.render();
			default:
				break;
		}
	}

	PlayTrack(){
		document.dispatchEvent(new CustomEvent('PlaylistPlayIndex', {
			detail:{
				index: this.index,
			}
		}));
	}

	connectedCallback() {
		
	}

	disconnectedCallback(){

	}
	
	render(){
		let {title} = this.dataset;

		this.shadowRoot.innerHTML = `
			<button>${title}</button>
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