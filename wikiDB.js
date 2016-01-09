var mysql = require('mysql');
var dbconfig = require('../../config/db_config');
var pool = mysql.createPool(dbconfig);
var async = require('async');
module.exports.mariaDB = {
  GetWikitext: function(title){
    var check_ns = title.split(":");
    var ns = 0;
    switch (check_ns[0]) {
      case "틀":
      ns = 1;
      title = check_ns[1];
      break;
      case "분류":
      ns = 2;
      title = check_ns[1];
      break;
      case "파일":
      ns = 3;
      title = check_ns[1];
      break;
      case "리브레위키":
      ns = 6;
      title = check_ns[1];
      break;
      default:
      ns = 0;
      title = title;
      break;
    }
    async.waterfall([
      function(callback){
        pool.getConnection(function(err,connection){
          console.log('wiki SELECT document FROM document WHERE document_id = (SELECT document_id FROM rev WHERE page_id = (SELECT page_id FROM page WHERE namespace = ' + ns + ' AND title = "' + title + '" LIMIT 1) LIMIT 1))');
          var query = connection.query('SELECT document FROM page as p, rev as r, document as d where namespace = ' + ns + ' and title = "' + title + '" and p.page_id = r.page_id and r.document_id = d.document_id', function (err, rows) {
            if(err){
              connection.release();
              throw err;
            }
            if(!rows) {
              var text = undefined;
            } else {
              var text = rows[0];
            }
            callback(null, text);
            connection.release();
          });
        });
      },
      function(arg1, callback){
        var text = "";
        if (arg1 === undefined) {
          text = "Do Not Exists";
        } else {
          text = arg1;
        }
        callback(null, text);
      },
    ],
    // callback (final)
    function(err, result) {
      return result;
    });
  },
  DocExist: function(title){
    var check_ns = title.split(":");
    var ns = 0;
    switch (check_ns[0]) {
      case "틀":
      ns = 1;
      title = check_ns[1];
      break;
      case "분류":
      ns = 2;
      title = check_ns[1];
      break;
      case "파일":
      ns = 3;
      title = check_ns[1];
      break;
      case "리브레위키":
      ns = 6;
      title = check_ns[1];
      break;
      default:
      ns = 0;
      title = title;
      break;
    }
    async.waterfall([
      function(callback){
        pool.getConnection(function(err,connection){
          console.log('wiki2 SELECT document FROM document WHERE document_id = (SELECT document_id FROM rev WHERE page_id = (SELECT page_id FROM page WHERE namespace = ' + ns + ' AND title = "' + title + '" LIMIT 1) LIMIT 1))');
          var query = connection.query('SELECT document FROM page as p, rev as r, document as d where namespace = ' + ns + ' and title = "' + title + '" and p.page_id = r.page_id and r.document_id = d.document_id', function (err, rows) {
            var exist;
            if(err){
              connection.release();
              throw err;
            }
            if(!rows) {
              exist = false;
            } else {
              exist =  true;
            }
            console.log("ret",exist);
            callback(null, exist);
            connection.release();
          });
        });
      }
    ],
    // callback (final)
    function(err, result) {
      return result;
    });
  }
};
