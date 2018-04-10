import React from 'react';
import ReactDOM from 'react-dom';
import RatingButton from './ratingButton';
const _ = require('lodash');

//Using Semantic UI for the front end styling / elements
import {
    Input,
    Card,
    Segment,
    Select,
    Button,
    Loader,
    Container,
    Pagination,
    Divider,
    Header,
    Icon,
    Message,
    } from 'semantic-ui-react';



const songListAPIURL = "http://127.0.0.1:5000/songs"; //API URL for listing ALL SONGS
const songSearchAPIURL = "http://127.0.0.1:5000/songs/search/"; //API URL for searching ALL SONGS

//styling to hide button that will be used to trigger post rating data update
let hiddenButton = {
    display: 'none',
};

//styling to keep paging to the right
let pagingSelect = {
    float: 'right'
}

console.shallowCloneLog = function(){
    var typeString = Function.prototype.call.bind(Object.prototype.toString)
    console.log.apply(console, Array.prototype.map.call(arguments, function(x){
      switch (typeString(x).slice(8, -1)) {
        case 'Number': case 'String': case 'Undefined': case 'Null': case 'Boolean': return x;
        case 'Array': return x.slice();
        default: 
          var out = Object.create(Object.getPrototypeOf(x));
          out.constructor = x.constructor;
          for (var key in x) {
            out[key] = x[key];
          }
          Object.defineProperty(out, 'constructor', {value: x.constructor});
          return out;
      }
    }));
  }


class App extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            pagingDropdownSelection: '', //to set selected value of paging limit options dropdown
            allSongs: [], //to contain all songs from the API - with no filtering of any kind
            totalSongCount: 0, //to get the total song count from the DB - with no filtering of any kind
            songList: [], //song list that will be used for iteration and display in the UI
            songLevelFilters:[], //level filters based on the songs that exist in the DB - sorted and de-duplicated
            pagingOptions: [], //paging options pre-populated with options from 1 to 15
            selectedPaging: 0, //selected paging limit option
            calculatedOffset: 0, //offset to be calculated based on selected page and selected paging limit
            totalPages: 0, //total pages that will be required for pagination based on selected paging limit and total songs in DB
            isLoading: false, //will be used for showing loading indicators when data fetching is happening
            searchQuery: '', //search query entered in search box to be used against song search API
            currentlyActivePage: 1, //currently selected page via pagination
        };
    }

    //method to fetch data from flask API based on listing all songs, searching for songs, or applying a paging limit paging through the data
    fetchDataFromAPI(){
        //use one API endpoint if NOT searching BUT listing ALL songs
        if(this.state.searchQuery.length == 0){
            let apiURLWithLimits = songListAPIURL;
            if(this.state.selectedPaging > 0){
                if(this.state.calculatedOffset > 0){
                    apiURLWithLimits = apiURLWithLimits + "?limit=" + this.state.selectedPaging + "&offset=" + this.state.calculatedOffset;
                }
                else{
                    apiURLWithLimits = apiURLWithLimits + "?limit=" + this.state.selectedPaging;
                }
            }

            this.setState({isLoading: true});
            fetch(apiURLWithLimits)
            .then(response => response.json())
            .then(data => this.setState({ allSongs: data.result, songList: data.result, isLoading: false }));
        }
        //use another API endpoint if searching for specific songs
        else if(this.state.searchQuery.length > 0){
            this.setState({isLoading: true});
            fetch(songSearchAPIURL + this.state.searchQuery)
            .then(response => response.json())
            .then(data => this.setState({ songList: data.result, isLoading: false }));
        }
    }

    //fetch data on initial load
    componentWillMount() {
        this.fetchDataFromAPI();                 
    }
    
    //fetch data after any state update if state change requires data fetch
    componentDidUpdate(prevProps, prevState){
        if(prevState.searchQuery !== this.state.searchQuery){
            this.fetchDataFromAPI();
        }

        if(this.state.songLevelFilters.length == 0){
            this.setState({songLevelFilters: this.getLevelFilterOptions()});
        }

        if(prevState.selectedPaging !== this.state.selectedPaging){
            this.fetchDataFromAPI();
        }

        if(prevState.currentlyActivePage !== this.state.currentlyActivePage){
            this.fetchDataFromAPI();
        }
    }
    
    //primarily used to get updated song rating from DB after updating rating via rating button component
    //called using hidden button on main app component from rating button component
    getUpdatedListOfSongs(){
        this.fetchDataFromAPI();
    }

    //get sorted, unique song levels, based on songs in DB
    getLevelFilterOptions(){
        if(this.state.songLevelFilters.length == 0){
            let levelOptions = [];
            levelOptions.push({"value": "", "text": "Clear Level Filter"});
            _.each(_.sortedUniq(_.sortBy(_.map(this.state.allSongs, 'level'), [function (x){return x;}])), function(x){
                levelOptions.push({
                    "value": x,
                    "text": x
                })
            });

            let pgngOpts = [];
            _.each(_.range(16),function(x){
                if(x > 0){
                    pgngOpts.push({
                        "value": x,
                        "text": x
                    });
                }
                else{
                    pgngOpts.push({
                        "value": 0,
                        "text": 'Clear Paging Filter'
                    });
                }
            });
            this.setState({pagingOptions: pgngOpts, totalSongCount: this.state.allSongs.length });
            return levelOptions;
        }
    }

    //filter songs using local song list copy, based on selected song difficulty level
    handleLevelFilterChange(e, data){
        let filteredSongs = [];
        if(_.isNumber(data.value)){
            filteredSongs = _.filter(this.state.allSongs, {'level': data.value});
        }
        else{
            filteredSongs = this.state.allSongs;
        }
        this.setState({songList: filteredSongs});
    }

    //used to accordingly set paging limit based on user choice, 
    //and subsequently refresh data based on chosen paging limit
    changePagingOptions(e, data){
        let pageTotal = 0;
        if(data.value > 0){
            pageTotal = Math.ceil(this.state.totalSongCount/data.value);
            this.setState({pagingDropdownSelection: data.value});
        }
        else{
            this.setState({pagingDropdownSelection: ''});
        }
        this.setState({selectedPaging: data.value, totalPages: pageTotal});
    }

    //calculate offset based on paging limit, selected page and
    //subsequently fetch data from API for the selected page.
    handlePaginationChange(e, data){
        let selectedPage = data.activePage;
        let calcOff = 0;
        if(selectedPage > 1){
            calcOff = (selectedPage - 1) * this.state.selectedPaging;
        }
        
        this.setState({calculatedOffset: calcOff, currentlyActivePage: selectedPage});
    }

    //main render method for app, for everything except rating button
    render() {
        const { allSongs, songList, isLoading, searchQuery, songLevelFilters, pagingOptions, selectedPaging, totalPages, totalSongCount, pagingDropdownSelection, calculatedOffset, currentlyActivePage } = this.state;
        return (
        <Container>
            <Divider hidden />
            <Header textAlign='center' as='h1'>
            Yousician Test App
            </Header>
            <Select onChange={(event, data) => {this.handleLevelFilterChange(event, data)}} placeholder='Filter by Level' options={this.state.songLevelFilters} />
            <Select id="pagingSelect" style={pagingSelect} value={this.state.pagingDropdownSelection} onChange={(event, data) => {this.changePagingOptions(event, data)}} placeholder='Results per page' options={this.state.pagingOptions} />
            <Input loading={isLoading} onChange={(event) => { this.setState({searchQuery: event.target.value}) }} fluid icon='search' placeholder='Search for song...' />
            <Divider hidden clearing />
            {isLoading ? (
                <Container>
                    <Loader size='large' active inline='centered'>Loading Songs...</Loader>
                </Container>
            ) : (
                <Container>
                    {songList.length > 0 ? (
                        (songList.map(song =>
                            <Segment key={song._id} color='green' raised>
                                <h3>{song.artist} - {song.title}</h3>
                                <h4>Released: {song.released}</h4>
                                <h4>Difficulty: {song.difficulty}</h4>
                                <h4>Level: {song.level}</h4>
                                <RatingButton songID={song._id} rating={song.rating} />
                            </Segment>
                        ))
                    ) : (<Segment inverted color='red'>
                            <h3>No matching songs.</h3>
                            </Segment>
                    )}
                </Container>
            )}
        <Button style={hiddenButton} onClick={() => { this.getUpdatedListOfSongs() }} id="updateSongListOnRatingPush" value="randotest"/>
        <Pagination defaultActivePage={1} totalPages={this.state.totalPages} onPageChange={(event, data) => {this.handlePaginationChange(event, data)}} />
        </Container>
        )
    }
}

// ----------------------------------------
// Render
// ----------------------------------------
const mountNode = document.createElement('div')
document.body.appendChild(mountNode)

ReactDOM.render(<App />, mountNode)