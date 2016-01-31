function WikiParser(){
  this.wikitext = '';
  this.i18ns = {};
  this.pfList = [];
  this.local = "english";
  this.interwikis = {};
  this.hookers = [];
  this.markList = [];
  this.templateList = [];
  this.headingQue = [];
  this.nowikiMatch = [];
  this.headingQueCurr = 0;
  this.headingNumbering = [0,0,0,0,0,0];
  this.headingMin = 100;
  this.headingContents = [];
  this.references = [];
  this.lastReferencesIdx = 0;
  this.lastReferencesAbs = 0;
  this.maxRefAbs = 0;
  this.wikiDB = {};
  this.linkNum = 0;
  this.headingCount = 0;
  this.templateDepth = 0;
  this.showTocMin = 4;
}
module.exports = WikiParser;
