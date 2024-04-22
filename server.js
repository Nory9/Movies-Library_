const express = require('express');
const fs =require('fs');
const app = express();
const path = require('path');
const filePath = path.join('./MovieData', 'data.json');
const axios=require('axios');
const env=require('dotenv').config();
const cors = require('cors');
app.use(cors());


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

app.get('/spider',(req,res)=>{
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

app.get('/',homeHandler);
app.get('/trending',trendingHandler);
app.get('/search',searchHandler);

function trendingHandler(req,res){
    const url =`https://api.themoviedb.org/3/trending/all/week?api_key=${process.env.API_KEY}`;
    axios.get(url)
    .then( result=>{
        console.log('??')
        let movieData= result.data.results.map(x=>{
            return new Movie2(x.id,x.original_title,x.release_date,x.poster_path,x.overview);
        })
        res.json(movieData)
})
    .catch(error=>{
        res.status(500).send('internal server error')
    })

}

function searchHandler(req,res){
    let q = req.query.name;
    let url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.API_KEY}&language=en-US&query=${q}&page=2`;
    axios.get(url)
    .then( result =>{
        console.log(result.data.results)
      let  movieData= result.data.results
        res.json(movieData)
})
    .catch(error =>{
        res.status(500).send('internal server error')
    })
}

function homeHandler(req,res){
    res.json('this is the Home Page Let get Started!')
}

function Movie2(id, title,date,poster,overview){
    this.id=id,
    this.title=title,
    this.date=date,
    this.poster=poster,
    this.overview=overview
}


app.get('*',(req,res)=>{
    res.status(404).send("Client side error 404!");
})
app.use(express.json());
// app.use(error500);
app.listen(3000,()=>{
    console.log("the server is listening on port 3000")
});