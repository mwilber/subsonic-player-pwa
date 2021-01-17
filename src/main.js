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

import { MediaPlayer } from './components/media-player/media-player';
import { ApiSubsonic } from './api-subsonic';
//import { MediaCache } from './media-cache';
import './components/media-player/media-player';
import './components/media-listing/media-listing';
import './components/playlist-listing/playlist-listing';

//let mediaPlayer = new MediaPlayer(document.querySelector('.media-player'), new ApiSubsonic());
//let mediaCache = new MediaCache();
//let mediaListing = new MediaListing(document.querySelector('.playlist'), mediaPlayer);

navigator.serviceWorker.addEventListener('message', event => {
	if( event.data.type && event.data.type == 'cache-version')
		document.getElementById('cache-version').innerText = event.data.msg;
});

// let mediaListing = document.querySelector('media-listing');
// mediaListing.dataset.type = 'playlist';
// mediaListing.dataset.id = '800000013'

document.getElementById('server').value = localStorage['server'];
document.getElementById('user').value = localStorage['user'];
document.getElementById('pass').value = localStorage['pass'];

document.querySelector('button.login').addEventListener('click', ()=>{
	if(!localStorage['server'])
		localStorage['server'] = document.getElementById('server').value;
	if(!localStorage['user'])
		localStorage['user'] = document.getElementById('user').value;
	if(!localStorage['pass'])
		localStorage['pass'] = document.getElementById('pass').value;

	document.querySelector('playlist-listing').LoadListing();
});


// let playlist = null;
// let playlistIdx = 0;

// api.GetPlaylist('800000013').then((data)=>{
// 	mediaListing.SetListing(data);

// 	let cacheBtn = document.querySelector('.playlist button.cache');
// 	cacheBtn.addEventListener('click', (evt)=>{ mediaCache.CachePlaylist(data); });
// });

// document.querySelector('.btn.next').addEventListener('click', (evt)=>{
// 	// playlistIdx++;
// 	// if( playlistIdx >= playlist.songs.length ) playlistIdx = 0;
// 	// mediaPlayer.PlaySongObject(playlist.songs[playlistIdx]);
// 	mediaListing.PlayNextIndex();
// });

// document.querySelector('.btn.previous').addEventListener('click', (evt)=>{
// 	// playlistIdx--;
// 	// if( playlistIdx < 0 ) playlistIdx = playlist.songs.length - 1;
// 	// mediaPlayer.PlaySongObject(playlist.songs[playlistIdx]);
// 	mediaListing.PlayPreviousIndex();
// });

