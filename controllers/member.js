const create_user_id = require('../routers/users/create_user_id')


//회원 생성하기 개발완료
exports.createMember = async (req, res, next) => {
    const user_id = req.body.user_id;
    const height = req.body.height;
    const weight = req.body.weight;
    const muscle = req.body.muscle;
    const body_fat_kg = req.body.body_fat_kg;
    const body_fat_percent = req.body.body_fat_percent;
    const memo = req.body.memo;
    const name = req.body.name;
    const owner = req.body.owner;
    const sex = req.body.sex;
    const voucher = req.body.voucher;
    const body_info_flag = req.body.body_info_flag;
    const voucher_start_num = req.body.voucher_start_num;
    const start_date = req.body.start_date;
    const end_date = req.body.end_date;

    var create_at = new Date()

    
    try {
        //수강권이 없는 경우
        if (voucher.length === 0) {
            const sql = "INSERT INTO member (user_id, created_at, height, memo, name, owner, voucher, sex, shared_date, shared_flag, member_id, complete_flag, weight, muscle, body_fat_kg, body_fat_percent, body_info_flag, voucher_start_num) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING *"
            const values = [user_id, create_at, height, memo, name, user_id, voucher, sex, [create_at], false, create_user_id(20), false, weight, muscle, body_fat_kg, body_fat_percent, body_info_flag, voucher_start_num]
            try {
                pool.connect()
                .then(client => {
                    return client.query(sql, values)
                    .then(row => {
                        client.release()
                        console.log('createMember 호출성공')
                        res.json({status : 200, data : row.rows})
                    })
                    .catch(err => {
                        console.log('createMember 에러 발생',err)
                        res.json({status : 304, desc : err})
                    })
                })
            } catch (err) {
                console.log('createMember 에러 발생',err)
                res.json({status : 304, desc : err})
            }
        } else {
            //수강권이 있는 경우
            const sql = 'SELECT expired_standard FROM voucher WHERE user_id = $1 AND voucher_id = $2'
            const values = [user_id, voucher]
            try {
                pool.connect()
                .then(client => {
                    return client.query(sql, values)
                    .then(row => {
                        client.release()
                        const sql1 = "INSERT INTO member (user_id, created_at, height, memo, name, owner, voucher, sex, shared_date, shared_flag, member_id, complete_flag, weight, muscle, body_fat_kg, body_fat_percent, body_info_flag, voucher_start_num, start_date, end_date, voucher_start_time) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21) RETURNING *"
                        const values1 = [user_id, create_at, height, memo, name, user_id, voucher, sex, [create_at], false, create_user_id(20), false, weight, muscle, body_fat_kg, body_fat_percent, body_info_flag, voucher_start_num, start_date, end_date, create_at]
                        try {
                            pool.connect()
                            .then(client1 => {
                                return client1.query(sql1, values1)
                                .then(row1 => {
                                    client1.release()
                                    console.log('createMember 호출성공')
                                    res.json({status : 200, data : row.rows})
                                })
                                .catch(err => {
                                    console.log('createMember 에러 발생',err)
                                    res.json({status : 304, desc : err})
                                })
                            })
                        } catch (err) {
                            console.log('createMember 에러 발생',err)
                            res.json({status : 304, desc : err})
                        }
                    })
                    .catch(err => {
                        console.log('createMember 에러 발생',err)
                        res.json({status : 304, desc : err}) 
                    })
                })
            } catch (err) {
                console.log(err)
                res.json({status : 304, desc : err})
            }
        }
    }catch(err){
        console.log(err)
        res.json({status : 304, desc : err})
    }
}



//회원리스트 불러오기 
//속도 향상 필요
exports.getMemberList = async (req, res, next) => {
    const user_id = req.query.user_id;
    var date = new Date()
    var hour = date.getHours() + 9
    date.setHours(hour)
    //수업 완료 처리
    try {
        const sql_update_schedule = 'UPDATE "schedule" SET complete_flag = $1, is_open = $2 WHERE writer = $3 AND is_using = $4 AND end_time < $5 AND is_open = $6 AND complete_flag = $7'
        const values_update_schedule = [true, false, user_id, true, date, true, false]
        pool.connect()
        .then(client => {
            return client.query(sql_update_schedule, values_update_schedule)
            .then(row => {
                //row = update 스케쥴 완료처리
                client.release()
                const sql_get_member_voucher_list = 'SELECT "voucher", "member_id", "voucher_start_time", "voucher_history", "voucher_start_num" FROM member WHERE user_id = $1 AND is_using = $2'
                const values_get_member_voucher_list = [user_id, true]
                try {
                    pool.connect()
                    .then(client1 => {
                        return client1.query(sql_get_member_voucher_list, values_get_member_voucher_list)
                        .then(row1 => {
                            //row1 = 멤버 테이블에서 voucher_id, member_id, voucher_start_time 모두 불러오기
                            client1.release()
                            //해당 user_id가 가지고 있는 모든 수강권 정보들 가져오기
                            const sql_get_voucher_info = 'SELECT "total_amount", "voucher_id" FROM voucher WHERE user_id = $1 AND is_using = $2'
                            const values_get_voucher_info = [user_id, true];
                            try {
                                pool.connect()
                                .then(client2 => {
                                    return client2.query(sql_get_voucher_info, values_get_voucher_info)
                                    .then(row2 => {
                                        //row2 = 해당 user_id가 가지고 있는 모든 수강권 정보
                                        client2.release()
                                        var voucher_id_arr = []
                                        var member_id_arr = []
                                        for(i = 0; i < row1.rows.length; i++) {
                                            voucher_id_arr.push(row1.rows[i].voucher)
                                            member_id_arr.push(row1.rows[i].member_id)
                                        }
                                        //모든 수업들 불러오기
                                        const sql_check_amount_of_complete_flag = 'SELECT player, voucher, created_at, complete_flag, is_open FROM schedule WHERE writer = $1 AND player = ANY ($2) AND voucher = ANY ($3) AND is_using = $4'
                                        const values_check_amount_of_complete_flag = [user_id, member_id_arr, voucher_id_arr, true]
                                        try {
                                            pool.connect()
                                            .then(client3 => {
                                                return client3.query(sql_check_amount_of_complete_flag, values_check_amount_of_complete_flag)
                                                .then(row3 => {
                                                    //row3 = 모든 스케쥴 정보
                                                    client3.release()
                                                    //최종적으로 보낼 row1에 total_amount 추가
                                                    for(i = 0; i < row1.rows.length; i++) {
                                                        row1.rows[i].total_amount = 0
                                                    }
                                                    //voucher, member_id가 같으면서 complete_flag가 true이고 수강권 시작 시간이 스케쥴을 만든 시간보다 작은 수업들만 카운팅
                                                    for(i = 0; i < row1.rows.length; i++) {
                                                        for(a = 0; a < row3.rows.length; a++) {
                                                            if(row3.rows[a].voucher === row1.rows[i].voucher && row3.rows[a].player === row1.rows[i].member_id && row1.rows[i].voucher_start_time < row3.rows[a].created_at && row3.rows[a].complete_flag === true) {
                                                                row1.rows[i].total_amount = Number(row1.rows[i].total_amount) + 1
                                                            }
                                                        }
                                                    }
                                                    for(i = 0; i < row1.rows.length; i++) {
                                                        if(Number(row1.rows[i].voucher_start_num) !== 0) {
                                                            row1.rows[i].total_amount = row1.rows[i].total_amount + Number(row1.rows[i].voucher_start_num)
                                                        } 
                                                    }
                                                    //row2에 회원 id 추가
                                                    for(i = 0; i < row1.rows.length; i++) {
                                                        for(a = 0; a < row2.rows.length; a++) {
                                                            if(row1.rows[i].voucher === row2.rows[a].voucher_id) {
                                                                row2.rows[a].member_id = row1.rows[i].member_id
                                                            }
                                                        }
                                                    }
                                                    //만료된 수강권들만 분류 => voucher_total_amount === schedule_total_amount
                                                    var to_update_voucher_arr = []
                                                    var to_update_member_arr = []
                                                    for(i = 0; i < row2.rows.length; i++) {
                                                        for(a = 0; a < row1.rows.length; a++) {
                                                            Number(row2.rows[i].total_amount)
                                                            if(row1.rows[a].voucher === row2.rows[i].voucher_id && row1.rows[a].total_amount === Number(row2.rows[i].total_amount)) {
                                                                to_update_voucher_arr.push(row1.rows[a].voucher)
                                                                to_update_member_arr.push(row1.rows[a].member_id)
                                                            }
                                                        }
                                                    }
                                                    //수강권 만료를 업데이트하는 부분 추후 주석처리 풀어야함, client4 예정
                                                    //여기에 스케쥴들도 다 is_open = flase로 만들어주는 로직 필요
                                                    const sql_to_update_member = 'UPDATE member SET voucher_history = $1, voucher = $2 WHERE voucher = $3 AND is_using = $4 AND member_id = $5'
                                                    var voucher_history = [];
                                                    for(i = 0; i < to_update_voucher_arr.length; i++) {
                                                        for(a = 0; a < row1.rows.length; a++) {
                                                            if(row1.rows[a].voucher === to_update_voucher_arr[i]) {
                                                                if(row1.rows[a].voucher_history === null) {
                                                                    voucher_history.push(row1.rows[a].voucher)
                                                                    var values_to_update_member = [voucher_history, '', to_update_voucher_arr[i], true, to_update_member_arr[i]]
                                                                } else {
                                                                    row1.rows[a].voucher_history.push(row1.rows[a].voucher)
                                                                    var values_to_update_member = [row1.rows[a].voucher_history, '', to_update_voucher_arr[i], true, to_update_member_arr[i]]
                                                                }
                                                            } 
                                                            try {
                                                                pool.connect()
                                                                .then(client4 => {
                                                                    return client4.query(sql_to_update_member, values_to_update_member)
                                                                    .then(row4 => {
                                                                        client4.release()
                                                                    })
                                                                    .catch(err => {
                                                                        console.log('getMemberList 에러 발생1', err)
                                                                        res.json({status : 304, desc : '데이터 베이스 오류'})
                                                                    })
                                                                })
                                                            } catch (err) {
                                                                console.log('getMemberList 에러 발생1', err)
                                                                res.json({status : 304, desc : '데이터 베이스 오류'})
                                                            }
                                                        }
                                                    } 
                                                    //이름, 수강권이름, 수강권 총량, 현재까지 진행된 회차, 색상
                                                    //이름, 수강권이름
                                                    const sql4 = 'SELECT "name", "voucher", "member_id", "voucher_start_num", "voucher_start_time" FROM member WHERE user_id = $1 AND is_using = $2'
                                                    const values4 = [user_id, true]
                                                    try {
                                                        pool.connect()
                                                        .then(client4 => {
                                                            return client4.query(sql4, values4)
                                                            .then(row4 => {
                                                                client4.release()
                                                                try {
                                                                    const sql5 = 'SELECT DISTINCT "voucher" FROM member WHERE user_id = $1 AND is_using = $2'
                                                                    pool.connect()
                                                                    .then(client5 => {
                                                                        return client5.query(sql5, values4)
                                                                        .then(row5 => {
                                                                            client5.release()
                                                                            //총량, 색상
                                                                            var voucher_list = []
                                                                            for (i = 0; i < row5.rows.length; i++) {
                                                                                if(row5.rows[i].voucher === '') {
                                                                                    //console.log('catch!')
                                                                                } else {
                                                                                    voucher_list.push(row5.rows[i].voucher)
                                                                                }
                                                                            }
                                                                            const sql6 = 'SELECT "main_color", "sub_color", "total_amount", "title", "voucher_id" FROM voucher WHERE "voucher_id" = ANY ($1) AND is_using = $2'
                                                                            const values6 = [voucher_list, true]
                                                                            //현재까지 진행된 회차
                                                                            var member_id_list = []
                                                                            const sql7 = 'SELECT amount, player, created_at FROM schedule WHERE writer = $1 AND player = ANY ($2) AND is_using = $3 '
                                                                            for (a = 0; a < row4.rows.length; a++) {
                                                                                member_id_list.push(row4.rows[a].member_id)
                                                                                row4.rows[a].max_amount = Number(row4.rows[a].voucher_start_num)
                                                                            }
                                                                            const values7 = [user_id, member_id_list, true]
                                                                            try {
                                                                                pool.connect()
                                                                                .then(client6 => {
                                                                                    return client6.query(sql6, values6)
                                                                                    .then(row6 => {
                                                                                        client6.release()
                                                                                        try {
                                                                                            pool.connect()
                                                                                            .then(client7 => {
                                                                                                return client7.query(sql7, values7)
                                                                                                .then(row7 => {
                                                                                                    client7.release()
                                                                                                    for (d = 0; d < row7.rows.length; d++) {
                                                                                                        for (e = 0; e < row4.rows.length; e++) {
                                                                                                            if(row7.rows[d].player === row4.rows[e].member_id && row4.rows[e].voucher_start_time < row7.rows[d].created_at) {
                                                                                                                row4.rows[e].max_amount = row4.rows[e].max_amount + 1
                                                                                                            }
                                                                                                        }
                                                                                                    }
                                                                                                    for (b = 0; b < row4.rows.length; b++) {
                                                                                                        for (c = 0; c < row6.rows.length; c++) {
                                                                                                            if(row4.rows[b].voucher === row6.rows[c].voucher_id) {
                                                                                                                row4.rows[b].main_color = row6.rows[c].main_color
                                                                                                                row4.rows[b].sub_color = row6.rows[c].sub_color
                                                                                                                row4.rows[b].total_amount = row6.rows[c].total_amount
                                                                                                                row4.rows[b].title = row6.rows[c].title
                                                                                                            }
                                                                                                        }
                                                                                                    }
                                                                                                    console.log('getMemberList 호출성공')
                                                                                                    res.json({status : 200, data : row4.rows})
                                                                                                })
                                                                                                .catch(err => {
                                                                                                    console.log('getMemberList 에러 발생', err)
                                                                                                    res.json({status : 304, desc : '데이터 베이스 오류'})
                                                                                                })
                                                                                            })
                                                                                        } catch (err) {
                                                                                            console.log('getMemberList 에러 발생', err)
                                                                                            res.json({status : 304, desc : '데이터 베이스 오류'})
                                                                                        }
                                                                                    })
                                                                                    .catch(err => {
                                                                                        console.log('getMemberList 에러 발생', err)
                                                                                        res.json({status : 304, desc : '데이터 베이스 오류'})
                                                                                    })
                                                                                })
                                                                            } catch (err) {
                                                                                console.log('getMemberList 에러 발생', err)
                                                                                res.json({status : 304, desc : '데이터 베이스 오류'})
                                                                            }
                                                                        })
                                                                        .catch(err => {
                                                                            console.log('getMemberList 에러 발생', err)
                                                                            res.json({status : 304, desc : '데이터 베이스 오류'})
                                                                        })
                                                                    })
                                                                } catch (err) {
                                                                    console.log('getMemberList 에러 발생', err)
                                                                    res.json({status : 304, desc : '데이터 베이스 오류'})
                                                                }
                                                            })
                                                            .catch(err => {
                                                                console.log('getMemberList 에러 발생', err)
                                                                res.json({status : 304, desc : '데이터 베이스 오류'})
                                                            })
                                                        })
                                                    } catch (err) {
                                                        console.log(err)
                                                        res.json({status : 304, desc : '데이터 베이스 오류'})
                                                    }
                                                })
                                                .catch(err => {
                                                    console.log('getMemberList 에러 발생', err)
                                                    res.json({status : 304, desc : '데이터 베이스 오류'})
                                                })
                                            })
                                        } catch (err) {
                                            console.log('getMemberList 에러 발생', err)
                                            res.json({status : 304, desc : '데이터 베이스 오류'})
                                        }
                                    })
                                    .catch(err => {
                                        console.log('getMemberList 에러 발생', err)
                                        res.json({status : 304, desc : '데이터 베이스 오류'})
                                    })
                                })
                            } catch (err) {
                                console.log('getMemberList 에러 발생', err)
                                res.json({status : 304, desc : '데이터 베이스 오류'})
                            }
                        })
                        .catch(err => {
                            console.log('getMemberList 에러 발생', err)
                            res.json({status : 304, desc : '데이터 베이스 오류'})
                        })
                    })
                } catch (err) {
                    console.log('getMemberList 에러 발생', err)
                    res.json({status : 304, desc : '데이터 베이스 오류'})
                }
            })
            .catch(err => {
                console.log('getMemberList 에러 발생', err)
                res.json({status : 304, desc : '데이터 베이스 오류'})
            })
        })
    } catch (err) {
        console.log('getMemberList 에러 발생', err)
        res.json({status : 304, desc : '데이터 베이스 오류'})
    }
}


//회원 (검색) 불러오기 개발완료
exports.getMemberListQuery = async (req, res, next) => {
    const user_id = req.query.user_id;
    const query_string = req.query.query_string;
    const query_voucher = JSON.parse(req.query.query_voucher);
    //const query_voucher = req.query.query_voucher;
    
    if (query_string.length === 0 && query_voucher.length === 0) {
        //아무런 검색어, 수강권 필터가 없는경우
        //전체 멤버 호출
        const sql = 'SELECT "name", "voucher", "member_id", "voucher_start_num" FROM member WHERE user_id = $1 AND is_using = $2'
        const values = [user_id, true]
        try {
            pool.connect()
            .then(client => {
                return client.query(sql, values)
                .then(row => {
                    client.release()
                    //멤버들 수강권 호출
                    const sql1 = 'SELECT DISTINCT "voucher" FROM member WHERE user_id = $1 AND is_using = $2'
                    try {
                        pool.connect()
                        .then(client1 => {
                            return client1.query(sql1, values)
                            .then(row1 => {
                                client1.release()
                                //총량, 색상
                                var voucher_list = []
                                //수강권 리스트
                                for (i = 0; i < row1.rows.length; i++) {
                                    if(row1.rows[i].voucher === '') {
                                        //console.log('catch!')
                                    } else {
                                        voucher_list.push(row1.rows[i].voucher)
                                    }
                                }
                                //수강권 정보 호출
                                const sql2 = 'SELECT "main_color", "sub_color", "total_amount", "title", "voucher_id" FROM voucher WHERE "voucher_id" = ANY ($1) AND is_using = $2'
                                const values2 = [voucher_list, true]
                                //현재까지 진행된 회차
                                var member_id_list = []
                                //일정에서 회차 계산
                                const sql3 = 'SELECT amount, player FROM schedule WHERE writer = $1 AND player = ANY ($2) AND is_using = $3'
                                for (a = 0; a < row.rows.length; a++) {
                                    member_id_list.push(row.rows[a].member_id)
                                    row.rows[a].max_amount = Number(row.rows[a].voucher_start_num)
                                }
                                const values3 = [user_id, member_id_list, true]
                                try {
                                    pool.connect()
                                    .then(client2 => {
                                        return client2.query(sql2, values2)
                                        .then(row2 => {
                                            client2.release()
                                            try {
                                                pool.connect()
                                                .then(client3 => {
                                                    return client3.query(sql3, values3)
                                                    .then(row3 => {
                                                        client3.release()
                                                        for (d = 0; d < row3.rows.length; d++) {
                                                            for (e = 0; e < row.rows.length; e++) {
                                                                if(row3.rows[d].player === row.rows[e].member_id) {
                                                                    row.rows[e].max_amount = row.rows[e].max_amount + 1
                                                                }
                                                            }
                                                        }
                                                        for (b = 0; b < row.rows.length; b++) {
                                                            for (c = 0; c < row2.rows.length; c++) {
                                                                if(row.rows[b].voucher === row2.rows[c].voucher_id) {
                                                                    row.rows[b].main_color = row2.rows[c].main_color
                                                                    row.rows[b].sub_color = row2.rows[c].sub_color
                                                                    row.rows[b].total_amount = row2.rows[c].total_amount
                                                                    row.rows[b].title = row2.rows[c].title
                                                                }
                                                            }
                                                        }
                                                        console.log('getMemberListQuery 호출완료')
                                                        res.json({status : 200, data : row.rows})
                                                    })
                                                    .catch(err => {
                                                        console.log('getMemberListQuery 에러 발생',err)
                                                        res.json({status : 304, desc : '데이터 베이스 오류'})
                                                    })
                                                })
                                            } catch (err) {
                                                console.log('getMemberListQuery 에러 발생',err)
                                                res.json({status : 304, desc : '데이터 베이스 오류'})
                                            }
                                        })
                                        .catch(err => {
                                            console.log('getMemberListQuery 에러 발생',err)
                                            res.json({status : 304, desc : '데이터 베이스 오류'})
                                        })
                                    })
                                } catch (err) {
                                    console.log('getMemberListQuery 에러 발생',err)
                                    res.json({status : 304, desc : '데이터 베이스 오류'})
                                }
                            })
                            .catch(err => {
                                console.log('getMemberListQuery 에러 발생',err)
                                res.json({status : 304, desc : '데이터 베이스 오류'})
                            })
                        })
                    } catch (err) {
                        console.log('getMemberListQuery 에러 발생',err)
                        res.json({status : 304, desc : '데이터 베이스 오류'})
                    }
                })
                .catch(err => {
                    console.log('getMemberListQuery 에러 발생',err)
                    res.json({status : 304, desc : '데이터 베이스 오류'})
                })
            })
        } catch (err) {
            console.log(err)
            res.json({status : 304, desc : '데이터 베이스 오류'})
        }
    } else if (query_string.length > 0 && query_voucher.length === 0 ) {
        //검색어는 있지만, 수강권 필터가 없는경우
        const sql = 'SELECT "name", "voucher", "member_id" FROM member WHERE user_id = $1 AND name LIKE $2 AND is_using = $3'
        const values = [user_id, '%' + query_string + '%', true]
        try {
            pool.connect()
            .then(client => {
                return client.query(sql, values)
                .then(row => {
                    client.release()
                    const sql1 = 'SELECT DISTINCT "voucher" FROM member WHERE user_id = $1 AND is_using = $2'
                    const values1 = [user_id, true]
                    try {
                        pool.connect()
                        .then(client1 => {
                            return client1.query(sql1, values1)
                            .then(row1 => {
                                client1.release()
                                var voucher_list = []
                                for (i = 0; i < row1.rows.length; i++) {
                                    if(row1.rows[i].voucher === '') {
                                        //console.log('catch!')
                                    } else {
                                        voucher_list.push(row1.rows[i].voucher)
                                    }
                                }
                                const sql2 = 'SELECT "main_color", "sub_color", "total_amount", "voucher_id", "title" FROM voucher WHERE "voucher_id" = ANY ($1) AND is_using = $2'
                                const values2 = [voucher_list, true]
                                //현재까지 진행된 회차
                                var member_id_list = []
                                const sql3= 'SELECT amount, player FROM schedule WHERE writer = $1 AND player = ANY ($2) AND is_using = $3'
                                for (a = 0; a < row.rows.length; a++) {
                                    member_id_list.push(row.rows[a].member_id)
                                    row.rows[a].max_amount = 0
                                }
                                const values3 = [user_id, member_id_list , true]
                                try {
                                    pool.connect()
                                    .then(client2 => {
                                        return client2.query(sql2, values2)
                                        .then(row2 => {
                                            client2.release()
                                            try {
                                                pool.connect()
                                                .then(client3 => {
                                                    return client3.query(sql3, values3)
                                                    .then(row3 => {
                                                        client3.release()
                                                        for (d = 0; d < row3.rows.length; d++) {
                                                            for (e = 0; e < row.rows.length; e++) {
                                                                if(row3.rows[d].player === row.rows[e].member_id) {
                                                                    row.rows[e].max_amount = row.rows[e].max_amount + 1
                                                                }
                                                            }
                                                        }
                                                        for (b = 0; b < row.rows.length; b++) {
                                                            for (c = 0; c < row2.rows.length; c++) {
                                                                if(row.rows[b].voucher === row2.rows[c].voucher_id) {
                                                                    row.rows[b].main_color = row2.rows[c].main_color
                                                                    row.rows[b].sub_color = row2.rows[c].sub_color
                                                                    row.rows[b].total_amount = row2.rows[c].total_amount
                                                                    row.rows[b].title = row2.rows[c].title
                                                                }
                                                            }
                                                        }
                                                        console.log('getMemberListQuery 호출완료')
                                                        res.json({status : 200, data : row.rows})
                                                    })
                                                    .catch(err => {
                                                        console.log('getMemberListQuery 에러 발생',err)
                                                        res.json({status : 304, desc : '데이터 베이스 오류'})
                                                    })
                                                })
                                            } catch (err) {
                                                console.log('getMemberListQuery 에러 발생',err)
                                                res.json({status : 304, desc : '데이터 베이스 오류'})
                                            }
                                        })
                                        .catch(err => {
                                            console.log('getMemberListQuery 에러 발생',err)
                                            res.json({status : 304, desc : '데이터 베이스 오류'})
                                        })
                                    })
                                } catch (err) {
                                    console.log('getMemberListQuery 에러 발생',err)
                                    res.json({status : 304, desc : '데이터 베이스 오류'})
                                }
                            })
                            .catch(err => {
                                console.log('getMemberListQuery 에러 발생',err)
                                res.json({status : 304, desc : '데이터 베이스 오류'})
                            })
                        })
                    } catch (err) {
                        console.log('getMemberListQuery 에러 발생',err)
                        res.json({status : 304, desc : '데이터 베이스 오류'})
                    }
                })
                .catch(err => {
                    console.log('getMemberListQuery 에러 발생',err)
                    res.json({status : 304, desc : '데이터 베이스 오류'})
                })
            })
        } catch (err) {
            console.log(err)
            res.json({status : 304, desc : '데이터 베이스 오류'})
        }
    } else if (query_string.length === 0 && query_voucher.length > 0 ) {
        //아무런 검색어가 없지만 수강권 필터가 있는 경우
        const sql = 'SELECT "name", "voucher", "member_id" FROM member WHERE user_id = $1 AND voucher = ANY ($2) AND is_using = $3'
        const values = [user_id, query_voucher, true]
        try {
            pool.connect()
            .then(client => {
                return client.query(sql, values)
                .then(row => {
                    client.release()
                    const sql1 = 'SELECT DISTINCT "voucher" FROM member WHERE user_id = $1 AND voucher = ANY ($2) AND is_using = $3'
                    try {
                        pool.connect()
                        .then(client1 => {
                            return client1.query(sql1, values)
                            .then(row1 => {
                                client1.release()
                                var voucher_list = []
                                for (i = 0; i < row1.rows.length; i++) {
                                    if(row1.rows[i].voucher === '') {
                                        //console.log('catch!')
                                    } else {
                                        voucher_list.push(row1.rows[i].voucher)
                                    }
                                }
                                const sql2 = 'SELECT "main_color", "sub_color", "total_amount", "title" FROM voucher WHERE "voucher_id" = ANY ($1) AND is_using = $2'
                                const values2 = [voucher_list, true]
                                var member_id_list = []
                                const sql3 = 'SELECT amount, player FROM schedule WHERE writer = $1 AND player = ANY ($2) AND is_using = $3'
                                for (a = 0; a < row.rows.length; a++) {
                                    member_id_list.push(row.rows[a].member_id)
                                    row.rows[a].max_amount = 0
                                }
                                const values3 = [user_id, member_id_list, true]
                                try {
                                    pool.connect()
                                    .then(client2 => {
                                        return client2.query(sql2, values2)
                                        .then(row2 => {
                                            client2.release()
                                            try {
                                                pool.connect()
                                                .then(client3 => {
                                                    return client3.query(sql3, values3)
                                                    .then(row3 => {
                                                        client3.release()
                                                        for (d = 0; d < row3.rows.length; d++) {
                                                            for (e = 0; e < row.rows.length; e++) {
                                                                if(row3.rows[d].player === row.rows[e].member_id) {
                                                                    row.rows[e].max_amount = row.rows[e].max_amount + 1
                                                                }
                                                            }
                                                        }
                                                        for (b = 0; b < row.rows.length; b++) {
                                                            for (c = 0; c < voucher_list.length; c++) {
                                                                if(row.rows[b].voucher === voucher_list[c]) {
                                                                    row.rows[b].main_color = row2.rows[c].main_color
                                                                    row.rows[b].sub_color = row2.rows[c].sub_color
                                                                    row.rows[b].total_amount = row2.rows[c].total_amount
                                                                    row.rows[b].title = row2.rows[c].title
                                                                }
                                                            }
                                                        }
                                                        console.log('getMemberListQuery 호출완료')
                                                        res.json({status : 200, data : row.rows})
                                                    })
                                                    .catch(err => {
                                                        console.log('getMemberListQuery 에러 발생',err)
                                                        res.json({status : 304, desc : '데이터 베이스 오류'})
                                                    })
                                                })
                                            } catch (err) {
                                                console.log('getMemberListQuery 에러 발생',err)
                                                res.json({status : 304, desc : '데이터 베이스 오류'})
                                            }
                                        })
                                        .catch(err => {
                                            console.log('getMemberListQuery 에러 발생',err)
                                            res.json({status : 304, desc : '데이터 베이스 오류'})
                                        })
                                    })
                                } catch (err) {
                                    console.log('getMemberListQuery 에러 발생',err)
                                    res.json({status : 304, desc : '데이터 베이스 오류'})
                                }
                            })
                            .catch(err => {
                                console.log('getMemberListQuery 에러 발생',err)
                                res.json({status : 304, desc : '데이터 베이스 오류'})
                            })
                        })
                    } catch (err) {
                        console.log('getMemberListQuery 에러 발생',err)
                        res.json({status : 304, desc : '데이터 베이스 오류'})
                    }
                })
                .catch(err => {
                    console.log('getMemberListQuery 에러 발생',err)
                    res.json({status : 304, desc : '데이터 베이스 오류'})
                })
            })
        } catch (err) {
            console.log('getMemberListQuery 에러 발생',err)
            res.json({status : 304, desc : '데이터 베이스 오류'})
        }
    } else if (query_string.length > 0 && query_voucher.length > 0 ) {
        //검색어 및 수강권 필터가 있는 경우
        const sql = 'SELECT "name", "voucher", "member_id" FROM member WHERE user_id = $1 AND voucher = ANY ($2) AND name LIKE $3 AND is_using = $4'
        const values = [user_id, query_voucher, '%' + query_string + '%', true]
        try {
            pool.connect()
            .then(client => {
                return client.query(sql, values)
                .then(row => {
                    client.release()
                    const sql1 = 'SELECT DISTINCT "voucher" FROM member WHERE user_id = $1 AND voucher = ANY ($2) AND is_using = $3'
                    const values1 = [user_id, query_voucher, true];
                    try {
                         pool.connect()
                         .then(client1 => {
                            return client1.query(sql1, values1)
                            .then(row1 => {
                                client.release()
                                var voucher_list = []
                                for (i = 0; i < row1.rows.length; i++) {
                                    if(row1.rows[i].voucher === '') {
                                        //console.log('catch!')
                                    } else {
                                        voucher_list.push(row1.rows[i].voucher)
                                    }
                                }
                                const sql2 = 'SELECT "main_color", "sub_color", "total_amount", "title" FROM voucher WHERE "voucher_id" = ANY ($1) AND is_using = $2'
                                const values2 = [voucher_list, true]
                                //현재까지 진행된 회차
                                var member_id_list = []
                                const sql3 = 'SELECT amount, player FROM schedule WHERE writer = $1 AND player = ANY ($2) AND is_using = $3'
                                for (a = 0; a < row.rows.length; a++) {
                                    member_id_list.push(row.rows[a].member_id)
                                    row.rows[a].max_amount = 0
                                }
                                const values3 = [user_id, member_id_list, true]
                                try {
                                    pool.connect()
                                    .then(client2 => {
                                        return client2.query(sql2, values2)
                                        .then(row2 => {
                                            client2.release()
                                            try {
                                                pool.connect()
                                                .then(client3 => {
                                                    return client3.query(sql3, values3)
                                                    .then(row3 => {
                                                        client3.release()
                                                        for (d = 0; d < row3.rows.length; d++) {
                                                            for (e = 0; e < row.rows.length; e++) {
                                                                if(row3.rows[d].player === row.rows[e].member_id) {
                                                                    row.rows[e].max_amount = row.rows[e].max_amount + 1
                                                                }
                                                            }
                                                        }
                                                        for (b = 0; b < row.rows.length; b++) {
                                                            for (c = 0; c < voucher_list.length; c++) {
                                                                if(row.rows[b].voucher === voucher_list[c]) {
                                                                    row.rows[b].main_color = row2.rows[c].main_color
                                                                    row.rows[b].sub_color = row2.rows[c].sub_color
                                                                    row.rows[b].total_amount = row2.rows[c].total_amount
                                                                    row.rows[b].title = row2.rows[c].title
                                                                }
                                                            }
                                                        }
                                                        console.log('getMemberListQuery 호출완료')
                                                        res.json({status : 200, data : row.rows})
                                                    })
                                                    .catch(err => {
                                                        console.log('getMemberListQuery 에러 발생',err)
                                                        res.json({status : 304, desc : '데이터 베이스 오류'})
                                                    })
                                                })
                                            } catch (err) {
                                                console.log('getMemberListQuery 에러 발생',err)
                                                res.json({status : 304, desc : '데이터 베이스 오류'})
                                            }
                                        })
                                        .catch((err => {
                                            console.log('getMemberListQuery 에러 발생',err)
                                            res.json({status : 304, desc : '데이터 베이스 오류'})
                                        }))
                                    })
                                } catch (err) {
                                    console.log('getMemberListQuery 에러 발생',err)
                                    res.json({status : 304, desc : '데이터 베이스 오류'})
                                }
                            })
                            .catch(err => {
                                console.log('getMemberListQuery 에러 발생',err)
                                res.json({status : 304, desc : '데이터 베이스 오류'})
                            })
                         })
                    } catch (err) {
                        console.log('getMemberListQuery 에러 발생',err)
                        res.json({status : 304, desc : '데이터 베이스 오류'})
                    }
                })
                .catch(err => {
                    console.log('getMemberListQuery 에러 발생',err)
                    res.json({status : 304, desc : '데이터 베이스 오류'})
                })
            })
        } catch (err) {
            console.log(err)
            res.json({status : 304, desc : '데이터 베이스 오류'})
        }
    }
}



//회원리스트 불러오기 (필터) 개발완료
exports.getMemberListFilter = async (req, res, next) => {
    //이름, 수강권이름, 수강권 총량, 현재까지 진행된 회차, 색상
    const user_id = req.query.user_id;
    const filter = req.query.filter;
    //수강권 없는 회원 
    if (filter === '1') {
        const sql = 'SELECT name, member_id FROM member WHERE user_id = $1 AND voucher = $2 AND is_using = $3'
        const values = [user_id, '', true]
        try {
            pool.connect()
            .then(client => {
                return client.query(sql, values)
                .then(row => {
                    client.release()
                    res.json({status : 200, data : row.rows})
                })
                .catch(err => {
                    console.log('getMemberListFilter 에러 발생', err)
                    res.json({status : 304, desc : err})
                })
            })
        } catch (err) {
            console.log('getMemberListFilter 에러 발생', err)
            res.json({status : 304, desc : err})
        }
    } else {
        const sql = 'SELECT "title", "voucher_id", "total_amount", "main_color", "sub_color" FROM voucher WHERE user_id = $1 AND is_using = $2'
        const values = [user_id, true];
        try {
            pool.connect()
            .then(client => {
                return client.query(sql, values)
                .then(row => {
                    client.release()
                    var voucher_id = []
                    for (a = 0; a < row.rows.length; a++) {
                        voucher_id.push(row.rows[a].voucher_id)
                    }
                    const sql1 = 'SELECT "name", "member_id", "voucher" FROM member WHERE user_id = $1 AND voucher = ANY ($2) AND is_using = $3'
                    const values1 = [user_id, voucher_id, true];
                    try {
                        pool.connect()
                        .then(client1 => {
                            return client1.query(sql1, values1)
                            .then(row1 => {
                                client1.release()
                                var member_id_list = []
                                for (b = 0; b < row1.rows.length; b++) {
                                    member_id_list.push(row1.rows[b].member_id)
                                    row1.rows[b].max_amount = 0
                                }
                                const sql2 = 'SELECT amount, player FROM schedule WHERE writer = $1 AND player = ANY ($2) AND is_using = $3'
                                const values2 = [user_id, member_id_list, true]
                                try {
                                    pool.connect()
                                    .then(client2 => {
                                        return client2.query(sql2, values2)
                                        .then(row2 => {
                                            client2.release()
                                            for (c = 0; c < row1.rows.length; c++) {
                                                for (d = 0; d < row2.rows.length; d++) {
                                                    if (row1.rows[c].member_id === row2.rows[d].player) {
                                                        row1.rows[c].max_amount = row1.rows[c].max_amount + 1
                                                    }
                                                }
                                                for (e = 0; e < row.rows.length; e++) {
                                                    if(row1.rows[c].voucher === row.rows[e].voucher_id) {
                                                        row1.rows[c].main_color = row.rows[e].main_color
                                                        row1.rows[c].sub_color = row.rows[e].sub_color
                                                        row1.rows[c].title = row.rows[e].title
                                                        row1.rows[c].total_amount = row.rows[e].total_amount
                                                    }
                                                }
                                            }
                                            console.log('getMemberListFilter 호출 성공')
                                            res.json({status : 200, data : row1.rows})
                                        })
                                        .catch(err => {
                                            console.log('getMemberListFilter 에러 발생', err)
                                            res.json({status : 304, desc : err})
                                        })
                                    })
                                } catch (err) {
                                    console.log('getMemberListFilter 에러 발생', err)
                                    res.json({status : 304, desc : err})
                                }
                            })
                            .catch(err => {
                                console.log('getMemberListFilter 에러 발생', err)
                                res.json({status : 304, desc : err})
                            })
                        })
                    } catch (err) {
                        console.log('getMemberListFilter 에러 발생', err)
                        res.json({status : 304, desc : err})
                    }
                })
                .catch(err => {
                    console.log('getMemberListFilter 에러 발생', err)
                    res.json({status : 304, desc : err})
                })
            })
        } catch (err) {
            console.log(err)
            res.json({status : 304, desc : err})
        }
    }
}




//회원 정보보기 확인필요
//되다가 안된다 확인필요
exports.getMemberInfo = async (req, res, next) => {
    const user_id = req.query.user_id;
    const member_id = req.query.member_id;
    const voucher_id = req.query.voucher_id;
    var date = new Date()
    var hour = date.getHours() + 9
    date.setHours(hour)
    try {
        const sql = 'SELECT name, member_id, voucher, voucher_history, shared_flag, created_at, start_date, end_date, sex, height, memo, weight, muscle, body_fat_kg, body_fat_percent, body_info_flag, voucher_start_num FROM member WHERE user_id = $1 AND member_id = $2 AND voucher = $3 AND is_using = $4'
        const values = [user_id, member_id, voucher_id, true];
        pool.connect()
        .then(client => {
            return client.query(sql, values)
            .then(row => {
                client.release()
                var voucher_history = []
                if (row.rows[0].voucher_history === null) {
                    
                } else {
                    for (a = 0; a < row.rows[0].voucher_history.length; a++) {
                        voucher_history.push(row.rows[0].voucher_history[a])
                    }
                }
                if (voucher_id.length === 0) {
                    try {
                        const sql1 = "SELECT voucher_id, title, total_amount, main_color, sub_color, class_time, expired_standard FROM voucher WHERE user_id = $1 AND voucher_id = ANY ($2) AND is_using = $3"
                        const values1 = [user_id, voucher_history, true]
                        pool.connect()
                        .then(client1 => {
                            return client1.query(sql1, values1)
                            .then(row1 => {
                                client1.release()
                                if(row.rows[0].voucher_history === null) {
                                    row.rows[0].voucher_history_data = []
                                } else {
                                    var voucher_history_data = []
                                    for(i = 0; i < row.rows[0].voucher_history.length; i++) {
                                        for(a = 0; a < row1.rows.length; a++) {
                                            if(row.rows[0].voucher_history[i] === row1.rows[a].voucher_id) {
                                                voucher_history_data.push(row1.rows[a])
                                            }
                                        }
                                    }
                                    row.rows[0].voucher_history_data = voucher_history_data
                                }
                                row.rows[0].now_voucher_info = []
                                console.log('getMemberInfo 호출 성공')
                                res.json({status : 200, data : row.rows})
                            })
                            .catch(err => {
                                console.log('getMemberInfo 에러 발생', err)
                                res.json({status : 304, desc : err})
                            })
                        })
                    } catch (err) {
                        console.log('getMemberInfo 에러 발생', err)
                        res.json({status : 304, desc : err})
                    }
                } else {
                //수강권 색상, 총 회차, 유효기간, 수강권 이름
                const sql1 = "SELECT title, total_amount, main_color, sub_color, class_time, expired_standard FROM voucher WHERE user_id = $1 AND voucher_id = $2 AND is_using = $3"
                const values1 = [user_id, voucher_id, true]
                try {
                    pool.connect()
                    .then(client1 => {
                        return client1.query(sql1, values1)
                        .then(row1 => {
                            client1.release()
                            row.rows[0].now_voucher_info = row1.rows
                            const sql2 = "SELECT voucher_id, title, total_amount, main_color, sub_color, class_time, expired_standard FROM voucher WHERE user_id = $1 AND voucher_id = ANY ($2) AND is_using = $3"
                            const values2 = [user_id, voucher_history, true]
                            try {
                                pool.connect()
                                .then(client2 => {
                                    return client2.query(sql2, values2)
                                    .then(row2 => {
                                        client2.release()
                                        if(row.rows[0].voucher_history === null) {
                                            row.rows[0].voucher_history_data = []
                                        } else {
                                            var voucher_history_data = []
                                            for(i = 0; i < row.rows[0].voucher_history.length; i++) {
                                                for(a = 0; a < row2.rows.length; a++) {
                                                    if(row.rows[0].voucher_history[i] === row2.rows[a].voucher_id) {
                                                        voucher_history_data.push(row2.rows[a])
                                                    }
                                                }
                                            }
                                            row.rows[0].voucher_history_data = voucher_history_data
                                        }
                                        const sql3 = 'SELECT MAX(amount) as amount FROM schedule WHERE writer = $1 AND player = $2 AND voucher = $3 AND is_using = $4'
                                        const values3 = [user_id, member_id, row.rows[0].voucher, true] 
                                        try {
                                            pool.connect()
                                            .then(client3 => {
                                                return client3.query(sql3, values3)
                                                .then(row3 => {
                                                    client3.release()
                                                    const sql4 = 'SELECT end_time, schedule_id FROM schedule WHERE writer = $1 AND player = $2 AND voucher = $3 AND is_using = $4'
                                                    const values4 = [user_id, member_id, row.rows[0].voucher, true] 
                                                    try {
                                                        pool.connect()
                                                        .then(client4 => {
                                                            return client4.query(sql4, values4)
                                                            .then(row4 => {
                                                                client4.release()
                                                                row.rows[0].now_voucher_info[0].voucher = row.rows[0].voucher
                                                                if (row3.rows[0].amount === null) {
                                                                    row.rows[0].now_voucher_info[0].amount = Number(row.rows[0].voucher_start_num)
                                                                } else {
                                                                    row.rows[0].now_voucher_info[0].amount = Number(row3.rows[0].amount)
                                                                }
                                                                var complete_schedule = []
                                                                var appointment_schedule = []
                                                                for (i = 0; i < row4.rows.length; i++) {
                                                                    if(row4.rows[i].end_time > date) {
                                                                        appointment_schedule.push(row4.rows[i].schedule_id)
                                                                    } else {
                                                                        complete_schedule.push(row4.rows[i].schedule_id)
                                                                    }
                                                                }
                                                                row.rows[0].now_voucher_info = row1.rows
                                                                row.rows[0].complete_schedule = complete_schedule.length
                                                                row.rows[0].appointment_schedule = appointment_schedule.length
                                                                console.log('getMemberInfo 호출 성공')
                                                                res.json({status : 200, data : row.rows})
                                                            })
                                                        })
                                                    } catch (err) {
                                                        console.log('getMemberInfo 에러 발생', err)
                                                        res.json({status : 304, desc : err})
                                                    }

                                                })
                                                .catch(err => {
                                                    console.log('getMemberInfo 에러 발생', err)
                                                    res.json({status : 304, desc : err})
                                                })
                                            })
                                        } catch (err) {
                                            console.log('getMemberInfo 에러 발생', err)
                                            res.json({status : 304, desc : err})
                                        }
                                    })
                                    .catch(err => {
                                        console.log('getMemberInfo 에러 발생', err)
                                        res.json({status : 304, desc : err})
                                    })
                                })
                            } catch (err) {
                                console.log('getMemberInfo 에러 발생', err)
                                res.json({status : 304, desc : err})
                            }
                        })
                        .catch(err => {
                            console.log('getMemberInfo 에러 발생', err)
                            res.json({status : 304, desc : err})
                        })
                    })
                } catch (err) {
                    console.log('getMemberInfo 에러 발생', err)
                    res.json({status : 304, desc : err})
                }
                }
            })
            .catch(err => {
                console.log('getMemberInfo 에러 발생', err)
                res.json({status : 304, desc : err})
            })
        })
    } catch (err) {
        console.log('getMemberInfo 에러 발생', err)
        res.json({status : 304, desc : err})
    }
}



//회원 정보 수정하기
//스케쥴 삭제할 때 이번 수강권 인 경우의 스케쥴만 삭제
exports.updateMemberInfo = async (req, res, next) => {
    const user_id = req.body.user_id;
    const member_id = req.body.member_id;
    const voucher_id = req.body.voucher_id;
    const start_date = req.body.start_date;
    const end_date = req.body.end_date;
    const voucher_start_num = req.body.voucher_start_num;
    const name = req.body.name;
    const sex = req.body.sex;
    const memo = req.body.memo;
    const height = req.body.height;
    const weight = req.body.weight;
    const muscle = req.body.muscle;
    const body_fat_kg = req.body.body_fat_kg;
    const body_fat_percent = req.body.body_fat_percent;
    const body_info_flag = req.body.body_info_flag
    var date = new Date()
    // var hour = date.getHours() + 9
    // date.setHours(hour)
    console.log(voucher_start_num)
    const sql = 'SELECT voucher, voucher_history, voucher_start_time FROM member WHERE member_id = $1 AND is_using = $2'
    const values = [member_id, true]
    try {
        pool.connect()
        .then(client => {
            return client.query(sql, values)
            .then(row => {
                client.release()
                //|| row.rows[0].voucher_history.length > 0
                //가지고 있던 수강권이랑 새롭게 들어온 api수강권이 다른경우
                if(row.rows[0].voucher.length > 0 && voucher_id !== row.rows[0].voucher) {
                    const sql1 = 'UPDATE "member" SET height = $1, name = $2, sex = $3, memo = $4, weight = $5, muscle = $6, body_fat_kg = $7, body_fat_percent = $8, body_info_flag = $9, voucher = $10, start_date = $11, end_date = $12, voucher_start_num = $13, voucher_start_time = $14 WHERE user_id = $15 AND member_id = $16 AND is_using = $17'
                    const values1 = [height, name, sex, memo, weight, muscle, body_fat_kg, body_fat_percent, body_info_flag, voucher_id, start_date, end_date, voucher_start_num, date, user_id, member_id, true]
                    try {
                        pool.connect()
                        .then(client1 => {
                            return client1.query(sql1, values1)
                            .then(row1 => {
                                client1.release()
                                const sql2 = 'DELETE FROM "schedule" WHERE player = $1 AND writer = $2 AND created_at > $3'
                                const values2 = [member_id, user_id, row.rows[0].voucher_start_time]
                                try {
                                    pool.connect()
                                    .then(client2 => {
                                        return client2.query(sql2, values2)
                                        .then(row2 => {
                                            client2.release()
                                            console.log('updateMemberInfo 멤버 정보 업데이트 성공')
                                            res.json({status : 200, data : row.row})
                                        })
                                        .catch(err => {
                                            console.log('updateMemberInfo 에러 발생', err)
                                            res.json({status : 304, desc : err})
                                        })
                                    })
                                } catch(err) {
                                    console.log('updateMemberInfo 에러 발생', err)
                                    res.json({status : 304, desc : err})
                                }
                            })
                            .catch(err => {
                                console.log('updateMemberInfo 에러 발생', err)
                                res.json({status : 304, desc : err})
                            })
                        })
                    } catch (err) {
                        console.log('updateMemberInfo 에러 발생', err)
                        res.json({status : 304, desc : err})
                    }
                } else {
                    const sql1 = 'UPDATE "member" SET height = $1, name = $2, sex = $3, memo =$4, weight = $5, muscle = $6, body_fat_kg = $7, body_fat_percent = $8, body_info_flag = $9, voucher = $10, start_date = $11, end_date = $12, voucher_start_num = $13, voucher_start_time = $14 WHERE user_id = $15 AND member_id = $16 AND is_using = $17'
                    const values1 = [height, name, sex, memo, weight, muscle, body_fat_kg, body_fat_percent, body_info_flag, voucher_id, start_date, end_date, voucher_start_num, date, user_id, member_id, true]
                    try {
                        pool.connect()
                        .then(client1 => {
                            return client1.query(sql1, values1)
                            .then(row => {
                                client1.release()
                                const sql2 = 'UPDATE "schedule" SET title = $1 WHERE player = $2 AND is_using = $3 AND voucher = $4'
                                const values2 = [name, member_id, true, voucher_id];
                                try {
                                    pool.connect()
                                    .then(client2 => {
                                        return client2.query(sql2, values2)
                                        .then(row2 => {
                                            client2.release()
                                            console.log('updateMemberInfo 멤버 정보 업데이트 성공')
                                            res.json({status : 200, data : row.row})
                                        })
                                        .catch(err => {
                                            console.log('updateMemberInfo 에러 발생', err)
                                            res.json({status : 304, desc : err})
                                        })
                                    })
                                } catch (err) {
                                    console.log('updateMemberInfo 에러 발생', err)
                                    res.json({status : 304, desc : err})
                                }
                            })
                            .catch(err => {
                                console.log('updateMemberInfo 에러 발생', err)
                                res.json({status : 304, desc : err})
                            })
                        })
                    } catch (err) {
                        console.log('updateMemberInfo 에러 발생', err)
                        res.json({status : 304, desc : err})
                    }
                }
            })
            .catch(err => {
                console.log('updateMemberInfo 에러 발생', err)
                res.json({status : 304, desc : err})
            })
        })
    } catch(err) {
        console.log('updateMemberInfo 에러 발생', err)
        res.json({status : 304, desc : err})
    }
}



//회원 삭제하기 개발완료(작은 에러 발생)
exports.deleteMember = async (req, res, next) => {
    const user_id = req.body.user_id;
    const member_id = req.body.member_id;

    const sql = 'UPDATE "member" SET "is_using" = $1 WHERE user_id = $2 AND member_id = $3'
    //const sql = 'DELETE FROM "member" WHERE voucher = $1'
    const values = [false, user_id, member_id]
    try {
        pool.connect()
        .then(client => {
            return client.query(sql, values)
            .then(row => {
                client.release()
                const sql1 = 'UPDATE "schedule" SET "is_using" = $1 WHERE writer = $2 AND player = $3'
                const values1 = [false, user_id, member_id]
                try {
                    pool.connect()
                    .then(client1 => {
                        return client1.query(sql1, values1)
                        .then(row1 => {
                            client1.release()
                            console.log('deleteMember 호출성공')
                            res.json({status : 200, data : '삭제성공'})
                        })
                        .catch(err => {
                            console.log(err, 'deleteMember 에러')
                            res.json({status : 304, desc : err})
                        }) 
                    })
                } catch (err) {
                    console.log(err, 'deleteMember 에러')
                    res.json({status : 304, desc : err})
                }
            })
            .catch(err => {
                console.log(err, 'deleteMember 에러')
                res.json({status : 304, desc : err})
            })
        })
    } catch (err) {
        console.log(err, 'deleteMember 에러 발생')
        res.json({status : 304, desc : err})
    }
}



//회원 메모 수정하기 개발완료
exports.updateMemberMemo = async (req, res, next) => {
    const user_id = req.body.user_id;
    const member_id = req.body.member_id;
    const memo = req.body.memo;

    try {
        const sql = 'UPDATE member SET "memo" = $1 WHERE user_id = $2 AND member_id = $3 AND is_using = $4'
        const values = [memo, user_id, member_id, true]
        pool.connect()
        .then(client => {
            return client.query(sql, values)
            .then(row => {
                client.release()
                console.log('updateMemberMemo 호출성공')
                res.json({status : 200, data : row.rows})
            })
        })
        .catch(err => {
            console.log('updateMemberMemo 에러 발생' ,err)
            res.json({status : 304, desc : err})
        })
    } catch (err) {
        console.log('updateMemberMemo 에러 발생' ,err)
        res.json({status : 304, desc : err})
    }
}




//내정보 보기
exports.getMemberMyInfo = async (req, res, next) => {
    const user_id = req.query.user_id;
    const sql = 'SELECT user_nickname, created_at, email, register_type FROM users WHERE user_id = $1 AND is_using = $2'
    const values = [user_id, true]
    try {
        pool.connect()
        .then(client => {
            return client.query(sql, values)
            .then(row => {
                client.release()
                console.log('getMemberMyInfo 호출 성공')
                res.json({status : 200, data : row.rows})
            })
            .catch(err => {
                console.log('getMemberMyInfo 에러 발생')
                res.json({status : 304, desc : err})
            })
        })
    } catch (err) {
        console.log('getMemberMyInfo 에러 발생')
        res.json({status : 304, desc : err})
    }
}

