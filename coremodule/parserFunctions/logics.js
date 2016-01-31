// #if, #ifeq, #ifexist
var pfs = {
  s_if : {
    use :
    function(wikiparser) {
      var pfList = wikiparser.pfList;
      pfList.push(['#if',this.execute]);
    },
    execute :
    function(wikiparser, template) {
      console.log(template);
      var text = template[3].split(':')[1].trim();
      if (!template[4]) template[4] = '';
      if (!template[5]) template[5] = '';
      if (text) {
        template[0] = template[4].trim();
      } else {
        template[0] = template[5].trim();
      }
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
      var text2 = template[4].trim();
      if (text1 == text2) {
        if (template[5]) {
          template[0] = template[5].trim();
        }
      } else {
        if (template[6]) {
          template[6] = template[6].trim();
        }
      }
      return;
    }
  }
  // s_ifexist : {
  //   use :
  //   function(wikiparser) {
  //     var pfList = wikiparser.pfList;
  //     pfList.push(['#ifexist',this.execute]);
  //   },
  //   execute :
  //   function(wikiparser, template) {
  //     var text1 = template[3].split(':')[1].trim();
  //     var text2 = template[4].trim();
  //     if (text1 == text2) {
  //       if (template[5]) {
  //         template[0] = template[5].trim();
  //       }
  //     } else {
  //       if (template[6]) {
  //         template[6] = template[6].trim();
  //       }
  //     }
  //     return;
  //   }
  // },
  // s_ifexpr : {
  //   use :
  //   function(wikiparser) {
  //     var pfList = wikiparser.pfList;
  //     pfList.push(['#ifexpr',this.execute]);
  //   },
  //   execute :
  //   function(wikiparser, template) {
  //     var text1 = template[3].split(':')[1].trim();
  //     var text2 = template[4].trim();
  //     if (text1 == text2) {
  //       if (template[5]) {
  //         template[0] = template[5].trim();
  //       }
  //     } else {
  //       if (template[6]) {
  //         template[6] = template[6].trim();
  //       }
  //     }
  //     return;
  //   }
  // }
};
module.exports.useAll = function (wikiparser) {
  for (var a in pfs) {
    if (pfs.hasOwnProperty(a)) {
      pfs[a].use(wikiparser);
    }
  }
};
