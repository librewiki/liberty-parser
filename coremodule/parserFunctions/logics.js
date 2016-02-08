var math = require('mathjs');
var mysql = require('mysql');
var pageExist = require('../../../../modules/pageExist.js');
// #if, #ifeq, #ifexist, #ifexpr
var pfs = {
  s_if : {
    use :
    function(wikiparser) {
      var pfList = wikiparser.pfList;
      pfList.push(['#if',this.execute]);
    },
    execute :
    function(wikiparser, template) {
      console.log("asdf",template);
      var text = template[3].split(':')[1].trim();
      if (typeof template[4] !== 'string') template[4] = '';
      if (typeof template[5] !== 'string') template[5] = '';
      if (text) {
        template[0] = template[4].trim();
      } else {
        template[0] = template[5].trim();
      }
      console.log("asdf1",template);
      return;
    }
  },
  s_ifeq : {
    use :
    function(wikiparser) {
      var pfList = wikiparser.pfList;
      pfList.push(['#ifeq',this.execute]);
    },
    execute :
    function(wikiparser, template) {
      var text1 = template[3].split(':')[1].trim();
      if (typeof template[4] !== 'string'){
        template[0] = 'error';
        return;
      }
      var text2 = template[4].trim();
      if (typeof template[5] !== 'string') template[5] = '';
      if (typeof template[6] !== 'string') template[6] = '';
      if (text1 == text2) {
        template[0] = template[5].trim();
      } else {
        template[0] = template[6].trim();
      }
      return;
    }
  },
  s_ifexist : {
    use :
    function(wikiparser) {
      var pfList = wikiparser.pfList;
      pfList.push(['#ifexist',this.execute]);
    },
    execute :
    function(wikiparser, template) {
      var text1 = template[3].split(':')[1].trim();
      if (typeof template[4] !== 'string') template[4] = '';
      if (typeof template[5] !== 'string') template[5] = '';
      //async function cannot execute directly.
      template[0] = function(connection, callback) {
        pageExist(connection, text1, function(err, connection, result) {
          if (err) {
            template[0] = err+'';
            return callback(err);
          }
          if (result) {
            template[0] = template[4].trim();
            return callback(null);
          } else {
            template[0] = template[5].trim();
            return callback(null);
          }
        });
      };
      return;
    }
  },
  s_ifexpr : {
    use :
    function(wikiparser) {
      var pfList = wikiparser.pfList;
      pfList.push(['#ifexpr',this.execute]);
    },
    execute :
    function(wikiparser, template) {
      var text1 = template[3].split(':')[1].trim();
      if (typeof template[4] !== 'string') template[4] = '';
      if (typeof template[5] !== 'string') template[5] = '';
      var text2 = template[4].trim();
      var text3 = template[5].trim();
      var res;
      try {
        res = math.eval(text1);
      } catch (e) {
        template[0] = '<b class="error">'+e+'</b>';
        return;
      }
      if (res) {
        template[0] = text2;
      } else {
        template[1] = text3;
      }
      return;
    }
  }
};
module.exports.useAll = function (wikiparser) {
  for (var a in pfs) {
    if (pfs.hasOwnProperty(a)) {
      pfs[a].use(wikiparser);
    }
  }
};
