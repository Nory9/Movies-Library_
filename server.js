const express = require('express');
const fs =require('fs');
const app = express();
const path = require('path');
const filePath = path.join('./MovieData', 'data.json');

function Movie(title, genre_ids, original_language, original_title, poster_path, video, vote_average, overview, release_date, vote_count, id, adult, backdrop_path, popularity, media_type){
    this.title= title;
    this.genre_ids= genre_ids;
    this.original_language=original_language;
    this.original_title=original_title;
    this.poster_path=poster_path;
    this.video=video;
    this.vote_average=vote_average;
    this.overview=overview;
    this.release_date=release_date;
    this.vote_count=vote_count;
    this.id=id;
    this.adult=adult;
    this.backdrop_path=backdrop_path;
    this.popularity=popularity;
    this.media_type=media_type;
}

const movieData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

app.get('/',(req,res)=>{
    try{
    const movie = new Movie(
        movieData.title,
        movieData.genre_ids,
        movieData.original_language,
        movieData.original_title,
        movieData.poster_path,
        movieData.video,
        movieData.vote_average,
        movieData.overview,
        movieData.release_date,
        movieData.vote_count,
        movieData.id,
        movieData.adult,
        movieData.backdrop_path,
        movieData.popularity,
        movieData.media_type
    );
    res.json(movie);
}
    catch(err){
        error500(err,req,res);
    }
});
const error500 =(err,req,res)=>{
    res.status(500).send({
        status:500,
        responseText: "Server Error: Something went wrong"
    })
}
app.get('/favorite',(req,res)=>{
    res.send("Welcome to favorite Page!");
});

app.get('*',(erq,res)=>{
    res.status(404).send("Client side error 404!");
})
app.use(express.json());
// app.use(error500);
app.listen(3000,()=>{
    console.log("the server is listening on port 3000")
});