from flask import Flask, jsonify, request, render_template
from flask_pymongo import PyMongo
from bson.objectid import ObjectId
import re

app = Flask(__name__)
app.config["MONGO_DBNAME"] = "yousiciandb"
app.config["MONGO_URI"] = "mongodb://apiadmin:yousiciantest@ds261078.mlab.com:61078/yousiciandb"

mongo = PyMongo(app)

@app.route('/songs', methods=['GET'])
def get_all_songs():
    #print('reached all songs route:')

    songs = mongo.db.songs
    result = []

    #print('made connection to db')

    for s in songs.find():
        result.append({"_id": str(s["_id"]), "artist": s["artist"],"title": s["title"],"difficulty": s["difficulty"],"level":s["level"],"released": s["released"],"rating": s["rating"]})
    
    #print("going to return these songs now:")
    #print(result)

    return jsonify({"result": result})

@app.route('/songs/avg/difficulty', methods=['GET'])
@app.route('/songs/avg/difficulty/<int:level>', methods=['GET'])
def get_avg_song_difficulty(level=None):
    songs = mongo.db.songs
    avg_difficulty = 0
    song_collection = None
    
    if level==None:
        song_collection = songs.find()
    else:
        song_collection = songs.find({"level": level})

    song_count = song_collection.count()
    
    if song_count > 0:
        for s in song_collection:
            avg_difficulty += s["difficulty"]
        
        avg_difficulty = round(avg_difficulty / song_count, 2)

    return jsonify({"result": {"average_song_difficulty": avg_difficulty}})

@app.route('/songs/search/', methods=['GET'])
@app.route('/songs/search/<string:message>', methods=['GET'])
def get_matching_song(message=None):
    songs = mongo.db.songs
    result = []
    
    #for s in songs.find({"_id": ObjectId("5aa3866bf36d280504b501d1")}):
    if message != None:
        for s in songs.find({'$or': [{'artist': re.compile(message, re.IGNORECASE)}, {'title': re.compile(message, re.IGNORECASE)}]}):
            result.append({"artist": s["artist"],"title": s["title"],"difficulty": s["difficulty"],"level":s["level"],"released": s["released"],"rating": s["rating"]})
        
        return jsonify({"result": result})
    
    else:
        return jsonify({"error": "Please enter a search string!"}), 400


@app.route('/songs/rating/<string:song_id>/<song_rating>', methods=['POST'])
def update_song_rating(song_id, song_rating):
    songs = mongo.db.songs
    
    matching_song = songs.find_one({"_id": ObjectId(str(song_id))})
    if matching_song:
        songs.find_one_and_update({"_id": ObjectId(str(song_id))}, {"$set": {"rating": float(song_rating)}})
        return jsonify({})
    else:
        return jsonify({"error": "Invalid song id!"})

@app.route('/')
def index():
    return render_template('index.html')        

if __name__ == '__main__':
    app.run()