export class MediaCache{
	constructor(){

	}

	CachePlaylist(playlist){
		let paths = playlist.songs.reduce((response, song)=>{
			response.push(song.coverArt[0].src, ...song.src);
			return response;
		}, []);
        console.log("🚀 ~ file: media-cache.js ~ line 11 ~ MediaCache ~ paths ~ paths", paths)

		caches.open('playlist_'+playlist.name)
			.then(function(cache){
				console.log('Caching ' + cache.name);
				cache.addAll(paths);
			});
	}
}