# fullstack-web-dev-test
This exercise is meant to test both your basic backend and front-end coding skills.
It is cut into 2 parts:
 - The backend part, we will ask you to create a small Flask API.
 - The front-end part, you will be using the API made on the first part to build a front-end around it.

The test should be performed in this Github repository.

Good luck! :)


# Backend (Python, MongoDB)
For the backend part, we would like you to build a Flask API defining the routes listed bellow.
All routes should return a valid json dictionary.
There is no need to do any complexe input validation.
The API should use a mongod server that will contain a "songs" collection loaded from the provided file /songs.json.

List of routes to implement:
- GET /songs
  - Returns a list of songs
  - Add possibility to paginate songs.

- GET /songs/avg/difficulty
  - Takes an optional parameter "level" to select only songs from a specific level.
  - Returns the average difficulty for all songs.

- GET /songs/search
  - Takes in parameter a 'message' string to search.
  - Return a list of songs. The search should take into account song's artist and title. The search should be case insensitive.

- POST /songs/rating/<song_id>
  - Takes in parameter a "song_id" and a "rating"
  - The call should edit the rating of the song. Rating should be between 1 and 5.
  - Return an empty dictionary

Bonus:
- It is good practice to write tests when coding API routes!

# Front-end (React or Angular)
For the front end part, you will build a web page that will display a list of songs and their ratings taken from the API built earlier.

- Songs should be listed in a responsive grid. Think mobile!
- Using CSS properties and the file button.png, display the ratings for each song (so for example for a song with 4 stars, display 4 stars).
- Make the ratings editable by making the stars clickable.
- Use React or Angular 1/2 to build the website.

Bonus:
- Add pagination
- Add filtering by level
- Add song search
- A good look on the frontend will be appreciated
