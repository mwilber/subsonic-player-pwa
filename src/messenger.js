export default class Messenger{
	constructor(){
		this.channels = {
			cacheState:{
				data: null,
				subscribers: []
			}
		};
	}

	// navigator.serviceWorker.addEventListener('message', event => {
	// 	if( event.data.type && event.data.type == 'cache-version')
	// 		document.getElementById('cache-version').innerText = event.data.msg;
	// });
}