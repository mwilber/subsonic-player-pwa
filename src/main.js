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
import { ApiSubsonic } from './api-subsonic';
import { MediaCache } from './media-cache';
import { MediaListing } from './media-listing';

let api = new ApiSubsonic();
let mediaPlayer = new MediaPlayer(document.querySelector('.media-player'), api);
let mediaCache = new MediaCache();
let mediaListing = new MediaListing(document.querySelector('.playlist'), mediaPlayer);

navigator.serviceWorker.addEventListener('message', event => {
	if( event.data.type && event.data.type == 'cache-version')
		document.getElementById('cache-version').innerText = event.data.msg;
});

// let playlist = null;
// let playlistIdx = 0;

api.GetPlaylist('800000012').then((data)=>{
	mediaListing.SetListing(data);

	let cacheBtn = document.querySelector('.playlist button.cache');
	cacheBtn.addEventListener('click', (evt)=>{ mediaCache.CachePlaylist(data); });
});

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

