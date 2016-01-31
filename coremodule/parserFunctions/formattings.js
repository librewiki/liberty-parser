// lc, uc, lcfirst, ucfirst
var pfs = {
  lc : {
    use :
    function(wikiparser) {
      var pfList = wikiparser.pfList;
      pfList.push(['lc',this.execute]);
    },
    execute :
    function(wikiparser, template) {
      var text = template[3].split(':')[1].trim();
      if (!text) { text = ''; }
      template[0] = text.toLowerCase();
      return;
    }
  },
  uc : {
    use :
    function(wikiparser) {
      var pfList = wikiparser.pfList;
      pfList.push(['uc',this.execute]);
    },
    execute :
    function(wikiparser, template) {
      var text = template[3].split(':')[1].trim();
      if (!text) { text = ''; }
      template[0] = text.toUpperCase();
      return;
    }
  },
  lcfirst : {
    use:
    function(wikiparser) {
      var pfList = wikiparser.pfList;
      pfList.push(['lcfirst',this.execute]);
    },
    execute:
    function(wikiparser, template) {
      var text = template[3].split(':')[1];
      if (!text) { text = ''; }
      text = text.trim();
      var t = text.charAt(0).toLowerCase() + text.substr(1);
      template[0] = t;
      return;
    }
  },
  ucfirst : {
    use:
    function(wikiparser) {
      var pfList = wikiparser.pfList;
      pfList.push(['ucfirst',this.execute]);
    },
    execute:
    function(wikiparser, template) {
      var text = template[3].split(':')[1];
      if (!text) { text = ''; }
      text = text.trim();
      var t = text.charAt(0).toUpperCase() + text.substr(1);
      template[0] = t;
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
