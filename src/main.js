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
//import './serviceWorkerRegistration';

// Load application styles
import '../styles/main.scss';

// import {Howl, Howler} from 'howler';

import { MediaPlayer } from './media-player';

let mediaPlayer = new MediaPlayer(document.querySelector('.media-player'));

// var localsound = new Howl({
// 	src: ['assets/music/uncrowned.mp3']
// });
// var remotesound = new Howl({
// 	src: ['http://music.mwilber.com/rest/download.view?u=mwilber&p=d4rkw4rr!0r&v=1.12.0&c=myapp&id=300002162'],
// 	html5: true
// });


// let playLocalBtn = document.getElementById('playlocal');
// let playRemoteBtn = document.getElementById('playremote');

// playLocalBtn.addEventListener('click', (evt)=>{
// 	console.log('clicked');
// 	localsound.play();
// });

// playRemoteBtn.addEventListener('click', (evt)=>{
// 	console.log('clicked');
// 	remotesound.play();
// });

