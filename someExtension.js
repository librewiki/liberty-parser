function use(wikiparser) {
  var pfList = wikiparser.pfList;
  pfList.push(["#someExtension",execute]);
}
function execute(wikiparser, template) {

}
module.exports.use = use;

//파서함수 확장기능의 기본형
