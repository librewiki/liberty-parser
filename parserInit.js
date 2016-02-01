var WikiParser = require('./coremodule/WikiParser');
var nowikiProcess = require('./coremodule/nowikiProcess.js');
var templatePartialTags = require('./coremodule/templatePartialTags.js');
var noTemplatePartial = templatePartialTags.noTemplatePartial;
var noTemplateParam = require('./coremodule/noTemplateParam.js');
function parserInit(text, namespace, title, option){
  var wikiparser = new WikiParser();
  wikiparser.namespace = namespace;
  wikiparser.title = title;
  wikiparser.wikitext = text.replace(/\r\n/g,"\n").replace(/\r/g,"\n");
  wikiparser.AddInterwiki("./interwiki.json");

  //지원하고자 하는 언어를 추가
  wikiparser.Addi18n("english");
  wikiparser.Addi18n("korean");

  //서비스 언어를 설정
  wikiparser.local = "korean";

  //목차를 표시할 최소 소제목 개수
  wikiparser.showTocMin = 4;
  nowikiProcess(wikiparser);
  noTemplatePartial(wikiparser);
  noTemplateParam(wikiparser);
  require('./coremodule/coreSettings.js')(wikiparser);
  //Extensions
  require('./someExtension.js').use(wikiparser);
  return wikiparser;
}
module.exports = parserInit;
