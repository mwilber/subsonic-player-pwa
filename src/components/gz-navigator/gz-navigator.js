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

			</style>

			<button id="player">Player</button>
			<button id="default">Default</button>

			<slot name="${slotName}"></slot>
		`;

		this.shadowRoot.getElementById('player').addEventListener('click', ()=>{
			document.gzNavigator.SetSlot('player');
		});

		this.shadowRoot.getElementById('default').addEventListener('click', ()=>{
			document.gzNavigator.SetSlot('default');
		});
	}
});