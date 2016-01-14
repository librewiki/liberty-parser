"USE STRICT";
/*
*EDITING BY DAMEZUMA, NESSUN
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
  var res = [[]];
  var row = 0;
  var children = [];
  var isStartCell = 0;
  var posPreBar = -1;
  var j = -1;
  var i;
  var temp;
  if(!isNull(this.children[0])){
    if(this.children[0].type == "TEXT"){
      temp = this.children[0].text;
      temp = temp.substring(2,temp.length);
      i = temp.indexOf("\n");
      if(i != -1){
          this.tableattr = temp.substring(0,i);
          this.children[0].text = temp.substring(i,temp.length);
      }
    }
    if(this.children[this.children.length - 1].type == "TEXT"){
      temp = this.children[this.children.length - 1].text;
      this.children[this.children.length - 1].text = temp.substring(0,temp.length - 2);
    }
  }
  var item = null;
  for(i in this.children){
    var iter = this.children[i];
    iter.Process();

    if(iter.type == "TEXT"){
      posPreBar = -1;
      temp = iter.text;
//테이블의 셀을 구한다.
//셀 파싱 규칙은 '|속성|셀 내용\n'이 기본이며, '|셀 내용\n'이나 '||셀 내용'은 변칙일 뿐이다
      var t;
      var newTextNode;
      for(j = 0 ; j < temp.length ; j++){
        if(temp.substr(j,2) == "|-"){
          res.push([]);
          row++;
          isStartCell = 0;
          posPreBar = -1;
        }
        else if(temp[j] == "|"){
          switch(isStartCell){
            case 0:{
              posPreBar = j;
              isStartCell = 1;
              item = {attr:"",children:[],isHead:false};
            }
            break;
            case 1:{
              isStartCell = 2;
              t = temp.substring(posPreBar+1,j);
              item.attr = t;
              posPreBar = j;
            }
            break;
            case 2:{
              t = temp.substring(posPreBar+1,j);
              newTextNode = new TextNode(t);
              item.children.push(newTextNode);
              res[row].push(item);
              children.push(newTextNode);
              item = {attr:"",children:[],isHead:false};
              isStartCell = 1;
              posPreBar = j;
            }
            break;
          }
        }
        else if(temp[j] == "!" && isStartCell === 0){
          isStartCell = 1;
          item = {attr:"",children:[],isHead:true};
          posPreBar = j;
        }
        else if(temp[j] == '\n' && isStartCell !== 0){
          t = temp.substring(posPreBar+1,j);
          newTextNode = new TextNode(t);
          item.children.push(newTextNode);
          res[row].push(item);
          children.push(newTextNode);

          isStartCell = 0;
          posPreBar = j;
        }
      }
      if(isStartCell !== 0){
        t = temp.substring(posPreBar+1,temp.length);
        newTextNode = new TextNode(t);
        item.children.push(newTextNode);
        children.push(newTextNode);
      }
    }
    else{
      item.children.push(iter);
      children.push(iter);
    }
  }
  for(i in res){
    if(res[i].length !== 0){
      this.cells.push(res[i]);
    }
  }
  this.children = children;
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
function WikiParser(){
  this.wikitext = '';
  this.i18ns = {};
  this.local = "english";
  this.interwikis = {};
  this.hookers = [];
  this.markList = [];
  this.templateList = [];
  this.headingQue = [];
  this.headingQueCurr = 0;
  this.headingNumbering = [0,0,0,0,0,0];
  this.headingMin = 100;
  this.referNaming = []; //[name, 번호, 횟수, 횟수2]을 저장
  this.referNum = 0;
  this.referRestart = 0;
  this.referContent = [];
  this.wikiDB = {};
  this.linkNum = 0;
}
WikiParser.prototype.AddHooker = function(hooker){
  this.hookers.push(hooker);
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

function AfterRender(rendered,wikiparser){
  //렌더링 이후에 다 못한 처리를 한다
  var rules = [[/<script/gi,'&lt;script'],[/<\/script/gi,'&lt;/script'],[/<style/gi,'&lt;style'],[/<\/style/gi,'&lt;/style']];
  for(var i in rules){
    rendered = rendered.replace(rules[i][0], rules[i][1]);
  }
  var reg = /<_(nowiki|pre|math)>(\d)_(\d+)(?:<\/_(?:\1)[^>]*>)/gi;
  var cnt=0;
  rendered = rendered.replace(reg,function($0,$1,$2,$3){
    console.log("sdf",$0,$1,$2,$3);
    var nowikitext = wikiparser.nowikiMatch[$2][$3];
    nowikitext = nowikitext.replace(/<(?!((\/?)(nowiki|pre|math)))/gi,"&lt;").replace(/([^(nowiki|pre|math)])>/gi,"$1&gt;");
    if($1=="math"){
      nowikitext = nowikitext.replace("<math>","[math]").replace("</math>","[/math]");
    }
    return nowikitext;
  });
  var idx = 0;
  return rendered;
}
function isNull(obj){
  return obj === null || obj === undefined;
}
function ParserInit(text,namespace,title){
  var wikiparser = new WikiParser();
  wikiparser.namespace = namespace;
  wikiparser.title = title;
  wikiparser.wikitext = text;
  wikiparser.templateList = [];
  //지원하고자 하는 언어를 추가
  wikiparser.Addi18n("english");
  wikiparser.Addi18n("korean");
  //서비스 언어를 설정
  wikiparser.local = "korean";
  wikiparser.AddInterwiki("./interwiki.json");
  wikiparser.Templatedepth = 0;
  wikiparser.nowikiMatch = [];
  NowikiProcess(wikiparser);
  return wikiparser;
}
module.exports.ParserInit = ParserInit;
function NowikiProcess(wikiparser){
  var text = wikiparser.wikitext;
  var re = '<_$1>'+wikiparser.Templatedepth+'</_$1>';
  var cnt = 0;
  var Match = text.match(/(?:<(nowiki|pre|math)(?:(?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(?:\/?)>)(.*?)(?:<\/(?:\1)[^>]*>)/gi);
  text = text.replace(/(?:<(nowiki|pre|math)(?:(?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(?:\/?)>)(.*?)(?:<\/(?:\1)[^>]*>)/gi,function ($0,$1,$2) {
    var res = '<_'+$1+'>'+wikiparser.Templatedepth+'_'+cnt+'</_'+$1+'>';
    cnt++;
    return res;
  });
  wikiparser.wikitext = text;
  wikiparser.nowikiMatch.push(Match);
}
function TemplateCheck(wikiparser){
  wikiparser.templateList = [];
  var idx = 0;
  var lower = wikiparser.wikitext.toLowerCase();
  /*var nowikiOpen = lower.indexOf("<nowiki");
  var preOpen = lower.indexOf("<pre");
  var mathOpen = lower.indexOf("<math");
  var nowikiClose = lower.indexOf("</nowiki",nowikiOpen);
  var preClose = lower.indexOf("</pre",preOpen);
  var mathClose = lower.indexOf("</math",mathOpen);*/
  while((idx = lower.indexOf("{{", idx)) != -1){
    if(lower.charAt(idx+2)=="{"){
      idx +=2;
      continue;
    }
    var open = idx+2;
    if((idx = lower.indexOf("}}", idx)) != -1){
      var close = idx;
      var templateText = wikiparser.wikitext.substring(open,close);
      var templateArr = templateText.split("|");
      templateArr.splice(0,0,'',open-2,close);
      wikiparser.templateList.push(templateArr);
      /*nowikiOpen = lower.indexOf("<nowiki",close);
      mathOpen = lower.indexOf("<math",close);
      preOpen = lower.indexOf("<pre",close);
      nowikiClose = lower.indexOf("</nowiki",nowikiOpen);
      preClose = lower.indexOf("</pre",preOpen);
      mathClose = lower.indexOf("</math",mathOpen);*/
    }else{
      break;
    }
    idx += 2;
  }
  //console.log(wikiparser.templateList);
  return wikiparser;
}
module.exports.TemplateCheck = TemplateCheck;
function TemplateReplace(wikiparser){
  wikiparser.Templatedepth++;
  var sb = [];
  var open = 0, close = 0;
  for (var i = 0; i < wikiparser.templateList.length; i++) {
    open = wikiparser.templateList[i][1];
    sb.push(wikiparser.wikitext.substring(close,open));
    sb.push(TemplateParameterReplace(wikiparser.templateList[i]));
    close = wikiparser.templateList[i][2]+2;
  }
  sb.push(wikiparser.wikitext.substring(close));
  wikiparser.wikitext = sb.join("");
  NowikiProcess(wikiparser);
  return wikiparser;
}
function TemplatePatialTags(template){
  var text = template[0];
  console.log("start",text);
  text=text.replace(/<\/?includeonly>/gi,"");
  text=text.replace(/(?:.|\n)*<onlyinclude>(.*)<\/onlyinclude>(?:.|\n)*/gi,'$1');
  text=text.replace(/<noinclude>.*<\/noinclude>/gi,"");
  console.log("end",text);
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
      arrObj[temp[0]]=temp[1];
    }else{
      arrObj.push(iter);
    }
  }
  var idx = 0;
  var ParamArr = [];
  /*
  var nowikiOpen = lower.indexOf("<nowiki");
  var preOpen = lower.indexOf("<pre");
  var mathOpen = lower.indexOf("<math");
  var nowikiClose = lower.indexOf("</nowiki",nowikiOpen);
  var preClose = lower.indexOf("</pre",preOpen);
  var mathClose = lower.indexOf("</math",mathOpen);
  */
  while((idx = text.indexOf("{{{", idx)) != -1){
  /*  if((idx>nowikiOpen&&idx<nowikiClose)||(idx>preOpen&&idx<preClose)||(idx>mathOpen&&idx<mathClose)){
      idx +=3;
      continue;
    }
    */
    var open = idx+3;
    if((idx = text.indexOf("}}}", idx)) != -1){
      var close = idx;
      var param = text.substring(open,close).split("|");
      var paramName = param[0];
      if(isNull(param[1])) param[1]="";
      ParamArr.push([paramName,open-3,close,param[1]]);
      /*
      nowikiOpen = lower.indexOf("<nowiki",close);
      preOpen = lower.indexOf("<pre",close);
      mathOpen = lower.indexOf("<math",close);
      nowikiClose = lower.indexOf("</nowiki",nowikiOpen);
      preClose = lower.indexOf("</pre",preOpen);
      mathClose = lower.indexOf("</math",mathOpen);*/
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
  //wikiparser.AddHooker(new NowikiHooker());
  //wikiparser.AddHooker(new PreTagHooker());
  //wikiparser.AddHooker(new MathHooker());
  wikiparser.AddHooker(new TableHooker());
  wikiparser.AddHooker(new BoldTagHooker());
  wikiparser.AddHooker(new ItalicHooker());
  wikiparser.AddHooker(new BRTagHooker());
  wikiparser.AddHooker(new LinkHooker());
  wikiparser.AddHooker(new ExtLinkHooker());
  wikiparser.AddHooker(new HeadingHooker());
  wikiparser.AddHooker(new RefHooker());
  wikiparser.AddHooker(new ReferencesHooker());
  wikiparser.AddHooker(new ListHooker());
  wikiparser.AddHooker(new HRHooker());
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
