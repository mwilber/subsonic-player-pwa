export class MediaCache{
	constructor(){

	}

	CachePlaylist(playlist){
		let paths = playlist.songs.reduce((response, song)=>{
			response.push(song.coverArt[0].src, ...song.src);
			return response;
		}, []);
		console.log("🚀 ~ file: media-cache.js ~ line 11 ~ MediaCache ~ paths ~ paths", paths)
		
		let reqCt = 0;
		let resCt = 0;
		let errCt = 0;
		let extCt = 0;
		let cacheOut = document.querySelector('.cache-status');

		caches.open('playlist_'+playlist.name)
			.then(function(cache){
				paths.forEach((path)=>{
					reqCt++;
					caches.match(path).then((response)=>{
						if(!response || !response.body){
							// Not cached yet, so let's add it
							cache.add(path).then((res)=>{
								resCt++;
								cacheOut.innerText = 'cached '+resCt+' of '+reqCt+'. '+extCt+' already cached. ( '+errCt+' errors ) '+(resCt+extCt+errCt);
								//console.log('cached '+resCt+' of '+reqCt+'. '+extCt+' already cached. ( '+errCt+' errors )');
							}).catch((err)=>{
								errCt++;
								cacheOut.innerText = 'cached '+resCt+' of '+reqCt+'. '+extCt+' already cached. ( '+errCt+' errors ) '+(resCt+extCt+errCt);
								//console.error('something went wrong', err);
							});
						}else{
							// Already in the cache
							cacheOut.innerText = 'cached '+resCt+' of '+reqCt+'. '+extCt+' already cached. ( '+errCt+' errors ) '+(resCt+extCt+errCt);
							extCt++;
						}
					});
					
				});
				//cache.addAll(paths);
				//.slice(92,93)
			});
	}
}