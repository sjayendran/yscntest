import React from 'react';
import ReactDOM from 'react-dom';
import RatingButton from './ratingButton';
const _ = require('lodash');

import {
    Input,
    Card,
    Segment,
    Select,
    Button,
    Loader,
    Container,
    Divider,
    Header,
    Icon,
    Message,
    } from 'semantic-ui-react';

const songListAPIURL = "http://127.0.0.1:5000/songs";
const songSearchAPIURL = "http://127.0.0.1:5000/songs/search/";

const API = 'https://hn.algolia.com/api/v1/search?query=';
const DEFAULT_QUERY = "reactjs";

let hiddenButton = {
    display: 'none',
};

class App extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            allSongs: [],
            songList: [],
            songLevelFilters:[],
            isLoading: false,
            searchQuery: '',
        };
    }

    fetchDataFromAPI(){
        if(this.state.searchQuery.length == 0){
            console.log("%%% going to use SONG LIST API!");
            this.setState({isLoading: true});
            fetch(songListAPIURL)
            .then(response => response.json())
            .then(data => this.setState({ allSongs: data.result, songList: data.result, isLoading: false }));
        }
        else if(this.state.searchQuery.length > 0){
            this.setState({isLoading: true});
            fetch(songSearchAPIURL + this.state.searchQuery)
            .then(response => response.json())
            .then(data => this.setState({ songList: data.result, isLoading: false }));
        }
    }

    componentWillMount() {
        this.fetchDataFromAPI();                    
    }
    
    componentDidUpdate(prevProps, prevState){
        console.log("%%% comp did update:");
        /*console.log("%%% this is the prev state:");
        console.log(prevState);*/
        if(prevState.searchQuery !== this.state.searchQuery){
            this.fetchDataFromAPI();
        }

        if(this.state.songLevelFilters.length == 0){
            this.setState({songLevelFilters: this.getLevelFilterOptions()});
        }
    }

    getUpdatedListOfSongs(){
        console.log("%%%%%% JUST GOING TO UPDATE song list now!!! after upating rating!");
        //this.setState({isLoading: true});
        this.fetchDataFromAPI();
    }

    getLevelFilterOptions(){
        console.log("LEVEL filter is empty -going to get level filter:");
        if(this.state.songLevelFilters.length == 0){
            let levelOptions = [];
            levelOptions.push({"value": "", "text": ""});
            _.each(_.sortedUniq(_.sortBy(_.map(this.state.allSongs, 'level'), [function (x){return x;}])), function(x){
                levelOptions.push({
                    "value": x,
                    "text": x
                })
            });
            console.log(levelOptions);
            return levelOptions;
        }
    }

    handleChange(e, data){
        console.log("%%% this is the song level filter:");
        console.log(this);
        console.log("%%%% and this is event");
        console.log(e.target);
        console.log("aaaand this is the data:");
        console.log(data.value);
        let filteredSongs = [];
        if(_.isNumber(data.value)){
            console.log("%%% DATA VALUE IS not empty so will filter from all songs:");
            filteredSongs = _.filter(this.state.allSongs, {'level': data.value});
        }
        else{
            console.log("%%% DATA VALUE IS EMPTY so will reset to all songs:");
            filteredSongs = this.state.allSongs;
        }
        console.log("%%% and this is the filtered songs:");
        console.log(filteredSongs);
        this.setState({songList: filteredSongs});
    }

    render() {
        const { allSongs, songList, isLoading, searchQuery, songLevelFilters } = this.state;
        console.log('this is the song list:');
        console.log(this.state.songList);
        return (
        <Container>
            <Divider hidden />
            <Header textAlign='center' as='h1'>
            Yousician Test App
            </Header>
            <Select onChange={(event, data) => {this.handleChange(event, data)}} placeholder='Filter by Level' options={this.state.songLevelFilters} />
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