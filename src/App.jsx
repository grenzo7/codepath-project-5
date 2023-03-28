import './App.css';
import {useState, useEffect} from 'react';
import Input from './components/Input';
import Card from './components/Card'

const CLIENT_ID = '5f01868cfc3243c1892a7972f7a501a6';
const CLIENT_CODE = '903c93c9e868460285af50f14375e1d3';

function App() {
  const [searchInput, setSearchInput] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [albums, setAlbums] = useState([]);
  const [initialAlbumsData, setInitialAlbumsData] = useState([])
  const [artistData, setArtistData] = useState(null);
  const [lowerBound, setLowerBound] = useState(0);
  const [upperBound, setUpperBound] = useState(0);

  useEffect(() => {
    // API Accces parameters provided by Spotify
    let authParameters = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_CODE
    }
    fetch('https://accounts.spotify.com/api/token', authParameters).then(result => result.json()).then(data => setAccessToken(data.access_token))
  }, [])

  useEffect(()=>{
    // reset upper bound
    setUpperBound(maxTrackCount());
    // reset lower bound
    setLowerBound(minTrackCount())
  }, [initialAlbumsData])

   // helper function to find maximum number of tracks
   const maxTrackCount = () => {
    const maxCount = albums.reduce(
      (acc, next) => {
        return next.total_tracks > acc ?  next.total_tracks: acc}, -Infinity
    )
    return maxCount;
  }

  // helper function to find maximum number of tracks
  const minTrackCount = () => {
    const minCount = albums.reduce(
      (acc, next) => {
        return next.total_tracks < acc ?  next.total_tracks: acc}, Infinity
    )
    return minCount;
  }

  // helper function to make search for an album based on the artist name
  const search = async (e) => {
    // avoid refreshing of page on button or enter click
    e.preventDefault();
    // search paramaters authorization provided by Spotify
    let searchParameters = {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
      },
    }
     // get artist data associated to the given artist
    let data = await fetch('https://api.spotify.com/v1/search?q=' + searchInput + '&type=artist', searchParameters).then(response => response.json()).then(data => {return data.artists.items[0]})
    // set the artist data
    setArtistData(data)
    // get all the albums of the given artist
    let albumsInfo = await fetch('https://api.spotify.com/v1/artists/' + data.id + '/albums?include_groups=album&market=US&limit=50', searchParameters).then(response => response.json()).then(data => {return data.items})
    // update albums to show all the albums data
    setAlbums([...albumsInfo]);
    // store initial albums state
    setInitialAlbumsData([...albumsInfo]);
    // reset the search Input
    setSearchInput("");
  }

  const filterBySongs = () => {
    const filteredData = albums.filter((album) => album.total_tracks >= lowerBound && album.total_tracks <= upperBound)
    setAlbums([...filteredData])
  }

  const validSongFilter = (value, type) => {
    if (value < minTrackCount() && value > maxTrackCount()){
      alert("This artist has no albums with " + value + " tracks.")
    } else if (type == 'l' && value > upperBound){
      alert("Invalid! You can set lower bound greater than upper bound.")
    } else if (type == 'u' && value < lowerBound){
      alert("Invalid! You can set upper bound lesser than lower bound.")
    } else{
      return true;
    }
    return false;
  }

  const leftSideChange = (e) => {
    if (validSongFilter(e.target.value, 'l')){
      setLowerBound(e.target.value)
      filterBySongs()
    }
  }

  const rightSideChange = (e) => {
    if (validSongFilter(e.target.value, 'u')){
      setUpperBound(e.target.value)
      filterBySongs()
    }
  }

  const getRangeOfTracks = () => {
    // find max and min count
    const maxCount = maxTrackCount();
    const minCount = minTrackCount();
    // return an appropriate response of range
    if (maxCount - minCount > 0){
      return "The range of total tracks is " + minCount + " - " + maxCount + " tracks per album";
    } else {
      return "There are  " + maxCount + " number of tracks in every album";
    }
  }

  // helper function to alphabetically sort the albums based on their title 
  const sortAlphabetically = () =>{
    let currentData = albums;
    currentData.sort(function (a, b) {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    });
    setAlbums([...currentData]);
  }

  // helper function to regain initial fetch data of albums
  const resetToFetchedData = () =>{
    const initialData = initialAlbumsData;
    console.log(initialData)
    setAlbums([...initialData]);
  }

  // helper function to sort albums in ascending order of their number of tracks
  const sortByNoOfTracks = () => {
    let currentData = albums;
    currentData.sort((a, b) => (a.total_tracks > b.total_tracks) ? 1 : -1);
    setAlbums([...currentData]);
  }
  
  // helper function to sort albums on the basis of their release date 
  const sortByReleasedDate = () => {
    let currentData = albums;
    albums.sort(function(a, b) {
      return new Date(a.release_date) - new Date(b.release_date);
    });
    setAlbums([...currentData])
  }

  const handleSortOptionChange = (e) => {
    console.log(e.target.value)
    if (e.target.value === "alphabetically"){
      sortAlphabetically();
    } else if (e.target.value === "none"){
      resetToFetchedData();
    } else if (e.target.value === "tracks"){
      sortByNoOfTracks();
    } else if (e.target.value === "date"){
      sortByReleasedDate();
    }
  }

  return (
    <div className="App">
      <div className='left-panel'>
        <Input searchInput={searchInput} setSearchInput={setSearchInput} search={search} />
        <h1 className='author-title'>{artistData && artistData.name !== "" ? "Artist: " + artistData.name : "" }</h1>
        <h2>Show By</h2>
        <p>Number of Songs / album</p>
        <div className='songs-filter'>
          <input className="button" type="number" value={lowerBound} onChange={leftSideChange} /> to <input className="button" type="number" value={upperBound} onChange={rightSideChange}/>
        </div>
        <div className='sort-by-container'>
          <label htmlfor="sort-value">Sort by</label>
          <select id="sort-value" name="sort-type" defaultValue="none" onChange={handleSortOptionChange}>
            <option value="none">None</option>
            <option value="date">Release Date</option>
            <option value="alphabetically">Alphabetically (A-Z)</option>
            <option value="tracks">Number of Tracks</option>
          </select>
        </div>
      </div>
      <div className='right-panel'>
        <div className='container stats-container'>
          <div className="stat-card">{artistData ? "This artist has an average of " + artistData.popularity + " rating in Spotify" : ""}</div>
          <div className="stat-card">{albums.length !== 0 ? "This artist has " + albums.length + " listed albums in Spotify" : ""}</div>
          <div className="stat-card">{artistData ? getRangeOfTracks() : ""}</div>
        </div>
        <div className='container album-container'>
          {albums.map((album, i) => {
                  return <Card idx={i} noOfTracks={album.total_tracks} date={album.release_date} name={album.name} url={album.images[0].url}/>;
          })}
        </div>
      </div>
    </div>
  ) 
}


export default App;
