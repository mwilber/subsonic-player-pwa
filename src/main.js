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

// import {Howl, Howler} from 'howler';

import { MediaPlayer } from './media-player';
import { ApiSubsonic } from './api-subsonic';

let api = new ApiSubsonic();
let mediaPlayer = new MediaPlayer(document.querySelector('.media-player'), api);

api.GetPlaylist().then((data)=>{
	console.log("🚀 ~ file: main.js ~ line 28 ~ api.GetPlaylist ~ data", data)
	let playlist = data;
	let playlistElement = document.querySelector('.playlist ul');
	document.querySelector('.playlist h2').innerHTML = playlist.name;
	playlist.songs.forEach((song)=>{
		let songBtn = document.createElement('button');
		songBtn.song = song;
		songBtn.innerText = song.title;
		songBtn.addEventListener('click',(evt)=>{
			console.log(evt.target.song);
			mediaPlayer.PlaySongObject(evt.target.song);
		});

		let listElement = document.createElement('li');
		listElement.appendChild(songBtn);
		playlistElement.appendChild(listElement);
	});
});