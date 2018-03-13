from flask import json, jsonify
from app import app
import unittest
import random

class FlaskAppTestCase(unittest.TestCase):

    def test_index(self):
        tester = app.test_client(self)
        response = tester.get('/songs', content_type='text/json')
        self.assertEqual(response.status_code, 200)

    def test_index_pagination_should_be_blank(self):
        tester = app.test_client(self)
        response = tester.get('/songs', content_type='text/json')
        jsdata = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(jsdata['prev_url'], '')
        self.assertEqual(jsdata['next_url'], '')
    
    def test_average_difficulty(self):
        tester = app.test_client(self)
        response = tester.get('/songs/avg/difficulty/', content_type='text/json')
        jsdata = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        avg_diff = jsdata['result']['average_song_difficulty']
        self.assertTrue(avg_diff > 0)

    def test_average_difficulty_with_song_level(self):
        tester = app.test_client(self)
        response = tester.get('/songs', content_type='text/json')
        songList = json.loads(response.data)
        songList = songList['result']
        songLevels = set(song['level'] for song in songList)
        randomlySelectedSongLevel = random.sample(songLevels, 1)
        response = tester.get('/songs/avg/difficulty/'+str(randomlySelectedSongLevel[0]), content_type='text/json')
        jsdata = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        avg_diff = jsdata['result']['average_song_difficulty']
        self.assertTrue(avg_diff > 0)

    def test_blank_song_search(self):
        tester = app.test_client(self)
        response = tester.get('/songs/search/', content_type='text/json')
        jsdata = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(jsdata["error"], "Please enter a search string!")

    def test_song_search(self):
        tester = app.test_client(self)
        response = tester.get('/songs', content_type='text/json')
        songList = json.loads(response.data)
        songList = songList['result']
        songTitles = []
        for song in songList:
            for wordInTitle in song['title'].split(' '):
                songTitles.append(wordInTitle)
        songArtists = set(song['artist'] for song in songList)
        #print("$$$ got this list of song titles:")
        #print(songTitles)
        #print("$$$ got this list of song artist:")
        #print(songArtists)
        searchModesAvailable = ['title', 'artist']
        if random.sample(searchModesAvailable, 1)[0] == 'title':
            randomTitle = random.sample(songTitles, 1)[0]
            #print("$$$ going to do random title search with this title:")
            #print(randomTitle)
            response = tester.get('/songs/search/'+str(randomTitle), content_type='text/json')
        elif random.sample(searchModesAvailable, 1)[0] == 'artist':
            randomArtist = random.sample(songArtists, 1)[0]
            #print("$$$ going to do random artist search with this title:")
            #print(randomArtist)
            response = tester.get('/songs/search/'+str(randomArtist), content_type='text/json')

        jsdata = json.loads(response.data)    
        self.assertEqual(response.status_code, 200)
        self.assertTrue(len(jsdata['result']) > 0)

    def test_song_search_not_found(self):
        tester = app.test_client(self)
        testRandomSearchQuery = "asdfqwerty"
        response = tester.get('/songs/search/'+testRandomSearchQuery, content_type='text/json')
        jsdata = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(len(jsdata["result"]) == 0)

if __name__ == '__main__':
    unittest.main()