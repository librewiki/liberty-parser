function parserFunction(wikiparser) {
  var pfList = wikiparser.pfList;
  for (var i = 0; i < wikiparser.templateList.length; i++) {
    var title = wikiparser.templateList[i][3].split(":")[0];
    for (var j = 0; j < pfList.length; j++) {
      if (pfList[j][0] == title){
        pfList[j][1](wikiparser, wikiparser.templateList[i]);
      }
    }
  }
  return wikiparser;
}
module.exports = parserFunction;
