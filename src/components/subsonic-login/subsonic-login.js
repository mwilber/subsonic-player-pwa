import cssData from './subsonic-login.css';

window.customElements.define('subsonic-login', class extends HTMLElement {
	
	constructor(){
		super();

		this.activeSlot = "";

		let shadowRoot = this.attachShadow({mode: 'open'});
	}

	connectedCallback() {
		this.render();
	}

	render(){
		if(localStorage['server'] && localStorage['user'] && localStorage['pass']){
			//this.shadowRoot.innerHTML = `<slot></slot>`;
			let templateContent = document.querySelector('template').content;
			document.querySelector('.container').appendChild(
				templateContent.cloneNode(true))
		}else{
			this.shadowRoot.innerHTML = `
				<style>
					${cssData}
				</style>
	
				<div class="login-form">
					<input id="server" type="text" placeholder="server"/>
					<input id="user" type="text" placeholder="user"/>
					<input id="pass" type="text" placeholder="pass"/>
					<button class="login">Login</button>
				</div>
			`;

			this.shadowRoot.querySelector('button.login').addEventListener('click', ()=>{
				localStorage['server'] = this.shadowRoot.getElementById('server').value;
				localStorage['user'] = this.shadowRoot.getElementById('user').value;
				localStorage['pass'] = this.shadowRoot.getElementById('pass').value;
				this.render();
			});
		} 

	}
});