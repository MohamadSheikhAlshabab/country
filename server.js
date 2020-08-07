'use strict';

require('dotenv').config();

const cors=require('cors');
const express=require('express');
const methodOverride=require('method-override');
const superagent=require('superagent');
const pg=require('pg');

const app=express();
const PORT=process.env.PORT || 3000;
const client= new pg.Client(process.env.DATABASE_URL);

app.use(cors());
app.use(express.json());
app.use(express.static('./public'));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.set('view engine','ejs');

app.get('/',(req,res)=>{
    let url='https://restcountries.eu/rest/v2/all';
    superagent.get(url)
    .then((result)=>{
            let arUrl=result.body.map((val)=>{
                return new Country(val);
            })
            res.render('index',{data:arUrl,name:'Home'});
    })
})
function Country(val){
    this.name=val.name || 'no name';
    this.capital=val.capital || 'no capital';
    this.region=val.region || 'no region';
    this.subregion=val.subregion || 'no subregion';
    this.population=val.population || 'no population';
    this.borders=val.borders || 'no borders';
    this.nativename=val.nativename || 'no nativename';
    this.numericCode=val.numericCode || 'no numericCode';
    this.currencies=val.currencies || 'no currencies';
    this.flag=val.flag || 'no flag';
    this.latlng=val.latlng || 'no latlng';
}

app.get('/addToDb',addToDbHandler);
function addToDbHandler(req,res){
let {name,capital,region,subregion,population,borders,nativename,numericCode,currencies,flag,latlng}=req.query;
let sql='INSERT INTO country_tb (name,capital,region,subregion,population,borders,nativename,numericCode,currencies,flag,latlng) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11);';
let safeVals=[name,capital,region,subregion,population,borders,nativename,numericCode,currencies,flag,latlng];
client.query(sql,safeVals)
.then(()=>{
res.redirect('/favorite');
});
}
app.get('/favorite',favoriteHandler);
function favoriteHandler(req,res){
    let sql='SELECT * FROM country_tb;';
    client.query(sql)
    .then((result)=>{
        res.render('pages/favorite',{data:result.rows,name:'Favorite'});
    })
}

app.get('/details/:details_id',detailsHandler);
function detailsHandler(req,res){
    let param=req.params.details_id;
    let sql='SELECT * FROM country_tb WHERE id=$1'
    let safeVal=[param];
    client.query(sql,safeVal)
    .then((result)=>{
        res.render('pages/details',{val:result.rows[0],name:'Details'})
    })
}

app.put('/update/:update_id',updateHandler);
function updateHandler(req,res){
    let param=req.params.update_id; 
    let {name,capital,region,subregion,population,borders,nativename,numericCode,currencies,flag,latlng}=req.body;
    let sql='UPDATE country_tb SET name=$1,capital=$2,region=$3,subregion=$4,population=$5,borders=$6,nativename=$7,numericCode=$8,currencies=$9,flag=$10,latlng=$11 WHERE id=$12;';
    let safeVals=[name,capital,region,subregion,population,borders,nativename,numericCode,currencies,flag,latlng,param];
    client.query(sql,safeVals)
    .then(()=>{
        res.redirect(`/details/${param}`)
    })
}
app.delete('/delete/:delete_id',deleteHandler);
function deleteHandler(req,res){
    let param=req.params.delete_id;
    let sql='DELETE FROM country_tb WHERE id=$1;';
    let safeVals=[param];
    client.query(sql,safeVals)
    .then(()=>{
        res.redirect(`/favorite`);
    })
}
client.connect()
.then(()=>{
    app.listen(PORT,console.log(`Up & Run on PORT ${PORT}`));
});

function notFoundHandler(req,res){
    res.status(404).send('Not Found Page ERROR 404');
}
function errorHandler(err,req,res){
    res.status(500).send(err);
}
app.use('*',notFoundHandler);
