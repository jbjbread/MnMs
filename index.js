const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const path = require('path');
const { swaggerUi, specs } = require('./swagger/swagger');
const nunjucks = require('nunjucks');
const session = require('express-session')
const fs = require('fs')
const jwt = require('jsonwebtoken')
const cors = require('cors')
//var Client = require('es')

const { Client } = require('@elastic/elasticsearch')




//세션 세팅
app.use(session({
    secret:'aaa',
    resave:true,
    secure:false,
    saveUninitialized:false,
}))
app.use(cors({
    origin: '*'
}));

const authRoute = require('./routers/auth/index');
const toolRoute = require('./routers/tool/index')


//create_user_id
const create_user_id = require('./routers/users/create_user_id');

const generateAccessToken = require('./routers/auth/jwt_access')

//common
const date = require('./routers/common/date')

//db 연결
const pool = require('./routers/database/query')
const connect = require('./routers/database/connect');
const { json } = require('body-parser');
const { default: axios, all } = require('axios');


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'views')));
connect.connectDB();

require('dotenv').config();


app.set('view engine', 'ejs');
app.set('views', 'views');


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
//app.use( express.static( path.join(__dirname, 'index.html')))
app.use('/auth', authRoute);
app.use('/tool', toolRoute)



// var client = new elasticsearch.Client({
//     host: 'https://daunjung.kb.us-central1.gcp.cloud.es.io:9243'
//   });

// var client = new Client({
//     cloud: { id: 'DaunJung:dXMtY2VudHJhbDEuZ2NwLmNsb3VkLmVzLmlvOjQ0MyRlYTNiYmI0YzllODQ0OTEwYjk0ZDgxYjIwMzllMDNiMiQ0YzNhY2M4YzYwMDM0OGFmYjJlMWMzOTEyZmVlYzRhYg==' },
//     auth: { apiKey: 'UzRkT0ZZZ0JHeFRLNXZ2ZFRCT3E6eUF6eERCVTVRclNvR3E1eTZLT3JUUQ==' }
// })

const client = new Client({
    cloud : {id : 'DaunJung:dXMtY2VudHJhbDEuZ2NwLmNsb3VkLmVzLmlvOjQ0MyRlYTNiYmI0YzllODQ0OTEwYjk0ZDgxYjIwMzllMDNiMiQ0YzNhY2M4YzYwMDM0OGFmYjJlMWMzOTEyZmVlYzRhYg=='},
    auth: {
      apiKey: 'RVJkLUZZZ0I0VGpvNnA4c1lpQVc6UDlQT2V5LWRRRkNROTZOZnBaU1c0Zw=='
    }
  })

app.get('/test', (req, res) => {

    //엘라스틱 서치 api 호출
    try {
        const result = client.search({
            index: 'search-future', 
            body : {
                query : {
                    //match로 검색 가능
                    //match_all로 모든데이터 호출
                    match_all : {} 
                },
                size : 10000
            },
          }).then(row => {
                console.log(row.hits.hits[0]._source)
                var test = []
                for(i = 0; i < row.hits.hits.length; i++) {
                    test.push(row.hits.hits[i]._source.headings)
                }          
                res.json({status : 200, data : row.hits.hits[0]._source.headings.length})
        })
        .catch(err => {
            console.log(err);
        })
        console.log(result);
      } catch (err) {
        console.error(err);
      }
})

app.get('/testtest', (req, res) => {
    try {
        const result = client.update({
            index: 'search-future',
            id: '645f6bff3bca4a3a65ac1659',
            doc: {
              sample : 'false'
            }
          }).then(row => {
                          
                res.json({status : 200, data : row})
        })
        .catch(err => {
            console.log(err);
        })
        console.log(result);
      } catch (err) {
        console.error(err);
      }
})

app.get('/put', (req, res) => {
    const created_at = new Date()
    const sql = 'INSERT INTO tool (title, description, created_at, keyword, url, is_using, score, img_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)';
    try {
        const result = client.search({
            index: 'search-future', 
            body : {
                query : {
                    match_all : {} 
                },
                size : 10000
            },
        }).then(row => {
            var arr1 = []
            for(i = 0; i < row.hits.hits.length; i++) {
                var keyword = []
                if(row.hits.hits[i]._source.headings === undefined) {
                    keyword = []
                } else {
                    for(a = 0; a < row.hits.hits[i]._source.headings.length; a++) {
                        keyword.push(row.hits.hits[i]._source.headings[a])
                    }
                }
                console.log(keyword)
                var arr2 = {
                    title : row.hits.hits[i]._source.title,
                    desc : row.hits.hits[i]._source.meta_description,
                    created_at : created_at,
                    keyword : keyword + '',
                    url : row.hits.hits[i]._source.url,
                    is_using : true,
                    score : 0,
                    img_url : 'https://i.ibb.co/19sp6Zy/BK-div.png'
                }
                arr1.push(arr2)
            }
            
            arr1.forEach((data) => {
                pool.query(sql, [data.title, data.desc, data.created_at, data.keyword, data.url, data.is_using, data.score, data.img_url], (err, row1) => {
                    console.log(err ? err.stack : row1.rows)
                })
            })          
            res.json({status : '제발!'})
        })
        .catch(err => {
            console.log(err);
        })
        } catch (err) {
        console.error(err);
        }
})

app.get('/insert', (req, res) => {
    const sql = 'DELETE FROM tool';
    const values = [1,1,[1],1,true,1,1]
    pool.query(sql).catch(err => {
        console.log(err);
    })
    res.json({status : 200})
})

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;
  });