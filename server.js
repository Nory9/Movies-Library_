const express = require('express');
const fs =require('fs');
const app = express();
const path = require('path');
const filePath = path.join('./MovieData', 'data.json');
const axios=require('axios');
const env=require('dotenv').config();
const cors = require('cors');
app.use(cors());
const bodyparser= require('body-parser');
app.use(bodyparser.urlencoded({extended:false}))
app.use(bodyparser.json())
const {Client} = require('pg');
const client =new Client(process.env.DATABASE_URL); 



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
            return new Movie2(x.id,x.original_title,x.release_date,x.poster_path,x.overview,x.name,x.first_air_date);
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

function Movie2(id, title,date,poster,overview,name,first_air_date){
    this.id=id,
    this.title=title,
    this.date=date,
    this.poster=poster,
    this.overview=overview,
    this.name=name,
    this.first_air_date=first_air_date
}
//lab 13 routes 
app.post('/addMovie',addMovieHandler);
app.get('/allMovies',getAllMoviesHandler);

function addMovieHandler(req,res){
    const {id,title,genre,overview,release_date,poster} = req.body
    const sql= `INSERT INTO movie (id,title,genre,overview,release_date,poster) 
    VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`;
    const valuse= [id,title,genre,overview,release_date,poster]
    client.query(sql,valuse).then((result)=>{
        console.log(result.rows)
        res.status(201).send(result.rows)
    })
    .catch(err => {
        console.error('Error adding movie:', err);
            res.status(500).send('Error updating movie');
 } )
}

function getAllMoviesHandler(req,res){
    const sql = `SELECT * FROM movie`
    client.query(sql).then((result)=>{
        const data = result.rows
        res.json(data)
    })
    .catch()
}

// lab 14 
app.put('/updateMovie/:id',updateMovieHandler);
app.delete('/deelteMovie/:id',deleteMovieHandler);
app.get('/getMovie/:id',getMovieHandler)

function updateMovieHandler(req,res){
    const {id,title,genre,overview,release_date,poster} = req.body
    const values= [title,genre,overview,release_date,poster,id]
    let ID = req.params.id;
    let sql= `UPDATE movie
    SET title = $1, genre=$2,overview=$3,release_date=$4,poster=$5
    WHERE id=$6`
    client.query(sql,values).then(result=>{
        console.log(result.rows)
        res.status(200).json(result.rows)
    }).catch(err => {
        console.error('Error updating a movie:', err);
            res.status(500).send('Error updating movie');
 } )
}

function deleteMovieHandler(req,res){
    let {id}=req.params;
    let values=[id]
    let sql=`DELETE FROM movie WHERE id=$1`
    client.query(sql,values).then(result=>{
        console.log(result.rows)
        res.status(204).send("deleted")
    }).catch(err=>{
        console.error('Error deleting a movie:', err);
            res.status(500).send('Error deleting movie');
 } )

}

function getMovieHandler(req,res){
    let id=req.params.id;
    let values=[id];
    let sql=`SELECT * FROM movie
    WHERE id=$1;`
    client.query(sql,values).then(result=>{
        console.log(result.rows);
        res.status(200).send(result.rows)
    }).catch(err=>{
        console.error('Error getting a movie:', err);
            res.status(500).send('Error getting movie');
 }
    )
}

app.get('*',(req,res)=>{
    res.status(404).send("Client side error 404!");
})
app.use(express.json());

client.connect().then(()=>{
     app.listen(3000,()=>{
     console.log(`the server is listening on port ${process.env.PORT} and connected to databse`)
      })
     })
.catch()
// app.use(error500);
