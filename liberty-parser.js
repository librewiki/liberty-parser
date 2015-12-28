"USE STRICT";
//*EDITING BY DAMEZUMA, NESSUN
//*author DAMEZUMA, NESSUN
//publish by MIT
//각 클래스 메소드 별 역할
//Render() -> 노드를 HTML로 변환한다.
//Process()-> 노드를 HTML로 변환하기 이전에 해야 할 일들을 한다.
//테이블의 경우 각 셀을 분리하고, 템플릿의 경우에는 틀 이름과 매개변수를 정리한다
/*
파서 객체의 파서를 호출하면
​AddHooker라는 함수를 통해서
​넣었던 후커?에게 돌아가면서
​위키텍스트를 던져줍니다.
그러면 후커는 그 텍스트 자르고 삶고 찌고 하면서
자기가 처리해야 할 태그가 있는 위치를
마크를 심습니다.
그게 AddMark함수를 통해 하는데
안에서는
이 마크를
pos를 기준으로 정렬시킵니다.
그 다음 끝나면 이제
마크 리스트를 순환하면서
노드 트리를 만듭니다.
노드 트리가 끝나면
이제 그걸
노드 트리가 끝나면
제일 부모 노드가 LibertyMark 노드입니다.
그럼 그 노드의 렌더함수를 호출하면
차일드를 돌면서 렌더함수를 호출하고...
결과값을 돌려 주는 거죠
*/
function NowikiNode(){
  this.type = "NOWIKI";
  this.children = [];
}
NowikiNode.prototype.Process = function(){
  var stack = [];
};
NowikiNode.prototype.Render = function(wikiparser){
  var res = wikiparser.OnlyText(this);
  return res.replace(/</gi,"&lt;").replace(/>/gi,"&gt;")
  .replace(/&lt;nowiki&gt;/gi,"<nowiki>").replace(/&lt;\/nowiki&gt;/gi,"</nowiki>");
};
//////////////////////////////
function TextNode(text){
  this.type = "TEXT";
  this.text = text;
}
TextNode.prototype.Process = function(wikiparser){

};
TextNode.prototype.Render = function(wikiparser){
  var res = [];
  var texts = this.text.split(" ");
  for (var i in texts){
    if(texts[i].startsWith("http://")||texts[i].startsWith("https://")){
      res.push('<a style="color:#008000;" href="');
      res.push(texts[i]);
      res.push('">');
      res.push(texts[i]);
      res.push('</a>');
    }else res.push(texts[i]);
  }
  return res.join(' ');
};
//////////////////////////////
function BRNode(){
  this.type = "BR";
  this.children = [];
}
BRNode.prototype.Process = function(){

};
BRNode.prototype.Render = function(wikiparser){
  return "<br />";
};
//////////////////////////////
function LinkNode(){
  this.type = "LINK";
  this.children = [];
}
LinkNode.prototype.Process = function(){

};
LinkNode.prototype.Render = function(wikiparser){
  var res = [];
  var showText = '';
  if(this.children[0].text.startsWith("[[파일:")){
    return this.FileRender(wikiparser);
  }
  res.push('<a style="color:#6699FF;" href="//librewiki.net/wiki/');
  if(this.children[0].type == "TEXT"){
    if(this.children[0].text.startsWith("[[")){
      this.children[0].text = this.children[0].text.substr(2);
    }
  }
  if(this.children[this.children.length - 1].type == "TEXT"){
    var t = this.children[this.children.length - 1].text;
    if(t.endsWith("]]")){
      t = t.substring(0, t.length -2);
      this.children[this.children.length - 1].text = t;
    }
  }
  var innerText = wikiparser.OnlyText(this).split("|");
  var linkText = innerText[0];
  if(innerText[1]===undefined){
    showText = linkText;
  }
  else{
    showText = innerText.slice(1).join("|");
  }
  res.push(linkText);
  res.push('">');
  res.push(showText);
  res.push('</a>');
  return res.join("");
};
LinkNode.prototype.FileRender = function (first_argument) {
  //처리할게 더 있긴 한데 귀찮다
  var res = [];
  var imgFolder = "https://librewiki.net/images/5/5e/";
  var data = this.children[0].text.substring(2,this.children[0].text.length - 2).split('|');
  var len = data.length;
  res.push('<img ');
  for(var i = 1;i<len;i++){
    if((/^\d.*/).test(data[i])){
      res.push('width="');
      res.push(data[i]);
      var unit = data[i].match(/\D+/)[0];
      if(unit.trim()=="픽셀") unit = "px";
      res.push(unit);
      res.push('"');
    }
  }
  res.push('src="');
  res.push(imgFolder);
  res.push(data[0].substr(3).replace(/ /g,"_"));
  res.push('" />');
  return(res.join(""));
};

function ExtLinkNode(){
  this.type = "EXTERNAL LINK";
  this.children = [];
}
ExtLinkNode.prototype.Process = function(){

};
ExtLinkNode.prototype.Render = function(wikiparser){
  var res = [];
  var oriText = wikiparser.OnlyText(this);
  var innerText = oriText.substring(1, oriText.length -1);
  var innerParsed = innerText.split(' ');
  var linkText = innerParsed[0];
  if(innerParsed[1]===undefined){
    showText = '['+(++wikiparser.linkNum)+']';
  }
  else{
    showText = innerParsed.slice(1).join(" ");
  }
  if(linkText.startsWith("http://")||linkText.startsWith("https://")){
    res.push('<a style="color:#008000;" href="');
    res.push('linktext');
    res.push('">');
    res.push(showText);
    res.push('</a>');
    return res.join("");
  }else return oriText;
};
//////////////////////////////
function RefNode(){
  this.type = "REF";
  this.children = [];
}
RefNode.prototype.Process = function(wikiparser){
  for(var i in this.children){
    var it = this.children[i];
    it.Process();
  }
};
RefNode.prototype.Render = function(wikiparser){
  var num = ++wikiparser.referNum;
  var option = wikiparser.AttrParse(this.children[0].text);
  var res = [];
  var alreadyNamed = false;
  for(var i in option){
    if(option[i][0]=="name"){
      var refname = option[i][1];
      for(var j in wikiparser.referNaming){
        if(wikiparser.referNaming[j][0]==refname){
          num = wikiparser.referNaming[j][1];
          alreadyNamed = true;
          wikiparser.referNum--;
          break;
        }
      }
      if(alreadyNamed===false) wikiparser.referNaming.push([option[i][1],num]);
      break;
    }
  }
  res.push('<sup><a href="#cite_note-');
  res.push(num);
  res.push('"><span class="reference-hooker">[');
  res.push(num);
  res.push("]</span></a></sup>");
  return res.join("");
};
//////////////////////////////
function ReferencesNode(){
  this.type = "REFERENCES";
  this.children = [];
}
ReferencesNode.prototype.Process = function(wikiparser){
  for(var i in this.children){
    var it = this.children[i];
    it.Process();
  }
};
ReferencesNode.prototype.Render = function(wikiparser){
  return("refs here");
};
//////////////////////////////
function HeadingNode(){
  this.type = "HEADING";
  this.children = [];
}
HeadingNode.prototype.Process = function(wikiparser){
  for(var i in this.children){
    var it = this.children[i];
    it.Process();
  }
};
HeadingNode.prototype.Render = function(wikiparser){
  //레벨 2->4로 건너뛰면 버그 발생(MW도 비권장)
  var res = [];
  var curLv = wikiparser.headingQue[wikiparser.headingQueCurr];
  var lastLv = wikiparser.headingQue[wikiparser.headingQueCurr-1];
  if(this.children[0].type == "TEXT"){
    if(this.children[0].text.startsWith("=")){
      this.children[0].text = this.children[0].text.substr(curLv);
    }
  }
  if(this.children[this.children.length - 1].type == "TEXT"){
    var t = this.children[this.children.length - 1].text;
    if(t.endsWith("=")){
      t = t.substring(0, t.length -curLv);
      this.children[this.children.length - 1].text = t;
    }
  }
  if(curLv < wikiparser.headingMin) wikiparser.headingMin = curLv;
  var min = wikiparser.headingMin;
  if(wikiparser.headingQueCurr===0){
    wikiparser.headingNumbering[0] = 1;
  }
  if(wikiparser.headingQueCurr!==0){
    wikiparser.headingNumbering[curLv-min]++;
    if(curLv<lastLv){
      for(var n = curLv-min+1;n<6;n++)
      wikiparser.headingNumbering[n] = 0;
    }
  }
  wikiparser.headingQueCurr++;
  res.push("<h"+curLv+'><a href="#toc">');
  res.push(wikiparser.headingNumbering.join(".").replace(/.0/gi,""));
  res.push(".</a> ");
  var res2 = [];
  for(var i in this.children){
    var it = this.children[i];
    res2.push(it.Render(wikiparser));
  }
  res.push(res2.join("").trim());
  res.push("</h"+curLv+">");
  return res.join("");
};
//////////////////////////////
function BoldNode(){
  this.type = "BOLD";
  this.children = [];
}
BoldNode.prototype.Process = function(){
  for(var i in this.children){
    var it = this.children[i];
    it.Process();
  }
};
BoldNode.prototype.Render = function(wikiparser){
  var res = [];
  if(this.children[0].type == "TEXT"){
    if(this.children[0].text.startsWith("'''")){
      this.children[0].text = this.children[0].text.substr(3);
    }
  }
  if(this.children[this.children.length - 1].type == "TEXT"){
    var t = this.children[this.children.length - 1].text;
    if(t.endsWith("'''")){
      t = t.substring(0, t.length -3);
      this.children[this.children.length - 1].text = t;
    }
  }
  res.push("<strong>");
  for(var i in this.children){

    var it = this.children[i];
    res.push(it.Render(wikiparser));
  }
  res.push("</strong>");
  return res.join("");
};
//////////////////////////////
function ItalicNode(){
  this.type = "ITALIC";
  this.children = [];
}
ItalicNode.prototype.Process = function(){
  for(var i in this.children){
    var it = this.children[i];
    it.Process();
  }
};
ItalicNode.prototype.Render = function(wikiparser){
  var res = [];
  if(this.children[0].type == "TEXT"){
    if(this.children[0].text.startsWith("''")){
      this.children[0].text = this.children[0].text.substr(2);
    }
  }
  if(this.children[this.children.length - 1].type == "TEXT"){
    var t = this.children[this.children.length - 1].text;
    if(t.endsWith("'")){
      t = t.substring(0, t.length -2);
      this.children[this.children.length - 1].text = t;
    }
  }
  res.push("<em>");
  for(var i in this.children){
    var it = this.children[i];
    res.push(it.Render(wikiparser));
  }
  res.push("</em>");
  return res.join("");
};
//////////////////////////////
function TableNode(){
  this.NAME = "TABLE";
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
  var i = 0;
  var j = -1;
  var t;
  var temp;
  if(this.children[0] !== undefined){
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
  var newTextNode;
  for(i in this.children){
    var iter = this.children[i];
    iter.Process();

    if(iter.type == "TEXT"){
      posPreBar = -1;
      temp = iter.text;
      //테이블의 셀을 구한다.
      //셀 파싱 규칙은 '|속성|셀 내용\n'이 기본이며, '|셀 내용\n'이나 '||셀 내용'은 변칙일 뿐이다
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
              item = {attr:"",children:[]};
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
              isStartCell = 0;
              posPreBar = j;
            }
            break;
          }
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
TableNode.prototype.Render = function(wikiparser){
  var res = [];
  res.push("<table ");
  res.push(this.tableattr);
  res.push(">");
  for(var i in this.cells){
    var row = this.cells[i];
    res.push("<tr>");
    for(var j in row){
      var cell = row[j];
      res.push("<td ");
      res.push(cell.attr);
      res.push(">");
      for(var k in cell.children){
        var iter = cell.children[k];
        res.push(iter.Render(wikiparser));
      }
      res.push("</td>");
    }
    res.push("</tr>");
  }
  res.push("</table>");
  return res.join("");
};
//////////////////////////////
function TemplateNode(hooker){
  this.NAME = "TEMPLATE";
  this.children = [];
  this.hooker = hooker;
}
TemplateNode.prototype.Process = function(){

};
TemplateNode.prototype.Render = function(wikiparser){
  return "[템플릿 있던 자리]";
};
////////////////////////////////////////////////////////////
function ListNode(){
  this.children = [];
  this.NAME = "UNNUMBERED LIST";
}
ListNode.prototype.Process = function(){
  for(var i in this.children){
    var it = this.children[i];
    it.Process();
  }
};
ListNode.prototype.Render = function(wikiparser){
  var res = [];
  var stepCount = 0;
  var isNewLine = true;
  var listStack = [];
  var listTag = {"#":"ol","*":"ul"};
  var ch;
  for(var i in this.children){
    var iter = this.children[i];
    if(iter.type != "TEXT"){
      res.push(iter.Render(wikiparser));
    }
    else{
      //새 줄이면 처음에 *이 몇개 있는지 체크해야 한다.
      var text = iter.text;
      var j = 0;
      var k = 0;
      var nowStepCount;
      for(j = 0 ; j < text.length ; j++){
        if(isNewLine){
          isNewLine = false;
          nowStepCount = 0;
          for(k = j; k < text.length ; k++){
            if(text[k] == "*" || text[k] == "#"){
              nowStepCount++;
            }
            else{
              break;
            }
          }
          if(stepCount < nowStepCount){
            listStack.push(text[k - 1]);
            res.push("<");
            res.push(listTag[text[k-1]]);
            res.push(">");
          }
          res.push("<li>");
          stepCount = nowStepCount;
          j = k - 1;
        }
        else{
          if(text[j] == '\n'){
            nowStepCount = 0;
            for(k = j + 1; k < text.length ; k++){
              if(text[k] == "*" || text[k] == "#"){
                nowStepCount++;
              }
              else{
                break;
              }
            }
            if(stepCount > nowStepCount){
              ch = listStack.pop();
              res.push("</");
              res.push(listTag[ch]);
              res.push(">");
            }
            if(stepCount >= nowStepCount){
              res.push("</li>");
            }
            isNewLine = true;
          }
          else{
            res.push(text[j]);
          }
        }
      }
    }
  }
  while(listStack.length !== 0){
    ch = listStack.pop();
    res.push("</li>");
    res.push("</");
    res.push(listTag[ch]);
    res.push(">");
  }
  return res.join("");
};
//////////////////////////////
function LibertyMark(){
  this.children = [];
}
LibertyMark.prototype.Render = function(wikiparser){
  var res = [];
  for(var i in this.children){
    var iter = this.children[i];
    res.push(iter.Render(wikiparser));
  }
  return res.join("");
};
LibertyMark.prototype.Process = function(){
  var res = [];
  for(var i in this.children){
    var iter = this.children[i];
    iter.Process();
  }
};
var MARK_TYPE = {
  STANDALONE:"STANDALONE",
  OPEN_TAG:"OPEN",
  CLOSE_TAG:"CLOSE"
};
function HookMarker(hooker,markType){
  if(hooker === undefined) throw "hooker is undefined!";
  if(markType === undefined) throw "mark type is undefined!";
  this.hooker = hooker;
  this.markType = markType;
  this.NAME = "HOOK MARKER";
}
function WikiParser(){
  this.hookers = [];
  this.markList = [];
  this.headingQue = [];
  this.headingQueCurr = 0;
  this.headingNumbering = [0,0,0,0,0,0];
  this.headingMin = 100;
  this.referNaming = []; //[name, num]을 저장
  this.referNum = 0;
  this.linkNum = 0;
}
WikiParser.prototype.AddHooker = function(hooker){
  this.hookers.push(hooker);
};
WikiParser.prototype.AddMark = function(marker,position){
  var isDoneInsert = false;
  var item = {marker:marker,position:position};
  for(var i in this.markList){
    var iter = this.markList[i];
    if(iter.position > position){
      this.markList.splice(i,0,item);
      isDoneInsert = true;
      break;
    }
  }
  if(isDoneInsert === false){
    this.markList.push(item);
  }
};
WikiParser.prototype.DoBasicMarkTag = function(text,hooker,tagName){
  var lower = text.toLowerCase();
  var idx = 0;
  var len = tagName.length;
  while((idx = lower.indexOf("<"+tagName+" ", idx)) != -1){
    this.AddMark(new HookMarker(hooker, MARK_TYPE.OPEN_TAG),idx);
    idx = lower.indexOf(">", idx);
  }
  idx = 0;
  while((idx = lower.indexOf("<"+tagName+">", idx)) != -1){
    this.AddMark(new HookMarker(hooker, MARK_TYPE.OPEN_TAG),idx);
    idx = lower.indexOf(">", idx);
  }
  idx = 0;
  while((idx = lower.indexOf("</"+tagName, idx)) != -1){
    idx = lower.indexOf(">", idx);
    this.AddMark(new HookMarker(hooker, MARK_TYPE.CLOSE_TAG),idx+1);
  }
};
WikiParser.prototype.DoBasicMarkStandaloneTag = function(text,hooker,tagName){
  var lower = text.toLowerCase();
  var idx = 0;
  var len = tagName.length;
  while((idx = lower.indexOf("<"+tagName, idx)) != -1){
    this.AddMark(new HookMarker(hooker, MARK_TYPE.STANDALONE),idx);
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
      res.push(current.Render(this));
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
WikiParser.prototype.Parse = function(text){
  //여기로 위키텍스트 들어간다
  for(var i in this.hookers){
    //후커 돌면서 DoMark 실행
    var hooker = this.hookers[i];
    hooker.DoMark(this,text);
  }
  var stack = [];
  var lastIdx = 0;
  stack.push(new LibertyMark());//마크 담는 스택
  for(i in this.markList){
    var iter = this.markList[i];
    switch(iter.marker.markType){
      case MARK_TYPE.CLOSE_TAG:{
        if(stack.length == 1){
          throw "parsing error! 짝이 안 맞는다!";
        }
        var lastNode = stack[stack.length - 1];
        stack.pop();
        lastNode.children.push(new TextNode(text.substring(lastIdx, iter.position)));
        lastNode.Process(lastNode);
      }
      break;
      case MARK_TYPE.OPEN_TAG:
      stack[stack.length - 1].children.push(new TextNode(text.substring(lastIdx, iter.position)));
      var node = new iter.marker.hooker.NODE();
      stack[stack.length - 1].children.push(node);
      stack.push(node);
      break;
      case MARK_TYPE.STANDALONE:
      stack[stack.length - 1].children.push(new TextNode(text.substring(lastIdx, iter.position)));
      stack[stack.length - 1].children.push(new iter.marker.hooker.NODE());
      break;
    }
    lastIdx = iter.position;
  }
  if(lastIdx <= text.length -1)
  stack[stack.length - 1].children.push(new TextNode(text.substring(lastIdx, text.length)));


  return this.TextNodeParse(stack[0]);
};
//////////////////////////////
function NowikiHooker(){
  this.NAME = "NOWIKI HOOKER";
  this.NODE = NowikiNode;
}
NowikiHooker.prototype.DoMark = function(wikiparser,text){

  wikiparser.DoBasicMarkTag(text, this, "nowiki");
};
//////////////////////////////
function TemplateHooker(){
  this.NAME = "TAMPLATE HOOKER";
  this.NODE = TemplateNode;
}
TemplateHooker.prototype.DoMark = function(wikiparser, text){
  var idx = 0;
  while((idx = text.indexOf("{{", idx)) != -1){
    wikiparser.AddMark(new HookMarker(this, MARK_TYPE.OPEN_TAG),idx);
    idx += 2;
  }
  idx = 0;
  while((idx = text.indexOf("}}", idx)) != -1){
    idx += 2;
    wikiparser.AddMark(new HookMarker(this, MARK_TYPE.CLOSE_TAG),idx);
  }
};
//////////////////////////////
function TableHooker(){
  this.NAME = "TABLE HOOKER";
  this.NODE = TableNode;
}
TableHooker.prototype.GetStartStrLen = function(text)
{
  return 2;
};
TableHooker.prototype.GetEndStrLen = function(text)
{
  return 2;
};
TableHooker.prototype.DoMark = function(wikiparser, text){
  var idx = 0;
  while((idx = text.indexOf("{|", idx)) != -1){
    wikiparser.AddMark(new HookMarker(this, MARK_TYPE.OPEN_TAG),idx);
    idx += 2;
  }
  idx = 0;
  while((idx = text.indexOf("|}", idx)) != -1){
    idx += 2;
    wikiparser.AddMark(new HookMarker(this, MARK_TYPE.CLOSE_TAG),idx);
  }
};
//////////////////////////////
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
      wikiparser.AddMark(new HookMarker(this, MARK_TYPE.OPEN_TAG),idx);
    }
    else{
      if(text.substr(idx,5) == "'''''"){
        idx+=2;
      }
      wikiparser.AddMark(new HookMarker(this, MARK_TYPE.CLOSE_TAG),idx + 3);
    }
    isStartTag = !isStartTag;
    idx += 3;
  }
};
//////////////////////////////
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
      wikiparser.AddMark(new HookMarker(this, MARK_TYPE.OPEN_TAG),idx);
    }
    else{
      wikiparser.AddMark(new HookMarker(this, MARK_TYPE.CLOSE_TAG),idx + 2);
      if(text.substr(idx,5) == "'''''"){
        idx += 3;
      }
    }
    isStartTag = !isStartTag;
    idx += 2;
  }
};
//////////////////////////////
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
    wikiparser.AddMark(new HookMarker(this, MARK_TYPE.OPEN_TAG),idx+compen);
    idx = text.indexOf("=", idx2);
    wikiparser.AddMark(new HookMarker(this, MARK_TYPE.CLOSE_TAG),idx+compen+level);
    idx += level;
    wikiparser.headingQue.push(level);
    wikiparser.headingQueFront++;
  }
};
//////////////////////////////
function RefHooker(){
  this.NAME = "REF HOOKER";
  this.NODE = RefNode;
}
RefHooker.prototype.DoMark = function(wikiparser,text){
  wikiparser.DoBasicMarkTag(text, this, "ref");
};
//////////////////////////////
function ReferencesHooker(){
  this.NAME = "REFERENCES HOOKER";
  this.NODE = ReferencesNode;
}
ReferencesHooker.prototype.DoMark = function(wikiparser,text){
  wikiparser.DoBasicMarkTag(text, this, "references");
};
//////////////////////////////
function BRTagHooker(){
  this.NAME = "BRTAG HOOKER";
  this.NODE = BRNode;
}
BRTagHooker.prototype.DoMark = function(wikiparser,text){
  var idx = 0;
  while((idx = text.indexOf("\n\n", idx)) != -1){
    wikiparser.AddMark(new HookMarker(this, MARK_TYPE.STANDALONE),idx+1);
    idx += 2;
  }
};
//////////////////////////////
function LinkHooker(){
  this.NAME = "LINK HOOKER";
  this.NODE = LinkNode;
}
LinkHooker.prototype.DoMark = function(wikiparser,text){
  var idx = 0;
  while((idx = text.indexOf("[[", idx)) != -1){
    wikiparser.AddMark(new HookMarker(this, MARK_TYPE.OPEN_TAG),idx);
    idx += 2;
  }
  idx = 0;
  while((idx = text.indexOf("]]", idx)) != -1){
    idx += 2;
    wikiparser.AddMark(new HookMarker(this, MARK_TYPE.CLOSE_TAG),idx);
  }
};
//////////////////////////////
function ExtLinkHooker(){
  this.NAME = "EXTERNAL LINK HOOKER";
  this.NODE = ExtLinkNode;
}
ExtLinkHooker.prototype.DoMark = function(wikiparser,text){
  var idx = 0;
  while((idx = text.indexOf("[", idx)) != -1){
    if(text.charAt(idx+1)!="["){
      wikiparser.AddMark(new HookMarker(this, MARK_TYPE.OPEN_TAG),idx);
      idx += 1;
    }else idx += 2;
  }
  idx = 0;
  while((idx = text.indexOf("]", idx)) != -1){
    if(text.charAt(idx+1)!="]"){
      idx += 1;
      wikiparser.AddMark(new HookMarker(this, MARK_TYPE.CLOSE_TAG),idx);
    }else idx += 2;
  }
};
//////////////////////////////
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
    if( isListStart == -1 && (line.startsWith("*") || line.startsWith("#"))){
      isListStart = i;
      wikiparser.AddMark(new HookMarker(this,MARK_TYPE.OPEN_TAG), idx);
    }
    else if(isListStart != -1 && !(line.startsWith("*") || line.startsWith("#"))){
      wikiparser.AddMark(new HookMarker(this,MARK_TYPE.CLOSE_TAG), idx - 1);
      isListStart = -1;
    }
    idx += line.length + 1;
  }
};
//////////////////////////////
function AfterRender(rendered){
  //렌더링 이후에 다 못한 처리를 한다
  var rules = [[/<script/gi,'&lt;script'],[/<\/script/gi,'&lt;/script'],[/<style/gi,'&lt;style'],[/<\/style/gi,'&lt;/style']];
  for(var i in rules){
    rendered = rendered.replace(rules[i][0], rules[i][1]);
  }
  return rendered;
}
//////////////////////////////
function Parse(text){
  var wikiparser = new WikiParser();
  wikiparser.AddHooker(new NowikiHooker());
  wikiparser.AddHooker(new TemplateHooker());
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
  //위키파서의 파서메소드가 반환하는 것은 LibertyMark객체이다.
  var a = wikiparser.Parse(text);
  var rendered = a.Render(wikiparser);
  var res = AfterRender(rendered);
  //window.document.getElementById("preview").innerHTML = res;
  return res;
  //for node connect
}
module.exports.Parse = Parse;
