exports.getToolQuery = async (req, res) => {
    var query = req.query.query
    query = "" + query + ""
    query = query.split(',')


    const sql = 'SELECT keyword, title, description, url, img_url FROM tool WHERE is_using = $1 ORDER BY score'
    const values = [true]
    try {
        pool.connect()
        .then(client => {
            return client.query(sql, values)
            .then(row => {
                client.release()
                var arr1 = []
                console.log(row.rows[1].keyword.includes(query[0]))
                for(i = 0; i < query.length; i++) {
                    for(a = 0; a < row.rows.length; a++) {
                        row.rows[a].keyword = row.rows[a].keyword + ''
                        if(row.rows[a].keyword.includes(query[i])) {
                            var arr2 = {
                                title : row.rows[a].title,
                                description : row.rows[a].description,
                                url : row.rows[a].url,
                                img_url : row.rows[a].img_url
                            }
                            arr1.push(arr2)
                        } else {

                        }
                    }
                }
                console.log('getToolHome 호출성공')
                res.json({stauts : 200, data : arr1})
            })
            .catch(err => {
                console.log(err)
                res.json({status : 304, desc : err})
            })
        })
    } catch (err) {
        console.log(err)
        res.json({status : 304, desc : err})
    }

}

/**
 * @swagger
 * paths:
 *  /tool/getToolQuery:
 *   get:
 *    tags:
 *    - Tool
 *    description: 조건 별 도구 쿼리
 *    content:
 *      application/x-www-form-urlencoded:
 *    parameters:
 *    - in: body
 *      name: body
 *      required: true
 *      schema:
 *       properties:
 *        query:
 *         type: string
 *        
 *         
 *
 *    responses:
 *     200:
 *      description: 호출 성공
 *      schema:
 *       properties:
 *        message:
 *         type: string
 *     304:
 *      description: 호출 실패
 *      schema:
 *       properties:
 *        message:
 *         type: string
 *
 */

exports.getToolHome = async (req, res) => {
    var query = req.query.query
    query = "" + query + ""
    query = query.split(' ')


    const sql = 'SELECT keyword, title, description, url, img_url FROM tool WHERE is_using = $1 ORDER BY score'
    const values = [true]
    try {
        pool.connect()
        .then(client => {
            return client.query(sql, values)
            .then(row => {
                client.release()
                var arr1 = []
                for(i = 0; i < query.length; i++) {
                    for(a = 0; a < row.rows.length; a++) {
                        row.rows[a].keyword = row.rows[a].keyword + ''
                        if(row.rows[a].keyword.includes(query[i])) {
                            var arr2 = {
                                title : row.rows[a].title,
                                description : row.rows[a].description,
                                url : row.rows[a].url,
                                img_url : row.rows[a].img_url
                            }
                            arr1.push(arr2)
                        } else {

                        }
                    }
                }
                console.log('getToolHome 호출성공')
                res.json({stauts : 200, data : arr1})
            })
            .catch(err => {
                console.log(err)
                res.json({status : 304, desc : err})
            })
        })
    } catch (err) {
        console.log(err)
        res.json({status : 304, desc : err})
    }
}

/**
 * @swagger
 * paths:
 *  /tool/getToolHome:
 *   get:
 *    tags:
 *    - Tool
 *    description: 홈 도구 쿼리
 *    content:
 *      application/x-www-form-urlencoded:
 *    parameters:
 *    - in: body
 *      name: body
 *      required: true
 *      schema:
 *       properties:
 *        query:
 *         type: string
 *        
 *         
 *
 *    responses:
 *     200:
 *      description: 호출 성공
 *      schema:
 *       properties:
 *        message:
 *         type: string
 *     304:
 *      description: 호출 실패
 *      schema:
 *       properties:
 *        message:
 *         type: string
 *
 */