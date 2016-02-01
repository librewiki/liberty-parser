//https://www.npmjs.com/package/mathjs (eval)
var math = require('mathjs');

function use(wikiparser) {
  var pfList = wikiparser.pfList;
  pfList.push(['#expr',execute]);
}
function execute(wikiparser, template) {
  var text1 = template[3].split(':')[1].trim();
  var res;
  try {
    res = math.eval(text1);
  } catch (e) {
    template[0] = '<b class="error">'+e+'</b>';
    return;
  }
  template[0] = math.format(res, {precision: 6});
  return;
}
module.exports.use = use;
