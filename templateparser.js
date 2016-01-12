module.exports.xxxaa = function(pool,cb){
  var text = '';
  pool.getConnection(function(err,connection){
    var query = connection.query('SELECT document FROM page as p, rev as r, document as d where namespace = ' + 0 + ' and title = "' + "TEST" + '" and p.page_id = r.page_id and r.document_id = d.document_id', function (err, rows) {
      if(err){
        connection.release();
        throw err;
      }
      if(rows.length===0) {
        text = "notgood";
      } else {
        console.log("t123",text);
        text = "good";
      }
      connection.release();
      console.log("t",text);
      cb(text);
    });
  });
};
