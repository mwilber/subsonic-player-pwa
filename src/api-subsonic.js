export class ApiSubsonic{

	constructor(){

	}

	GetServerQuery(method, params){

		localStorage['server'] = document.getElementById('server').value;
		localStorage['user'] = document.getElementById('user').value;
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

	GetSong(id){
		return fetch(this.GetServerQuery('getSong',{id: id}))
			.then(response => response.json())
			.then(
				(data)=>{
					let songObj = {
						album: data.album,
						artist: data.artist,
						title: data.title,
						coverArt: [
							{
								src: this.GetServerQuery('getCoverArt',{id: id, size: 256}),
								sizes: '256x256', 
								type: 'image/png'
							}
						],
						src: [
							this.GetServerQuery('download',{id: id})
						]
					}
					return songObj;
				}
			);
	}
}