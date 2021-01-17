//import cssData from './gz-if.css';

window.customElements.define('gz-list-item', class extends HTMLElement {

	constructor(){
		super();

		let shadowRoot = this.attachShadow({mode: 'open'});
	}

	static get observedAttributes() {
		return ['data-type', 'data-id'];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		switch(name){
			case 'data-type':
				this.index = parseInt(newValue);
				break;
			case 'data-id':
                this.render();
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
	
	render(){
		this.shadowRoot.innerHTML = `
			<ul><slot></slot></ul>
		`;

	}
});