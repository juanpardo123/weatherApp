//https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={0439d5779a0b59c6e77eae3f651729db}
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const https = require('https');
const port = 4000;

app.use(bodyParser.urlencoded({extended:true}));

app.get('/', (req,res)=>{
    res.sendFile(__dirname + "/page.html");
})


let style = `<style> 
body{
    background: linear-gradient(182deg, #ff7418ad, #2edcda75);
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-content: center;
    justify-content: center;
    align-items: center;
    height: 100%;
}

.card{

    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-content: center;
    justify-content: center;
    align-items: center;
    background: #21292652;
    border-color: #00000017;
    border-style: solid;
    backdrop-filter: blur(18px);
    padding: 3rem;
    border-radius: 28px;
    box-shadow: 0 0 20px 0px #0000008c;

}

</style>`

app.post('/', (req,res)=>{
    const input = req.body.cityName;
    const apiKey = `0439d5779a0b59c6e77eae3f651729db`;
    var cityName = ``;
    var lat = ``;
    var lon= ``;
    var state = `NC`;
    var country = `US`;
    var firstUrl = ``;
    let zipcode = false;

    console.log(Number(input))
    if(Number.isNaN(Number(input))){
        if(input.includes(',')){
            let arr= input.split(",");
            console.log(arr);
            if(arr.length > 4){
                res.write('<div class="card">')
                res.write('<h1>Not a valid City, state, country format</h1>')
                res.write('<a href="/"> <h2>try again</h2></a> ')
                res.write('</div>')
                res.write(style);
            }else if(arr.length == 3){
               cityName = arr[0].toUpperCase();
               state = arr[1].toUpperCase();
               country =arr[2].toUpperCase();
            }
            else if(arr.length == 2){
             cityName = arr[0].toUpperCase();
               state = arr[1].toUpperCase();
            }
            else if(arr.length == 1){
                cityName = input;
            }

        }else{
            cityName = input.toUpperCase();
        }

       
        firstUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName},${state},${country}&limit=1&appid=${apiKey}`;
        console.log(cityName);
        console.log(state);
        console.log(country);
        console.log(firstUrl)
        zipcode = false;
       
    }else{
       
        firstUrl =`https://api.openweathermap.org/geo/1.0/zip?zip=${input},US&appid=${apiKey}`;
        zipcode = true;
    }
   

    https.get(firstUrl, (response)=>{
        response.on("data",(data)=>{
            const jsondata = JSON.parse(data);
            console.log(jsondata);
            if(jsondata.cod || jsondata.length < 1){
                res.write('<div class="card">')
                res.write('<h1>Not a valid city or zipcode please try again</h1>')
                res.write('<a href="/"> <h2>try again</h2></a> ')
                res.write('</div>')
                res.write(style);
            }else{
                if(zipcode){
                    cityName = jsondata.name;
                    lat = jsondata.lat;
                    lon = jsondata.lon;
                   }else{
                    cityName = jsondata[0].name;
                    lat = jsondata[0].lat;
                    lon = jsondata[0].lon;
                   }
                   
    
                    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;
                    console.log(url);
    
                   https.get(url, (response)=>{
                        response.on("data",(data)=>{
                            const jsondata = JSON.parse(data);
                            console.log(jsondata);
                            const temp = jsondata.main.temp;
                            const des = jsondata.weather[0].description;
                            const icon = jsondata.weather[0].icon;
                            const imageUrl = "http://openweathermap.org/img/wn/" + icon + "@2x.png";
                            res.write(`<div class="card">`);
                            res.write(`<h1> The temp in ${cityName}, ${state}, ${country} is ${temp} degrees</h1>`);
                            res.write(`<p>The weather description is ${des} </p>`);
                            res.write(`<img src="${imageUrl}" >`);
                            res.write(`</div>`)
                            res.write(style);
                
                        })
                    })
        

            }
               
        })});

   
    // const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;
    // console.log(url);
    // https.get(url, (response)=>{
    //     response.on("data",(data)=>{
    //         const jsondata = JSON.parse(data);
    //         console.log(jsondata);
    //         const temp = jsondata.main.temp;
    //         const des = jsondata.weather[0].description;
    //         const icon = jsondata.weather[0].icon;
    //         const imageUrl = "http://openweathermap.org/img/wn/" + icon + "@2x.png";
    //         res.write(`<h1> The temp in ${input} is ${temp} degrees</h1>`);
    //         res.write(`<p>The weather description is ${des} </p>`);
    //         res.write(`<img src="${imageUrl}" >`);

    //     })
    // })
})

app.listen(port, ()=>{
    console.log(`listening on ${port}`)
})