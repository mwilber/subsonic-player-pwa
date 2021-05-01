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
			// Clear out the contents 
			this.shadowRoot.innerHTML = ``;
			// Grab the template
			let templateContent = document.querySelector('template').content;
			// Inject the template into the body
			document.body.appendChild(templateContent.cloneNode(true))
		}else{
			this.shadowRoot.innerHTML = `
				<style>
					${cssData}
				</style>
	
				<div class="login-form">
					<h2>Subsonic Login</h2>
					<input id="server" type="text" placeholder="Server Address"/>
					<input id="user" type="text" placeholder="Username"/>
					<input id="pass" type="text" placeholder="Password"/>
					<button class="login">Login</button>
				</div>
			`;

			this.shadowRoot.querySelector('button.login').addEventListener('click', ()=>{
				let server = this.shadowRoot.getElementById('server');
				let user = this.shadowRoot.getElementById('user');
				let pass = this.shadowRoot.getElementById('pass');
				if(server.value) localStorage['server'] = server.value;
				if(user.value) localStorage['user'] = user.value;
				if(pass.value) localStorage['pass'] = pass.value;
				this.render();
			});
		} 

	}
});