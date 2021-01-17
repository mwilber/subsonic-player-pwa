export class MediaCache{
	constructor(){
		this.reqCt = 0;
		this.resCt = 0;
		this.errCt = 0;
		this.extCt = 0;

		this.mediaCacheName = 'media_v0.9';

		navigator.serviceWorker.addEventListener('message', event => {
			let cacheOut = document.querySelector('.cache-status');
			cacheOut.innerText = 'Media files cached: ' + event.data.count;
		});
	}

	CachePlaylist(playlist){

		this.paths = null;
		this.paths = playlist.songs.reduce((response, song)=>{
			response.push(song.coverArt[0].src, ...song.src);
			return response;
		}, []);

		this.CacheNextPath();
		
	}

	CacheNextPath(){
		if(!this.paths) return;
		this.CacheMediaUrl(this.paths.shift());
	}

	async CacheMediaUrl(url){
		if(!url) return;
		let cache = await caches.open(this.mediaCacheName);
		// Check for existing cache
		let match = await cache.match(url);
		if(!match || !match.body){
			// Fetch a new item. This will be cached automatically by the service worker
			try{
				let response = await fetch(url);
			}catch(e){
				console.log('error fetching', e);
			}
		}
		this.CacheNextPath();
	}

	CachePlaylistOrig(playlist){
		let paths = playlist.songs.reduce((response, song)=>{
			response.push(song.coverArt[0].src, ...song.src);
			return response;
		}, []);
		
		this.cacheOut = document.querySelector('.cache-status');

		caches.open('playlist_'+playlist.name)
			.then((cache)=>{
				paths.forEach((path)=>{
					this.CacheResponse(path, cache);
				});
			});
	}

	async CacheResponse(url, cache){
		let response = await fetch(url);
		await this.timeout(5000);
		return response;
	}

	timeout(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
	
}