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

let playlist = null;
let playlistIdx = 0;

api.GetPlaylist('800000012').then((data)=>{
    console.log("🚀 ~ file: main.js ~ line 35 ~ api.GetPlaylist ~ data", data)
	//playlist = data;
	//shufflePlaylist(playlist.songs);
	//let playlistElement = document.querySelector('.playlist ul');
	//document.querySelector('.playlist h2').innerHTML = playlist.name;
	mediaListing.SetListing(data);

	let cacheBtn = document.querySelector('.playlist button.cache');
	cacheBtn.addEventListener('click', (evt)=>{ mediaCache.CachePlaylist(playlist); });
});

document.querySelector('.play-playlist').addEventListener('click', (evt)=>{
	mediaPlayer.PlaySongObject(playlist.songs[playlistIdx]);
});

document.querySelector('.btn.next').addEventListener('click', (evt)=>{
	// playlistIdx++;
	// if( playlistIdx >= playlist.songs.length ) playlistIdx = 0;
	// mediaPlayer.PlaySongObject(playlist.songs[playlistIdx]);
	mediaListing.PlayNextIndex();
});

document.querySelector('.btn.previous').addEventListener('click', (evt)=>{
	// playlistIdx--;
	// if( playlistIdx < 0 ) playlistIdx = playlist.songs.length - 1;
	// mediaPlayer.PlaySongObject(playlist.songs[playlistIdx]);
	mediaListing.PlayPreviousIndex();
});

