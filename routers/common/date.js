function created_at() {
    var create_at = new Date()
    return create_at
}

module.exports = created_at;

// function expired_at() {
//     var expired_at = new Date();
//     expired_at.setMinutes(expired_at.getMinutes() + 2); 
//     expired_at = new Date(expired_at); 
// }

// module.exports = expired_at;