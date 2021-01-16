import './components/gz-list-item';

export class MediaListing{

	constructor(node, mediaPlayer){
		this.mediaPlayer = mediaPlayer;
		this.node = node;
		this.listing = {
			name: '',
			songs: []
		};
		this.idx = 0;

		this.controls = {
			// load: node.querySelector('.btn.load'),
			play: node.querySelector('.play-playlist')
			// pause: node.querySelector('.btn.pause')
		};
		this.display = {
			title: node.querySelector('h2'),
			list: node.querySelector('ul')
		}

		this.SetControls();

		this.mediaPlayer.NextMediaFile = this.PlayNextIndex.bind(this);
		this.mediaPlayer.PreviousMediaFile = this.PlayPreviousIndex.bind(this);

		document.addEventListener('PlaylistPlayIndex',(evt)=>{
			console.log('PlaylistPlayIndex', evt);
			let {index} = evt.detail;
			if(!isNaN(index)) this.PlayIndex(index);
		});
	}

	SetControls(){
		this.controls.play.addEventListener('click', (evt)=>{
			this.PlayIndex(0);
		});
	}

	SetListing(listing){
		if(!listing.songs || !listing.songs.length) return;
		this.listing = {
			name: (listing.name || ""),
			songs: listing.songs.slice()
		};
		this.RenderListing();
	}

	ShuffleListing(){
		/* Shuffle the playlist using Durstenfeld algorithm */
		for (let i = this.listing.length - 1; i > 0; i--) {
			let j = Math.floor(Math.random() * (i + 1));
			let temp = this.listing[i];
			this.listing[i] = this.listing[j];
			this.listing[j] = temp;
		}
	}

	SortListing(method){
		//TODO: fill this with sorty goodness
	}

	RenderListing(){
		this.display.title.innerText = this.listing.name;
		//Clear out any existing list
		this.display.list.textContent = '';

		this.listing.songs.forEach((song, idx)=>{
			// let songBtn = document.createElement('button');
			// //songBtn.song = song;
			// songBtn.dataset.index = idx;
			// songBtn.innerText = song.title + ' [' + song.album + ']';
			// songBtn.addEventListener('click',(evt)=>{
			// 	//console.log(evt.target.song);
			// 	//this.mediaPlayer.PlaySongObject(evt.target.song);
			// 	this.PlayIndex(evt.target.dataset.index);
			// });
	
			// let listElement = document.createElement('li');
			// listElement.appendChild(songBtn);
			// this.display.list.appendChild(listElement);
			let listItem = document.createElement('gz-list-item');
			listItem.dataset.index = idx;
			listItem.dataset.title = song.title + ' [' + song.album + ']';
			listItem.dataset.url = song.src;
			let listElement = document.createElement('li');
			listElement.appendChild(listItem);
			this.display.list.appendChild(listElement);

		});
	}

	PlayIndex(index){
		if(typeof index !== 'number') this.idx = parseInt(index);
		else this.idx = index;
		this.mediaPlayer.PlaySongObject(this.listing.songs[this.idx], this.PlayNextIndex.bind(this));
	}

	PlayNextIndex(){
		this.PlayIndex(this.idx + 1);
	}

	PlayPreviousIndex(){
		this.PlayIndex(this.idx - 1);
	}

}