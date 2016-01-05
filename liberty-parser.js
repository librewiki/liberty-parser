"USE STRICT";
//*EDITING BY DAMEZUMA, NESSUN
//*author DAMEZUMA, NESSUN
//publish by MIT
//각 클래스 메소드 별 역할
//Render() -> 노드를 HTML로 변환한다.
//Process()-> 노드를 HTML로 변환하기 이전에 해야 할 일들을 한다.
//테이블의 경우 각 셀을 분리하고, 템플릿의 경우에는 틀 이름과 매개변수를 정리한다

function NowikiNode(){
  this.type = "NOWIKI";
  this.children = [];
}
function PreTagNode() {
	this.type = "PRETAG";
	this.children = [];
}
PreTagNode.prototype.Process = function () {
	var stack = [];
};
PreTagNode.prototype.Render = function (wikiparser) {
	res = wikiparser.OnlyText(this);
	return res.replace(/</gi, "&lt;").replace(/>/gi, "&gt;")
	.replace(/&lt;pre&gt;/gi, "<pre>").replace(/&lt;\/pre&gt;/gi, "</pre>")
  .replace(/&lt;nowiki&gt;/gi,"<nowiki>").replace(/&lt;\/nowiki&gt;/gi,"</nowiki>");
};
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
  var isbn = /\d{3}-\d-\d{8}-\d|\d{2}-\d{3}-\d{4}-\d/;
  var lines = this.text.split("\n");
  for (var k=0;k<lines.length;k++){
    var texts = lines[k].split(" ");
    var renderedLine = [];
    for (var i=0;i<texts.length;i++){
      if(texts[i].startsWith("http://")||texts[i].startsWith("https://")){
        renderedLine.push('<a style="color:#008000;" href="');
        renderedLine.push(texts[i]);
        renderedLine.push('">');
        renderedLine.push(texts[i]);
        renderedLine.push('</a>');
      }else if((texts[i]=="ISBN")&&i<texts.length-1){
        if(isbn.test(texts[i+1])){
          renderedLine.push('<a style="color:#6699FF;" href="//librewiki.net/wiki/특수:책찾기/');
          renderedLine.push(texts[i+1]);
          renderedLine.push('">ISBN ');
          renderedLine.push(texts[i+1]);
          renderedLine.push('</a>');
          i++;
        }
      }else renderedLine.push(texts[i]);
    }
    res.push(renderedLine.join(' '));
  }
  return res.join('\n');
};
//////////////////////////////
function BRNode(){
  this.type = "BR";
  this.children = [];
}
BRNode.prototype.Process = function(){
  for(var i in this.children){
		var it = this.children[i];
    it.Process();
	}
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
  for(var i in this.children){
		var it = this.children[i];
		it.Process();
	}
};
LinkNode.prototype.Render = function(wikiparser){
  var res = [];
  var showText = '';
  var srcFront = '//librewiki.net/wiki/';
  var srcEnd = '';
  var isInterwiki = false;
  var i18n = {
    file:new RegExp(wikiparser.i18nKey("file")+'.*',"i")
    //  /(파일|File).*/i
  };
  var intwikiRgx = new RegExp(wikiparser.InterwikiKey()+':.*',"i");
  if(i18n.file.test(this.children[0].text)){
    return this.FileRender(wikiparser);
  }
  var inter = this.children[0].text.match(intwikiRgx);
  if(!isNull(inter)){
    isInterwiki = true;
    var x = wikiparser.interwikis[inter[1]].split("%s");
    srcFront = x[0];
    srcEnd = x[1];
  }
  res.push('<a style="color:#6699FF;" ');
  res.push('"class="');
  if(isInterwiki) res.push('interwiki ');
  res.push('"href="');
  res.push(srcFront);
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
  if(isInterwiki) linkText=linkText.replace(inter[1]+":","");
  res.push(linkText);
  res.push(srcEnd);
  res.push('">');
  res.push(showText);
  res.push('</a>');
  return res.join("");
};
LinkNode.prototype.FileRender = function(wikiparser) {
  var res = [];
  var imgFolder = "//librewiki.net/images/5/5e/";
  var imglink = "//librewiki.net/wiki/";
  var innerText = wikiparser.OnlyText(this);
  var data = innerText.substring(2,innerText.length - 2).split('|');
  var len = data.length;
  res.push('<a class="image" href="');
  res.push(imglink);
  res.push(data[0]);
  res.push('"><img ');
  var thumbIdx = -1;
  for(var i = 1;i<len;i++){
    if((/^\d.*/).test(data[i])){
      res.push('width="');
      res.push(data[i].match(/\d+/)[0]);
      var unit = data[i].match(/\D+/)[0];
      if(unit.trim()=="픽셀") unit = "px";
      res.push(unit);
      res.push('" ');
    }
    else if((/thumb|섬네일/i).test(data[i].trim())){
      res.push('class="thumbimage" ');
      thumbIdx = i+1;
    }
    else if(data[i].trim()=="왼쪽"){
      //왼쪽오른쪽 넣어주긴 해야 하는데
    }
    else if(i==thumbIdx){
      res.push('src="');
      res.push(imgFolder);
      res.push(data[0].substr(3).replace(/ /g,"_"));
      res.push('" /></a>');
      res.push('<div class="thumbcaption">');
      var temp = [];
      for(var k in this.children){
        var it = this.children[k];
        temp.push(it.Render(wikiparser));
      }
      var innerThumb = temp.join('').split(/\|섬네일\||\|thumb\|/i)[1];
      innerThumb = innerThumb.substring(0,innerThumb.length-2);
      res.push(innerThumb);
      res.push('</div>');
      break;
    }
  }
  if(thumbIdx==-1){
    res.push('src="');
    res.push(imgFolder);
    res.push(data[0].substr(3).replace(/ /g,"_"));
    res.push('" /></a>');
  }
  return(res.join(""));
};

function ExtLinkNode(){
  this.type = "EXTERNAL LINK";
  this.children = [];
}
ExtLinkNode.prototype.Process = function(){
  for(var i in this.children){
		var it = this.children[i];
		it.Process();
	}
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
    res.push(linkText);
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
  var contentArr = [];
  for(var k in this.children){
    var it = this.children[k];
    contentArr.push(it.Render(wikiparser));
  }
  var content = contentArr.join("");
  var temp = content.indexOf('>');
  content = content.substr(temp+1);
  content = content.substring(0, content.indexOf('</ref')).trim();
  var res = [];
  var alreadyNamed = false;
  var named = false;
  var j = 0;
  for(var i in option){
    if(option[i][0]=="name"){
      named = true;
      var refname = option[i][1];
      for(j in wikiparser.referNaming){
        if(wikiparser.referNaming[j][0]==refname){
          num = wikiparser.referNaming[j][1];
          wikiparser.referNaming[j][2]++;
          alreadyNamed = true;
          wikiparser.referNum--;
          break;
        }
      }
      if(alreadyNamed===false) wikiparser.referNaming.push([option[i][1],num,0,0]);
      break;
    }
  }
  if(alreadyNamed===false) wikiparser.referContent.push(content);
  res.push('<sup id="cite_ref-');
  if(named){
    res.push(wikiparser.referNaming[j][0]);
    res.push('_');
    res.push(num);
    res.push('-');
    res.push(wikiparser.referNaming[j][3]++);
  }
  else res.push(num);
  res.push('" class="reference"><a href="#cite_note-');
  if(named){
    res.push(wikiparser.referNaming[j][0]);
    res.push('-');
  }
  res.push(num);
  res.push('"><span class="reference-hooker">[');
  res.push(num-wikiparser.referRestart);
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
  var res = [];
  var refs = wikiparser.referNum - wikiparser.referRestart;
  res.push('<ol class="references">');
  for(var num = 1;num<=refs; num++){
    var named = false;
    var nameNum = 0;
    res.push('<li id="cite_note-');
    for(var i in wikiparser.referNaming){
      if(wikiparser.referNaming[i][1]==num+wikiparser.referRestart){
        named = true;
        nameNum = i;
      }
    }
    if(named){
      res.push(wikiparser.referNaming[nameNum][0]);
      res.push('-');
      res.push(wikiparser.referNaming[nameNum][1]);
      res.push('"><span class="mw-cite-backlink">↑');
      for(var k =0; k<=wikiparser.referNaming[nameNum][2];k++){
        res.push('<sup><a href="#cite_ref-');
        res.push(wikiparser.referNaming[nameNum][0]);
        res.push('_');
        res.push(num+wikiparser.referRestart);
        res.push('-');
        res.push(k);
        res.push('">');
        res.push(num);
        res.push('.');
        res.push(k);
        res.push('</a></sup> ');
      }
      res.push('<span class="reference-text">');
      res.push(wikiparser.referContent[num+wikiparser.referRestart-1]);
      res.push('</span></li>');
    }else{
      res.push(num+wikiparser.referRestart);
      res.push('"><span class="mw-cite-backlink"><a href="#cite_ref-');
      res.push(num+wikiparser.referRestart);
      res.push('">↑</a></span> <span class="reference-text">');
      res.push(wikiparser.referContent[num+wikiparser.referRestart-1]);
      res.push('</span></li>');
    }
  }
  res.push('</ol>');
  wikiparser.referRestart = wikiparser.referNum;
  return res.join("");
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
  for(var k in wikiparser.headingNumbering){
    if(wikiparser.headingNumbering[k]!==0){
      res.push(wikiparser.headingNumbering[k]);
      res.push('.');
    }
  }
  res.push("</a> ");
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

      res.push("<");
      if(cell.isHead){
        res.push("th ");
      }
      else{
        res.push("td ");
      }
      res.push(cell.attr);
      res.push(">");
      for(var k in cell.children)
      {
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
  this.NAME = "LIST";
}
ListNode.prototype.Process = function(){
  for(var i in this.children){
    var it = this.children[i];
    it.Process();
  }
};
ListNode.prototype.common = function(st1,st2){
  var fl = st1.length;
  var shorter = st2.length;
  var Tags = {
    "*" : "ul",
    "#" : "ol",
    ";" : "dl",
    ":" : "dl"
  };
  if ( fl < shorter ) {
    shorter = fl;
  }
  var i;
  for ( i = 0; i < shorter; ++i ) {
    if ( Tags[st1[i]] != Tags[st2[i]] ) {
      break;
    }
  }
  return i;
};
function ListSubNode(prefixStr,prefixChar,text,continueous){
  this.prefixStr = prefixStr;
  this.prefixChar = prefixChar;
  this.children = [];
  this.isContinuous = continueous;
  this.text = text;
  this.st1 = '';
  this.st2 = '';
  this.Tags = {
    "*" : ["ul","li"],
    "#" : ["ol","li"],
    ";" : ["dl","dt"],
    ":" : ["dl","dd"]
  };
}
ListSubNode.prototype.push1 = function(res){
  this.st1 = this.Tags[this.prefixChar][0];
  res.push("\n<");
  res.push(this.st1);
  res.push(">");
};
ListSubNode.prototype.push2 = function(res){
  this.st2 = this.Tags[this.prefixChar][1];
  res.push("<");
  res.push(this.st2);
  res.push(">");
};
ListSubNode.prototype.pop1 = function(res){
  if(this.st1!==''){
    res.push("</");
    res.push(this.st1);
    res.push(">\n");
    this.st1='';
  }
};
ListSubNode.prototype.pop2 = function(res){
  if(this.st2!==''){
    res.push("</");
    res.push(this.st2);
    res.push(">");
    this.st2='';
  }
};
ListSubNode.prototype.Render = function(res){
  if(!this.isContinuous) this.push1(res);
  this.push2(res);
  res.push(this.text);
  for(var i in this.children){
    var iter = this.children[i];
    if(iter.isContinuous){
      this.pop2(res);
    }
    iter.Render(res);
  }
  this.pop2(res);
  this.pop1(res);
};
ListNode.prototype.Render = function(wikiparser){
  var res = [];
  var prfs = ["*","#",";",":"];
  var subnodeStack = [];
  var lines = [];
  var stbuilder = [];
  var i;
  this.children[this.children.length-1].text+="\n";
  for(i in this.children){
    //라인별로 분리한다.
    var iter = this.children[i];
    if(iter.type != "TEXT"){
      stbuilder.push(iter.Render(wikiparser));
    }
    else{
      var text = iter.Render(wikiparser);
      var tleng = text.length;
      for(var j = 0;j<tleng;j++){
        if(text[j]=="\n"){
          lines.push(stbuilder.join(""));
          stbuilder = [];
        }
        else{
          stbuilder.push(text[j]);
        }
      }
    }
  }
  lines.push("endoflist");
  for(i in lines){
    var line = lines[i];
    var lineleng = line.length;
    var k;
    for(k = 0;k<lineleng;k++){
      if(prfs.indexOf(line[k]) === -1){
        if(subnodeStack.length===0){
          subnodeStack.push(new ListSubNode(line.substr(0,k),line[k-1],line.substr(k),false));
        }
        else{
          while(subnodeStack.length>0){
            var last = subnodeStack[subnodeStack.length-1];
            var x = this.common(last.prefixStr,line.substr(0,k));
            if(x==last.prefixStr.length){
              var sn = new ListSubNode(line.substr(0,k),line[k-1],line.substr(k),x==k);
              last.children.push(sn);
              subnodeStack.push(sn);
              break;
            }
            else{
              if(subnodeStack.length==1){
                subnodeStack.pop().Render(res);
              }
              else subnodeStack.pop();
            }
          }
          if(subnodeStack.length===0){
            subnodeStack.push(new ListSubNode(line.substr(0,k),line[k-1],line.substr(k),false));
          }
        }
        break;
      }
    }
  }
  return res.join("");
};
function HRNode(){
  this.children = [];
  this.NAME = "HR";
}
HRNode.prototype.Process = function(){

};
HRNode.prototype.Render = function(wikiparser){
  return "<hr />";
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
  this.i18ns = {};
  this.local = "english";
  this.interwikis = {};
  this.hookers = [];
  this.markList = [];
  this.headingQue = [];
  this.headingQueCurr = 0;
  this.headingNumbering = [0,0,0,0,0,0];
  this.headingMin = 100;
  this.referNaming = []; //[name, 번호, 횟수, 횟수2]을 저장
  this.referNum = 0;
  this.referRestart = 0;
  this.referContent = [];
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
  //여기로 위키텍스트 들어간다
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
        if(stack.length == 1){
          continue;
        }

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
    wikiparser.AddMark(new HookMarker(this, MARK_TYPE.OPEN_TAG,idx));
    idx += 2;
  }
  idx = 0;
  while((idx = text.indexOf("}}", idx)) != -1){
    idx += 2;
    wikiparser.AddMark(new HookMarker(this, MARK_TYPE.CLOSE_TAG,idx));
  }
};
//////////////////////////////
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
    wikiparser.AddMark(new HookMarker(this, MARK_TYPE.OPEN_TAG,idx+compen));
    idx = text.indexOf("=", idx2);
    wikiparser.AddMark(new HookMarker(this, MARK_TYPE.CLOSE_TAG,idx+compen+level));
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
  wikiparser.DoBasicMarkStandaloneTag(text, this, "references");
};
//////////////////////////////
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
//////////////////////////////
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
//////////////////////////////
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
    if( isListStart == -1 && (line.startsWith("*") || line.startsWith("#") || line.startsWith(";") || line.startsWith(":"))){
      isListStart = i;
      wikiparser.AddMark(new HookMarker(this,MARK_TYPE.OPEN_TAG,idx));
    }
    else if(isListStart != -1 && !(line.startsWith("*") || line.startsWith("#") || line.startsWith(";") || line.startsWith(":"))){
      wikiparser.AddMark(new HookMarker(this,MARK_TYPE.CLOSE_TAG, idx - 1));
      isListStart = -1;
    }
    idx += line.length + 1;
  }
};
//////////////////////////////
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
function PreTagHooker(){
 	this.NAME = "PRETAG HOOKER";
	this.NODE = PreTagNode;
}
PreTagHooker.prototype.DoMark = function (wikiparser, text) {
	wikiparser.DoBasicMarkTag(text, this, "pre");
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


function isNull(obj){
  return obj === null || obj === undefined;
}

//////////////////////////////
function Parse(text){
  var wikiparser = new WikiParser();
  if(isNull(wikiparser.constructor)){
    throw "The javascript interpreter is not support dameparser! it have to support constructor property";
  }
  wikiparser.AddHooker(new NowikiHooker());
  wikiparser.AddHooker(new PreTagHooker());
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
  wikiparser.AddHooker(new HRHooker());
  //지원하고자 하는 언어를 추가
  wikiparser.Addi18n("english");
  wikiparser.Addi18n("korean");
  //서비스 언어를 설정
  wikiparser.local = "korean";
  wikiparser.AddInterwiki("./interwiki.json");
  //위키파서의 파서메소드가 반환하는 것은 LibertyMark객체이다.
  var a = wikiparser.Parse(text);
  var rendered = a.Render(wikiparser);
  var res = AfterRender(rendered);
  //window.document.getElementById("preview").innerHTML = res;
  return res;
  //for node connect
}
module.exports.Parse = Parse;
