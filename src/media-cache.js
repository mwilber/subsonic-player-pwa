export class MediaCache{
	constructor(){
		this.reqCt = 0;
		this.resCt = 0;
		this.errCt = 0;
		this.extCt = 0;
	}

	CachePlaylist(playlist){
		let paths = playlist.songs.reduce((response, song)=>{
			response.push(song.coverArt[0].src, ...song.src);
			return response;
		}, []);
		console.log("🚀 ~ file: media-cache.js ~ line 11 ~ MediaCache ~ paths ~ paths", paths)
		
		this.reqCt = 0;
		this.resCt = 0;
		this.errCt = 0;
		this.extCt = 0;
		this.cacheOut = document.querySelector('.cache-status');

		caches.open('playlist_'+playlist.name)
			.then((cache)=>{
				paths.forEach((path)=>{
					this.reqCt++;
					this.CacheResponse(path, cache).then((cacheResult)=>{
						switch( cacheResult.type ){
							case 'response':
								this.resCt++;
								this.cacheOut.innerText = 'cached '+this.resCt+' of '+this.reqCt+'. '+this.extCt+' already cached. ( '+this.errCt+' errors ) '+(this.resCt+this.extCt+this.errCt);
								break;
							case 'error':
								this.errCt++;
								this.cacheOut.innerText = 'cached '+this.resCt+' of '+this.reqCt+'. '+this.extCt+' already cached. ( '+this.errCt+' errors ) '+(this.resCt+this.extCt+this.errCt);
								break;
							case 'exist':
								this.extCt++;
								this.cacheOut.innerText = 'cached '+this.resCt+' of '+this.reqCt+'. '+this.extCt+' already cached. ( '+this.errCt+' errors ) '+(this.resCt+this.extCt+this.errCt);
								break;
							default:
						}
					});


					// caches.match(path).then((response)=>{
					// 	if(!response || !response.body){
					// 		// Not cached yet, so let's add it
					// 		cache.add(path).then((res)=>{
					// 			this.resCt++;
					// 			this.cacheOut.innerText = 'cached '+this.resCt+' of '+this.reqCt+'. '+this.extCt+' already cached. ( '+this.errCt+' errors ) '+(this.resCt+this.extCt+errCt);
					// 			//console.log('cached '+this.resCt+' of '+this.reqCt+'. '+this.extCt+' already cached. ( '+this.errCt+' errors )');
					// 		}).catch((err)=>{
					// 			this.errCt++;
					// 			this.cacheOut.innerText = 'cached '+this.resCt+' of '+this.reqCt+'. '+this.extCt+' already cached. ( '+this.errCt+' errors ) '+(this.resCt+this.extCt+errCt);
					// 			//console.error('something went wrong', err);
					// 		});
					// 	}else{
					// 		// Already in the cache
					// 		this.cacheOut.innerText = 'cached '+this.resCt+' of '+this.reqCt+'. '+this.extCt+' already cached. ( '+this.errCt+' errors ) '+(this.resCt+this.extCt+errCt);
					// 		this.extCt++;
					// 	}
					// });
					
				});
				//cache.addAll(paths);
				//.slice(92,93)
			});
	}

	async CacheResponse(url, cache){
		let response = await caches.match(url);
		let result = {
			type: 'error'
		};
		if(!response || !response.body){
			try{
				let res = await cache.add(url);
				result.type = 'response';
			}catch(err){
				result.type = 'error';
			}
			await this.timeout(5000);
		}else{
			result.type = 'exist';
		}

		

		return result;
	}

	timeout(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
	
}