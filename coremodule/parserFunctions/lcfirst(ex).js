function use(wikiparser) {
  var pfList = wikiparser.pfList;
  pfList.push(['lcfirst',execute]);
}
function execute(wikiparser, template) {
  var text = template[3].split(':')[1];
  if (text) {
    text = text.trim();
    var t = text.charAt(0).toLowerCase() + text.substr(1);
    template[0] = t;
  }
  return;
}
module.exports.use = use;
