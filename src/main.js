/**
 * Application entry point
 */

/**
 * Import PWA helper files
 * 
 * These file are optional. app-shell.css will not be packed into the js bundle and is linked 
 * separately in index.html. Use for initial styling to be displayed as JavaScripts load. serviceWorkerRegistration 
 * contains registration code for service-worker.js For more information on service workers and Progressive Web Apps 
 * check out the GreenZeta 10 minute PWA example at https://github.com/mwilber/gz-10-minute-pwa
 */ 
import '../app-shell.css';
import './serviceWorkerRegistration';

// Load application styles
import '../styles/main.scss';

// Load web components
import './components/gz-navigator/gz-navigator';
import './components/media-player/media-player';
import './components/media-listing/media-listing';
import './components/playlist-listing/playlist-listing';

navigator.serviceWorker.addEventListener('message', event => {
	if( event.data.type ){
		switch( event.data.type ){
			case 'cache-version':
				document.getElementById('cache-version').innerText = event.data.msg;
				break;
			case 'cache-status':
				let {version, mediaCount, dynamicCount, staticCount} = event.data.msg;
				document.getElementById('cache-version').innerText = version;
				let cacheStatus = document.querySelector('.cache-status');
				let cacheList = `
					<ul>
						<li>Media: ${mediaCount} requests</li>
						<li>Dynamic: ${dynamicCount} requests</li>
						<li>Static: ${staticCount} requests</li>
					</ul>
				`;
				cacheStatus.innerHTML = cacheList;
				break;
			default:
				break;
		}
	}
});

if ('serviceWorker' in navigator) {
	navigator.serviceWorker.ready
	.then(function(registration) {
		console.log('A service worker is active:', registration.active);

		navigator.serviceWorker.controller.postMessage({
			action: 'cache-status'
		});
	});
} else {
	console.log('Service workers are not supported.');
}

///////////////////////////////////////////////
// Auto load test playlist - REMOVE THIS LATER
///////////////////////////////////////////////
let mediaListing = document.querySelector('media-listing');
// mediaListing.dataset.type = 'playlist';
// mediaListing.dataset.id = '800000013';
mediaListing.dataset.type = 'album';
mediaListing.dataset.id = '200000540';
///////////////////////////////////////////////

document.getElementById('server').value = localStorage['server'];
document.getElementById('user').value = localStorage['user'];
document.getElementById('pass').value = localStorage['pass'];

document.querySelector('button.login').addEventListener('click', ()=>{
	localStorage['server'] = document.getElementById('server').value;
	localStorage['user'] = document.getElementById('user').value;
	localStorage['pass'] = document.getElementById('pass').value;

	document.querySelector('playlist-listing').LoadListing();
});