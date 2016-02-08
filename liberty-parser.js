"USE STRICT";
/*
*author DAMEZUMA, NESSUN
*published under the MIT license
*/

function NowikiNode(){
  this.type = "NOWIKI";
  this.render = "nowiki";
  this.children = [];
}
NowikiNode.prototype.Process = function(){
  var stack = [];
};
function PreTagNode() {
	this.type = "PRETAG";
  this.render = "pretag";
	this.children = [];
}
PreTagNode.prototype.Process = function () {
	var stack = [];
};
function MathNode(){
  this.type = "MATH";
  this.render = "math";
  this.children = [];
}
MathNode.prototype.Process = function(){
  var stack = [];
};
function TextNode(text){
  this.type = "TEXT";
  this.render = "text";
  this.text = text;
}
TextNode.prototype.Process = function(wikiparser){

};
function BRNode(){
  this.type = "BR";
  this.render = "brtag";
  this.children = [];
}
BRNode.prototype.Process = function(){
  for(var i in this.children){
		var it = this.children[i];
    it.Process();
	}
};
function LinkNode(){
  this.type = "LINK";
  this.render = "link";
  this.children = [];
}
LinkNode.prototype.Process = function(){
  for(var i in this.children){
		var it = this.children[i];
		it.Process();
	}
};
function ExtLinkNode(){
  this.type = "EXTERNAL LINK";
  this.render = "extlink";
  this.children = [];
}
ExtLinkNode.prototype.Process = function(){
  for(var i in this.children){
		var it = this.children[i];
		it.Process();
	}
};
function RefNode(){
  this.type = "REF";
  this.render = "ref";
  this.children = [];
}
RefNode.prototype.Process = function(wikiparser){
  for(var i in this.children){
    var it = this.children[i];
    it.Process();
  }
};
function ReferencesNode(){
  this.type = "REFERENCES";
  this.render = "references";
  this.children = [];
}
ReferencesNode.prototype.Process = function(wikiparser){
  for(var i in this.children){
    var it = this.children[i];
    it.Process();
  }
};
function HeadingNode(){
  this.type = "HEADING";
  this.render = "heading";
  this.children = [];
}
HeadingNode.prototype.Process = function(wikiparser){
  for(var i in this.children){
    var it = this.children[i];
    it.Process();
  }
};
function BoldNode(){
  this.type = "BOLD";
  this.render = "bold";
  this.children = [];
}
BoldNode.prototype.Process = function(){
  for(var i in this.children){
    var it = this.children[i];
    it.Process();
  }
};
function ItalicNode(){
  this.type = "ITALIC";
  this.render = "italic";
  this.children = [];
}
ItalicNode.prototype.Process = function(){
  for(var i in this.children){
    var it = this.children[i];
    it.Process();
  }
};
function TableNode(){
  this.NAME = "TABLE";
  this.render = "table";
  this.children = [];
  this.cells = [];
  this.tableattr = "";
}
TableNode.prototype.Process = function(){
  for(var i in this.children){
    var it = this.children[i];
    it.Process();
  }
};
function ListNode(){
  this.children = [];
  this.render = "list";
  this.NAME = "LIST";
}
ListNode.prototype.Process = function(){
  for(var i in this.children){
    var it = this.children[i];
    it.Process();
  }
};
function HRNode(){
  this.children = [];
  this.render = "hr";
  this.NAME = "HR";
}
HRNode.prototype.Process = function(){

};
function LibertyMark(){
  this.render = "liberty";
  this.children = [];
}
LibertyMark.prototype.Process = function(){
  var res = [];
  for(var i in this.children){
    var iter = this.children[i];
    iter.Process();
  }
};
var MARK_TYPE = {
  STANDALONE:2,
  OPEN_TAG:true,
  CLOSE_TAG:false
};
function HookMarker(hooker,markType,pos){
  if(isNull(hooker)) throw "hooker is undefined!";
  if(isNull(markType)) throw "mark type is undefined!";
  this.hooker = hooker;
  this.markType = markType;
  this.position = pos;
  this.NAME = "HOOK MARKER";
}
HookMarker.prototype.IsGreaterThan = function(marker){
  var res = false;
  if(this.position > marker.position){
    res = true;
  }
  else if(this.position == marker.position){
    if(marker.markType == MARK_TYPE.CLOSE_TAG){
      res = true;
    }
  }
  return res;
};
var WikiParser = require('./coremodule/WikiParser');
WikiParser.prototype.AddHooker = function(hooker){
  this.hookers.push(hooker);
  return this;
};
//nation is string(e.g. "korean")
WikiParser.prototype.Addi18n = function(lang){
  this.i18ns[lang] = require('./i18n/'+lang+'.json');
};
WikiParser.prototype.i18nKey = function(keyword){
  var res = ['('];
  for (var a in this.i18ns) {
    if(!isNull(this.i18ns[a][keyword])){
      res.push(this.i18ns[a][keyword]);
      res.push('|');
    }
  }
  res.pop();
  res.push(')');
  return res.join('');
};
WikiParser.prototype.AddInterwiki = function(src){
  this.interwikis = require(src);
};
WikiParser.prototype.InterwikiKey = function(keyword){
  var res = ['('];
  for (var a in this.interwikis) {
    res.push(a);
    res.push('|');
  }
  res.pop();
  res.push(')');
  return res.join('');
};
WikiParser.prototype.AddMark = function(marker){
  var isDoneInsert = false;
  for(var i in this.markList){
    var iter = this.markList[i];
    if (iter.IsGreaterThan(marker)) {
      this.markList.splice(i,0,marker);
      isDoneInsert = true;
      break;
    }
  }
  if(isDoneInsert === false){
    this.markList.push(marker);
  }
};
WikiParser.prototype.AddDB = function(obj){
  if(isNull(obj)){
    console.error("wikiDB needed");
    obj = {
      GetWikitext: function(nameOfDoc){
        return "";
      },
      DocExist: function(nameOfDoc){
        return false;
      }
    };
  }
  this.wikiDB = obj;
};
WikiParser.prototype.DoBasicMarkTag = function(text,hooker,tagName){
  var lower = text.toLowerCase();
  var idx = 0;
  var len = tagName.length;
  var stdAlone = /^<([-A-Za-z0-9_]+)((?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*\/>/;
  while((idx = lower.indexOf("<"+tagName+" ", idx)) != -1){
    var temp = idx;
    this.AddMark(new HookMarker(hooker, MARK_TYPE.OPEN_TAG,idx));
    idx = lower.indexOf(">", idx);
    if(stdAlone.test(lower.substring(temp,idx+1))){
      this.AddMark(new HookMarker(hooker, MARK_TYPE.CLOSE_TAG,idx+1));
    }
  }
  idx = 0;
  while((idx = lower.indexOf("<"+tagName+">", idx)) != -1){
    this.AddMark(new HookMarker(hooker, MARK_TYPE.OPEN_TAG,idx));
    idx = lower.indexOf(">", idx);
  }
  idx = 0;
  while((idx = lower.indexOf("</"+tagName, idx)) != -1){
    idx = lower.indexOf(">", idx);
    this.AddMark(new HookMarker(hooker, MARK_TYPE.CLOSE_TAG,idx+1));
  }
};
WikiParser.prototype.DoBasicMarkStandaloneTag = function(text,hooker,tagName){
  var lower = text.toLowerCase();
  var idx = 0;
  var len = tagName.length;
  while((idx = lower.indexOf("<"+tagName, idx)) != -1){
    this.AddMark(new HookMarker(hooker, MARK_TYPE.STANDALONE,idx));
    idx = lower.indexOf(">", idx);
  }
};
WikiParser.prototype.TextNodeParse = function(node){

  return node;
};
WikiParser.prototype.AttrParse = function(text){
  var startTag = /^<([-A-Za-z0-9_]+)((?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/,
  endTag = /^<\/([-A-Za-z0-9_]+)[^>]*>/,
  attr = /([-A-Za-z0-9_]+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;
  var lower = text.toLowerCase();
  var temp = (startTag.exec(lower)[2]).split(attr);
  var opt = [];
  for(var i=1;i<temp.length;i+=5){
    opt.push([temp[i],temp[i+1]]);
  }
  return opt;
};
WikiParser.prototype.OnlyText = function(node){
  //자손 노드중 텍스트 노드만 처리한다
  var res = [];
  function recursion(current){
    if(current.type=="TEXT"){
      res.push(current.text);
    }
    else{
      for(var i in current.children){
        recursion(current.children[i]);
      }
    }
  }
  recursion(node);
  return res.join("");
};
WikiParser.prototype.ReverseTagType = function(text, fromIdx, nodeClass){
  var k = 0;
  for(k = fromIdx ; k < this.markList.length ; k++){
    var iterNodeClass = this.markList[k].hooker.NODE;
    var tagType = this.markList[k].markType;
    if(nodeClass == iterNodeClass && tagType != MARK_TYPE.STANDALONE){
      var marker = this.markList[k];
      if(!isNull(marker.hooker.OnTagReversing)){
        this.markList[k] = marker.hooker.OnTagReversing(this.markList, text, marker.markType, marker.position);
        if(isNull(this.markList[k])){
          this.markList.splice(k);
          k--;
        }
      }
      else{
        this.markList.splice(k);
        k--;
      }
    }
  }
};
WikiParser.prototype.Parse = function(text){
  for(var i in this.hookers){
    //후커 돌면서 DoMark 실행
    var hooker = this.hookers[i];
    hooker.DoMark(this,text);
  }
  var stack = [];
  var markStack = [];
  var lastIdx = 0;
  stack.push(new LibertyMark());//마크 담는 스택
  for(i = 0 ; i < this.markList.length ; i++){
    var iter = this.markList[i];
    switch(iter.markType){
      case MARK_TYPE.CLOSE_TAG:{
        if(stack.length == 1) continue;
        var lastNode = stack[stack.length - 1];
        //짝이 안맞는 경우도 있을 수 있다
        var iterNodeName = iter.hooker.NODE;
        if(lastNode.constructor != iterNodeName){
          //우석 현재 노트와 짝이 맞는 놈을 찾는다.
          var x = 0;
          for(x = stack.length - 1 ; x != -1 ; x--){
            if(stack[x].constructor == iterNodeName){
              //만약 이름이 같다면 얘일 확률이 크다.
              //얘 위에 쓰여진 스택들을 비워버린다.
              //그리고 스택을 비우고 다시 차일드를 쳐넣는다...
              var k = 0;
              for(k = x+1 ; k < stack.length ; k++){
                this.ReverseTagType(text, i + 1, stack[k].constructor);
              }
              for(k = markStack.length - 1; k >= 0; k--){
                if(markStack[k].node == stack[x]){
                  this.markList.splice(k+1, i - (k + 1));//k초과, i미만인 요소들의 노드를 제거한다. 필연이다.
                  i = markStack[k].pos;//마크 돌리던 것도 돌리고
                  iter = this.markList[markStack[k].pos];//iter도 돌려놓고
                  stack[x].children = [];//자식을 비우고...
                  stack = stack.slice(0,x+1);//스택도 날리고
                  break;
                }
              }
              break;
            }
          }
        }
        else{
          //맞으면 평범하게 빼버린다.
          stack.pop();
          markStack.pop();
          lastNode.children.push(new TextNode(text.substring(lastIdx, iter.position)));
        }

      }
      break;
      case MARK_TYPE.OPEN_TAG:{
        stack[stack.length - 1].children.push(new TextNode(text.substring(lastIdx, iter.position)));
        var node = new iter.hooker.NODE();
        stack[stack.length - 1].children.push(node);
        stack.push(node);
        markStack.push({node:node,pos:i});
      }
      break;
      case MARK_TYPE.STANDALONE:
      stack[stack.length - 1].children.push(new TextNode(text.substring(lastIdx, iter.position)));
      stack[stack.length - 1].children.push(new iter.hooker.NODE());
      break;
    }
    lastIdx = iter.position;
  }
  if(lastIdx <= text.length -1)
  stack[stack.length - 1].children.push(new TextNode(text.substring(lastIdx, text.length)));

  stack[0].Process();
  return stack[0];
};
function NowikiHooker(){
  this.NAME = "NOWIKI HOOKER";
  this.NODE = NowikiNode;
}
NowikiHooker.prototype.DoMark = function(wikiparser,text){
  wikiparser.DoBasicMarkTag(text, this, "nowiki");
};
function PreTagHooker(){
 	this.NAME = "PRETAG HOOKER";
	this.NODE = PreTagNode;
}
PreTagHooker.prototype.DoMark = function (wikiparser, text) {
	wikiparser.DoBasicMarkTag(text, this, "pre");
};
function MathHooker(){
 	this.NAME = "Math HOOKER";
	this.NODE = MathNode;
}
MathHooker.prototype.DoMark = function (wikiparser, text) {
	wikiparser.DoBasicMarkTag(text, this, "math");
};
function TableHooker(){
  this.NAME = "TABLE HOOKER";
  this.NODE = TableNode;
}
TableHooker.prototype.DoMark = function(wikiparser, text){
  var idx = 0;
  while((idx = text.indexOf("{|", idx)) != -1){
    wikiparser.AddMark(new HookMarker(this, MARK_TYPE.OPEN_TAG,idx));
    idx += 2;
  }
  idx = 0;
  while((idx = text.indexOf("|}", idx)) != -1){
    idx += 2;
    wikiparser.AddMark(new HookMarker(this, MARK_TYPE.CLOSE_TAG,idx));
  }
};
function BoldTagHooker(){
  this.NAME = "BOLDTAG HOOKER";
  this.NODE = BoldNode;
}
BoldTagHooker.prototype.DoMark = function(wikiparser,text){
  var idx = 0;
  var isStartTag = false;
  while((idx = text.indexOf("'''", idx)) != -1){
    var tagType = MARK_TYPE.OPEN_TAG;
    if(!isStartTag){
      wikiparser.AddMark(new HookMarker(this, MARK_TYPE.OPEN_TAG,idx));
      if(text.substr(idx,5) == "'''''"){
        idx+=2;
      }
    }
    else{
      if(text.substr(idx,5) == "'''''"){
        idx+=2;
      }
      wikiparser.AddMark(new HookMarker(this, MARK_TYPE.CLOSE_TAG,idx+3));
    }
    isStartTag = !isStartTag;
    idx += 3;
  }
};
BoldTagHooker.prototype.OnTagReversing = function(markList,text,tagType,idx){
  var res = null;
  if(tagType == MARK_TYPE.OPEN_TAG){
    res = new HookMarker(this,MARK_TYPE.CLOSE_TAG,idx+3);
  }
  else{
    res = new HookMarker(this,MARK_TYPE.OPEN_TAG,idx-3);
  }
  return res;
};
function ItalicHooker(){
  this.NAME = "ITALIC HOOKER";
  this.NODE = ItalicNode;
}
ItalicHooker.prototype.DoMark = function(wikiparser,text){
  var idx = 0;
  var isStartTag = false;
  while((idx = text.indexOf("''", idx)) != -1){
    if(!isStartTag){
      if(text.substr(idx,5) == "'''''"){
        idx+=3;
      }
      else if(text.substr(idx,3) == "'''"){
        idx += 2;
        continue;
      }
      wikiparser.AddMark(new HookMarker(this, MARK_TYPE.OPEN_TAG,idx));
    }
    else{
      wikiparser.AddMark(new HookMarker(this, MARK_TYPE.CLOSE_TAG,idx+2));
      if(text.substr(idx,5) == "'''''"){
        idx += 3;
      }
    }
    isStartTag = !isStartTag;
    idx += 2;
  }
};
ItalicHooker.prototype.OnTagReversing = function(markList,text,tagType,idx){
  var res = null;
  if(tagType == MARK_TYPE.OPEN_TAG){
    res = new HookMarker(this,MARK_TYPE.CLOSE_TAG,idx+2);
  }
  else{
    res = new HookMarker(this,MARK_TYPE.OPEN_TAG,idx-2);
  }
  return res;
};
function HeadingHooker(){
  this.NAME = "HEADING HOOKER";
  this.NODE = HeadingNode;
}
HeadingHooker.prototype.DoMark = function(wikiparser,text){
  var idx = 0;
  var compen = 0;
  if(text.charAt(0)=="="){
    text = "\n"+text;
    compen = -1;
  }
  while((idx = text.indexOf("\n=", idx)) != -1){
    idx+=1;
    var max = idx+8;
    var level = 0;
    var idx2  = 0;
    for(idx2 = idx; idx2<max; idx2++){
      if(text.charAt(idx2)=="="){
        level++;
      }else{
        break;
      }
    }
    wikiparser.AddMark(new HookMarker(this, MARK_TYPE.OPEN_TAG,idx+compen));
    idx = text.indexOf("=", idx2);
    wikiparser.AddMark(new HookMarker(this, MARK_TYPE.CLOSE_TAG,idx+compen+level));
    idx += level;
    wikiparser.headingQue.push(level);
    wikiparser.headingQueFront++;
  }
};
function RefHooker(){
  this.NAME = "REF HOOKER";
  this.NODE = RefNode;
}
RefHooker.prototype.DoMark = function(wikiparser,text){
  wikiparser.DoBasicMarkTag(text, this, "ref");
};
function ReferencesHooker(){
  this.NAME = "REFERENCES HOOKER";
  this.NODE = ReferencesNode;
}
ReferencesHooker.prototype.DoMark = function(wikiparser,text){
  wikiparser.DoBasicMarkStandaloneTag(text, this, "references");
};
function BRTagHooker(){
  this.NAME = "BRTAG HOOKER";
  this.NODE = BRNode;
}
BRTagHooker.prototype.DoMark = function(wikiparser,text){
  var idx = 0;
  while((idx = text.indexOf("\n\n", idx)) != -1){
    wikiparser.AddMark(new HookMarker(this, MARK_TYPE.STANDALONE,idx+1));
    idx += 2;
  }
};
function LinkHooker(){
  this.NAME = "LINK HOOKER";
  this.NODE = LinkNode;
}
LinkHooker.prototype.DoMark = function(wikiparser,text){
  var idx = 0;
  while((idx = text.indexOf("[[", idx)) != -1){
    wikiparser.AddMark(new HookMarker(this, MARK_TYPE.OPEN_TAG,idx));
    idx += 2;
  }
  idx = 0;
  while((idx = text.indexOf("]]", idx)) != -1){
    idx += 2;
    wikiparser.AddMark(new HookMarker(this, MARK_TYPE.CLOSE_TAG,idx));
  }
};
function ExtLinkHooker(){
  this.NAME = "EXTERNAL LINK HOOKER";
  this.NODE = ExtLinkNode;
}
ExtLinkHooker.prototype.DoMark = function(wikiparser,text){
  var idx = 0;
  while((idx = text.indexOf("[", idx)) != -1){
    if(text.charAt(idx+1)!="["){
      wikiparser.AddMark(new HookMarker(this, MARK_TYPE.OPEN_TAG,idx));
      idx += 1;
    }else idx += 2;
  }
  idx = 0;
  while((idx = text.indexOf("]", idx)) != -1){
    if(text.charAt(idx+1)!="]"){
      idx += 1;
      wikiparser.AddMark(new HookMarker(this, MARK_TYPE.CLOSE_TAG,idx));
    }else idx += 2;
  }
};
function ListHooker(){
  this.NAME = "LIST HOOKER";
  this.NODE = ListNode;
}
ListHooker.prototype.DoMark = function(wikiparser, text){
  if(text.endsWith("\n") === false){
    text = text.concat("\n");
  }
  var lines = text.split("\n");
  var isListStart = -1;
  var idx = 0;
  for(var i in lines){
    var line = lines[i];
    if(isListStart == -1 && (line.startsWith("*") || line.startsWith("#") || line.startsWith(";") || line.startsWith(":"))){
      isListStart = i;
      wikiparser.AddMark(new HookMarker(this,MARK_TYPE.OPEN_TAG,idx));
    }
    else if(isListStart != -1 && !(line.startsWith("*") || line.startsWith("#") || line.startsWith(";") || line.startsWith(":"))){
      wikiparser.AddMark(new HookMarker(this,MARK_TYPE.CLOSE_TAG, idx));
      isListStart = -1;
    }
    idx += line.length + 1;
  }
};
function HRHooker(){
  this.NAME = "HR HOOKER";
  this.NODE = HRNode;
}
HRHooker.prototype.DoMark = function(wikiparser, text){
  if(text.endsWith("\n") === false){
    text = text.concat("\n");
  }
  var lines = text.split("\n");
  var idx = 0;
  for(var i in lines){
    var line = lines[i];
    if(line.startsWith("----")){
      wikiparser.AddMark(new HookMarker(this,MARK_TYPE.OPEN_TAG, idx));
      wikiparser.AddMark(new HookMarker(this,MARK_TYPE.CLOSE_TAG, idx + line.length));
    }
    idx += line.length + 1;
  }
};


function isNull(obj){
  return obj === null || obj === undefined;
}

var nowikiProcess = require('./coremodule/nowikiProcess.js');
function showToc (rendered, wikiparser) {
  var res = [];
  var stack = [];
  var __TOC__ = false;
  var reg = /(<(?:h|H)(?:1|2|3|4|5))/;
  if(rendered.indexOf('__TOC__')!=-1) __TOC__ = true;
  if(__TOC__){
    reg = /(__TOC__)/;
  }
  rendered = rendered.replace(reg,function ($0,$1) {
    //need i18n
    res.push('<div id="toc" class="toc"><div id="toctitle"><h2>목차</h2></div>\n');
    for (var i = 0; i < wikiparser.headingContents.length; i++) {
      var k;
      if(i!==0){
        k = wikiparser.headingContents[i-1][2]-wikiparser.headingContents[i][2];
      }
      if(i===0||k<0){
        res.push('\n<ul>');
        stack.push('</ul>\n');
      }else if (k>0) {
        res.push(stack.pop());
        for (; k > 0; k--) {
          res.push(stack.pop());
          res.push(stack.pop());
        }
      }else {
        res.push(stack.pop());
      }
      res.push('<li class="toclevel-');
      stack.push('</li>\n');
      res.push(wikiparser.headingContents[i][2]);
      res.push(' tocsection-');
      res.push(i+1);
      res.push('"><a href="#s-');
      res.push(wikiparser.headingContents[i][0]);
      res.push('"><span class="tocnumber">');
      res.push(wikiparser.headingContents[i][0]);
      res.push(' </span><span class="toctext">');
      res.push(wikiparser.headingContents[i][1]);
      res.push('</span></a>');
    }
    while(stack.length>0){
      res.push(stack.pop());
    }
    res.push('</div>');
    if(!__TOC__){
      res.push($1);
    }else {
      res.push('<br />');
    }
    return res.join("");
  });
  return rendered;
}
function AfterRender(rendered,wikiparser){
  //렌더링 이후에 다 못한 처리를 한다
  var cnt = 0;
  rendered=rendered.replace(/__NOTOC__/g,function () {
    wikiparser.showTocMin = 1/0;
    return "";
  });
  rendered=rendered.replace(/__TOC__/g,function () {
    wikiparser.showTocMin = -1;
    if(cnt>0) return "";
    else return "__TOC__";
  });
  rendered=rendered.replace(/__FORCETOC__/g,function () {
    wikiparser.showTocMin = -1;
    return "";
  });
  if(wikiparser.headingCount>=wikiparser.showTocMin){
    rendered = showToc(rendered,wikiparser);
  }
  var rules = [[/<script/gi,'&lt;script'],[/<\/script/gi,'&lt;/script'],[/<style/gi,'&lt;style'],[/<\/style/gi,'&lt;/style']];
  for(var i in rules){
    rendered = rendered.replace(rules[i][0], rules[i][1]);
  }
  rendered = rendered.replace(/\\nowiki\\_(\d+)_\\nowiki\\/g,function ($0,$1) {
    return wikiparser.nowikiMatch[$1];
  });
  rendered = rendered.replace(/<math>/gi,"[math]").replace(/<\/math>/gi,"[/math]");
  return rendered;
}
var parserFunction = require('./coremodule/parserFunction.js');

function TemplateCheck(wikiparser){
  wikiparser.templateList = [];
  var idx = 0, depth = 0, start, end;
  var text = wikiparser.wikitext;
  while(true){
    var t = text.substr(idx).search(/{{|}}/);
    if(t===-1){
      break;
    }
    idx+=t;
    var oc = text.charAt(idx);
    if(oc=="{"){
      if(text.charAt(idx+2)=="{"&&text.charAt(idx+3)!=="{"){
        idx+=2;
        continue;
      }
      depth++;
      if(depth===1){
          start = idx;
      }
    }
    else{
      if(text.charAt(idx+2)=="}"&&text.charAt(idx+3)!=="}"){
        idx+=2;
        continue;
      }
      depth--;
      if(depth===0){
        end = idx;
        var templateText = wikiparser.wikitext.substring(start+2,end);
        var templateArr = [];
        //templateText.split("|");
        var barIdx = -1, innerBraceDepth = 0;
        for (var i = 0; i < templateText.length; i++) {
          if (innerBraceDepth === 0 && templateText.charAt(i)=="|") {
            templateArr.push(templateText.substring(barIdx+1,i));
            barIdx = i;
          } else if (templateText.charAt(i)==="{") {
            innerBraceDepth++;
          } else if (templateText.charAt(i)==="}") {
            innerBraceDepth--;
          }
        }
        templateArr.push(templateText.substring(barIdx+1));
        templateArr[0] = templateArr[0].trim();
        templateArr.splice(0,0,true,start,end);
        wikiparser.templateList.push(templateArr);
      }
    }
    idx+=2;
  }
  return parserFunction(wikiparser);
}
module.exports.TemplateCheck = TemplateCheck;
function TemplateReplace(wikiparser){
  wikiparser.templateDepth++;
  var sb = [];
  var open = 0, close = 0;
  for (var i = 0; i < wikiparser.templateList.length; i++) {
    open = wikiparser.templateList[i][1];
    sb.push(wikiparser.wikitext.substring(close,open));
    sb.push(TemplateParameterReplace(wikiparser.templateList[i]));
    close = wikiparser.templateList[i][2]+2;
  }
  sb.push(wikiparser.wikitext.substring(close));
  wikiparser.wikitext = sb.join("").replace(/\r\n/g,"\n").replace(/\r/g,"\n");
  nowikiProcess(wikiparser);
  return wikiparser;
}
function TemplatePatialTags(template){
  var text = template[0];
  text=text.
  replace(/\r\n/g,"\n").
  replace(/\r/g,"\n").
  replace(/<\/?includeonly>/gi,"").
  replace(/(?:.|\n)*<onlyinclude>(.*?)<\/onlyinclude>(?:.|\n)*/gi,'$1').
  replace(/<noinclude>.*?<\/noinclude>/gi,"");
  template[0]=text;
}



function TemplateParameterReplace(template){
  TemplatePatialTags(template);
  var arrObj = [template[3]];
  var text = template[0];
  var lower = text.toLowerCase();
  for (var i = 4; i < template.length; i++) {
    var iter = template[i];
    var temp = iter.split("=");
    if(!isNull(temp[1])){
      arrObj[temp[0].trim()]=temp[1].trim();
    }else{
      arrObj.push(iter);
    }
  }
  var idx = 0;
  var ParamArr = [];
  while((idx = text.indexOf("{{{", idx)) != -1){
    var open = idx+3;
    if((idx = text.indexOf("}}}", idx)) != -1){
      var close = idx;
      var param = text.substring(open,close).split("|");
      var paramName = param[0];
      if(isNull(param[1])) param[1]=text.substring(open-3,close+3);
      ParamArr.push([paramName,open-3,close,param[1]]);
    }else{
      break;
    }
    idx += 3;
  }
  var sb = [];
  var op=0, cl=0;
  for (var k = 0; k < ParamArr.length; k++) {
    op = ParamArr[k][1];
    sb.push(text.substring(cl,op));
    if(isNull(arrObj[ParamArr[k][0]])){
      sb.push(ParamArr[k][3]);
    }else{
      sb.push(arrObj[ParamArr[k][0]]);
    }
    cl = ParamArr[k][2]+3;
  }
  sb.push(text.substring(cl));
  return sb.join("");
}
module.exports.TemplateReplace = TemplateReplace;
function DoParse(wikiparser){
  wikiparser
  .AddHooker(new TableHooker())
  .AddHooker(new BoldTagHooker())
  .AddHooker(new ItalicHooker())
  .AddHooker(new BRTagHooker())
  .AddHooker(new LinkHooker())
  .AddHooker(new ExtLinkHooker())
  .AddHooker(new HeadingHooker())
  .AddHooker(new RefHooker())
  .AddHooker(new ReferencesHooker())
  .AddHooker(new ListHooker())
  .AddHooker(new HRHooker());
  var a = wikiparser.Parse(wikiparser.wikitext);
  var rendered = '';
  var Renderer = require('./wikiRenderer.js');
  Renderer.Render(wikiparser, a, function (res) {
    rendered = res;
  });
  var res = AfterRender(rendered,wikiparser);
  return res;
}
module.exports.DoParse = DoParse;
