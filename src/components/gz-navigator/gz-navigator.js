import cssData from './gz-navigator.css';

window.customElements.define('gz-navigator', class extends HTMLElement {
	
	constructor(){
		super();

		this.activeSlot = "";

		// Add navigation functions to the document
		document['gzNavigator'] = {
			SetSlot: function(slotName){
					this.activeSlot = slotName || '';
					this.render();
				}.bind(this)
		};

		let shadowRoot = this.attachShadow({mode: 'open'});
	}

	connectedCallback() {
		this.render();
	}

	static get observedAttributes() {
		return ['data-slot'];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		switch(name){
			case 'data-slot':
				this.activeSlot = newValue || '';
				this.render();
				break;
			default:
				break;
		}
	}

	render(){
		let slotName = this.activeSlot || 'default';
		this.shadowRoot.innerHTML = `
			<style>
				${cssData}
			</style>

			<div class="nav-bar">
				<button id="options">Options</button>
				<button id="default">Default</button>
			</div>

			<slot name="${slotName}"></slot>
		`;

		this.shadowRoot.getElementById('options').addEventListener('click', ()=>{
			document.gzNavigator.SetSlot('options');
		});

		this.shadowRoot.getElementById('default').addEventListener('click', ()=>{
			document.gzNavigator.SetSlot('default');
		});
	}
});