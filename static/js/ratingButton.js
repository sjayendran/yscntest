import React from 'react';
import ReactDOM from 'react-dom';

let uncheckedButton = {
    backgroundImage: 'url("../static/img/button.png")',
    backgroundRepeat:'no-repeat',
    backgroundPosition: 'center',
    border: 'none',
    cursor: 'pointer',
    width: '50px',
    height: '50px',
};

let checkedButton = {
    backgroundImage: 'url("../static/img/buttonChecked.png")',
    backgroundRepeat:'no-repeat',
    backgroundPosition: 'center',
    border: 'none',
    cursor: 'pointer',
    width: '50px',
    height: '50px',
};

const songRatingAPIURL = "http://127.0.0.1:5000/songs/rating/<songid>/<songrating>";

class RatingButton extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            stars_checked: []
        };
    }

    componentDidMount() {
        this.markRatingUsingStarsBasedOnRating();
    }

    //mark star setting using an array of 5 star states, 
    //based on given rating property
    markRatingUsingStarsBasedOnRating(){
        let roundedRating = Math.round(this.props.rating);
        let starSetting = [false, false, false, false, false];
        for(let i = 0; i < 5; i++){
            if(i < roundedRating){
                starSetting[i] = true;
            }
            else if(i >= roundedRating){
                starSetting[i] = false;
            }
        }
        this.setState({stars_checked:starSetting});
    }

    //hit API with POST request and new rating for chosen songID
    manualRatingUpdate(newRating){
        let actualRatingAPIURL = songRatingAPIURL.replace('<songid>', this.props.songID).replace('<songrating>', newRating);
        fetch(actualRatingAPIURL, {
            method: 'POST'
        }).then(document.getElementById('updateSongListOnRatingPush').click());
    }

    //render method for rating button component ONLY
    render() {
        return (
            <div>
                <b>Rating: {this.props.rating}</b>
                <br/>
                <input type="button" onClick={() => { this.manualRatingUpdate(1) }} name="button" style={this.state.stars_checked[0] ? checkedButton : uncheckedButton}/>
                <input type="button" onClick={() => { this.manualRatingUpdate(2) }} name="button" style={this.state.stars_checked[1] ? checkedButton : uncheckedButton}/>
                <input type="button" onClick={() => { this.manualRatingUpdate(3) }} name="button" style={this.state.stars_checked[2] ? checkedButton : uncheckedButton}/>
                <input type="button" onClick={() => { this.manualRatingUpdate(4) }} name="button" style={this.state.stars_checked[3] ? checkedButton : uncheckedButton}/>
                <input type="button" onClick={() => { this.manualRatingUpdate(5) }} name="button" style={this.state.stars_checked[4] ? checkedButton : uncheckedButton}/>
            </div>
        )
    }
}

export default RatingButton;