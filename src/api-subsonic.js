export class ApiSubsonic{

	constructor(){

	}

	GetServerQuery(method, params){

		if(!localStorage['server'])
			localStorage['server'] = document.getElementById('server').value;
		if(!localStorage['user'])
			localStorage['user'] = document.getElementById('user').value;
		if(!localStorage['pass'])
			localStorage['pass'] = document.getElementById('pass').value;

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
			artist: data.artist,
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

	GetPlaylist(id){
		// TODO: remove this defualt value
		id = id || '800000013';

		return fetch(this.GetServerQuery('getPlaylist',{id: id}))
			.then(response => response.json())
			.then(
				(data)=>{
					if( !data['subsonic-response'] || data['subsonic-response'].status !== 'ok' ) return;
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
}