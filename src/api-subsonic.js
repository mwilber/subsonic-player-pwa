export class ApiSubsonic{

	constructor(){

	}

	GetServerQuery(method, params){

		let server = localStorage['server'];
		let user = localStorage['user'];
		let pass = localStorage['pass'];

		if(server && user && pass){
			let query = server+'/rest/'+method+'.view?u='+user+'&p='+pass+'&v=1.12.0&f=json&c=greenzeta';
			for (const key in params) {
				if (Object.hasOwnProperty.call(params, key)) {
					query += '&'+key+'='+params[key];
				}
			}
			return query;
		}
	}

	FormatSongObject(data){
		//TODO: validate the data object
		return {
			album: data.album,
			albumId: data.albumId,
			artist: data.artist,
			artistId: data.artistId,
			title: data.title,
			coverArt: [
				{
					src: this.GetServerQuery('getCoverArt',{id: data.id, size: 256}),
					sizes: '256x256', 
					type: 'image/png'
				}
			],
			src: [
				this.GetServerQuery('download',{id: data.id})
			]
		};
	}

	GetSong(id){
		return fetch(this.GetServerQuery('getSong',{id: id}))
			.then(response => response.json())
			.then(
				(data)=>{
					if( !data['subsonic-response'] || data['subsonic-response'].status !== 'ok' ) return;
					return this.FormatSongObject(data['subsonic-response'].song[0]);
				}
			);
	}

	GetAlbum(id){
		if(!id) return;

		return fetch(this.GetServerQuery('getAlbum',{id: id}))
			.then(response => response.json())
			.then(
				(data)=>{
                console.log("🚀 ~ file: api-subsonic.js ~ line 63 ~ ApiSubsonic ~ GetAlbum ~ data", data)
					if( !data['subsonic-response'] || 
						data['subsonic-response'].status !== 'ok' || 
						!data['subsonic-response'].album || 
						!data['subsonic-response'].album.song
						) return;
					let playlistObj = {
						name: data['subsonic-response'].album.name,
						songs: []
					}
					data['subsonic-response'].album.song.forEach((song)=>{
						playlistObj.songs.push(this.FormatSongObject(song))
					});
					return playlistObj;
				}
			);
	}

	GetPlaylist(id){
		// TODO: remove this defualt value
		id = id || '800000013';

		return fetch(this.GetServerQuery('getPlaylist',{id: id}))
			.then(response => response.json())
			.then(
				(data)=>{
					if( !data['subsonic-response'] || 
						data['subsonic-response'].status !== 'ok' || 
						!data['subsonic-response'].playlist || 
						!data['subsonic-response'].playlist.entry
						) return;
					let playlistObj = {
						name: data['subsonic-response'].playlist.name,
						songs: []
					}
					data['subsonic-response'].playlist.entry.forEach((song)=>{
						playlistObj.songs.push(this.FormatSongObject(song))
					});
					return playlistObj;
				}
			);
	}

	GetPlaylists(){
		return fetch(this.GetServerQuery('getPlaylists',{}))
		.then(response => response.json())
		.then(
			(data)=>{
				if( !data['subsonic-response'] || data['subsonic-response'].status !== 'ok' ) return;

				let playlistsObj = [];
				if(data['subsonic-response'].playlists && data['subsonic-response'].playlists.playlist && data['subsonic-response'].playlists.playlist.slice)
					playlistsObj = data['subsonic-response'].playlists.playlist.slice();

				return playlistsObj;
			}
		);
	}

	GetSearch2(query){
		if(!query) return;

		return fetch(this.GetServerQuery('search2',{query: query, songCount: 2}))
			.then(response => response.json())
			.then(
				(data)=>{
                //console.log("🚀 ~ file: api-subsonic.js ~ line 63 ~ ApiSubsonic ~ GetAlbum ~ data", data)
					if( !data['subsonic-response'] || data['subsonic-response'].status !== 'ok' ) return;
					let searchResultObj = {
						albums: [],
						artists: [],
						songs: []
					}
					// Format Songs
					data['subsonic-response'].searchResult2.song.forEach((song)=>{
						searchResultObj.songs.push(this.FormatSongObject(song))
					});
					// Add Albums
					searchResultObj.albums = data['subsonic-response'].searchResult2.album.slice();
					// TODO: Add artists
					return searchResultObj;
				}
			);
	}
}