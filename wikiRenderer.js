function Render(wikiparser, node, callback){
  callback(Render[node.render](wikiparser, node));
}
Render.liberty = function(wikiparser, node) {
  var res = [];
  for (var i in node.children) {
    var iter = node.children[i];
    res.push(Render[iter.render](wikiparser, iter));
  }
  return res.join("");
};

//no use
Render.nowiki = function(wikiparser, node) {
  var res = wikiparser.OnlyText(node);
  return res.
  replace(/</gi,"&lt;").
  replace(/>/gi,"&gt;").
  replace(/&lt;nowiki&gt;/gi,"<nowiki>").
  replace(/&lt;\/nowiki&gt;/gi,"</nowiki>");
};
//no use
Render.pretag = function(wikiparser, node) {
  res = wikiparser.OnlyText(node);
  return res.replace(/</gi, "&lt;").
  replace(/>/gi, "&gt;").
  replace(/&lt;pre&gt;/gi, "<pre>").
  replace(/&lt;\/pre&gt;/gi, "</pre>").
  replace(/&lt;nowiki&gt;/gi,"<nowiki>").
  replace(/&lt;\/nowiki&gt;/gi,"</nowiki>");
};
//no use
Render.math = function(wikiparser, node) {
  var res = wikiparser.OnlyText(node);
  return res;
};

Render.text = function(wikiparser, node) {
  var res = [];
  var isbn = /\d{3}-\d-\d{8}-\d|\d{2}-\d{3}-\d{4}-\d/;
  var lines = node.text.split("\n");
  for (var k=0;k<lines.length;k++){
    var texts = lines[k].split(" ");
    var renderedLine = [];
    for (var i=0;i<texts.length;i++) {
      if (texts[i].search(/^((http|https|ftp|sftp|gopher|telnet|news|mailto|ed2k):\/\/|magnet:).*/i)!==-1) {
        renderedLine.push('<a class="external" href="');
        renderedLine.push(texts[i]);
        renderedLine.push('">');
        renderedLine.push(texts[i]);
        renderedLine.push('</a>');
      } else if((texts[i]=="ISBN")&&i<texts.length-1) {
        if (isbn.test(texts[i+1])) {
          renderedLine.push('<a href="//librewiki.net/wiki/특수:책찾기/');
          renderedLine.push(texts[i+1]);
          renderedLine.push('">ISBN ');
          renderedLine.push(texts[i+1]);
          renderedLine.push('</a>');
          i++;
        }
      } else renderedLine.push(texts[i]);
    }
    res.push(renderedLine.join(' '));
  }
  return res.join('\n');
};
Render.link = function(wikiparser, node) {
  var res = [];
  var showText = '';
  //var srcFront = '//librewiki.net/wiki/';
  var srcFront = '';
  var srcEnd = '';
  var isInterwiki = false;
  var i18n = {
    file:new RegExp(wikiparser.i18nKey("file")+'.*',"i")
    //  /(파일|File).* /i
  };
  var intwikiRgx = new RegExp(wikiparser.InterwikiKey()+':.*',"i");
  if (node.children[0].text[2]!==":") {
    if (i18n.file.test(node.children[0].text)) {
      return Render.link.FileRender(wikiparser, node);
    }
  } else {
    node.children[0].text = node.children[0].text.replace(":","");
  }
  var inter = node.children[0].text.match(intwikiRgx);
  if (!isNull(inter)) {
    isInterwiki = true;
    var x = wikiparser.interwikis[inter[1]].split("%s");
    srcFront = x[0];
    srcEnd = x[1];
  }
  res.push('<a class="');
  if (isInterwiki) res.push('interwiki ');
  res.push('" href="');
  res.push(srcFront);
  if (node.children[0].type == "TEXT") {
    if (node.children[0].text.startsWith("[[")) {
      node.children[0].text = node.children[0].text.substr(2);
    }
  }
  if (node.children[node.children.length - 1].type == "TEXT") {
    var t = node.children[node.children.length - 1].text;
    if (t.endsWith("]]")) {
      t = t.substring(0, t.length -2);
      node.children[node.children.length - 1].text = t;
    }
  }
  var innerText = wikiparser.OnlyText(node).split("|");
  var linkText = innerText[0];
  if (innerText[1]===undefined) {
    showText = linkText;
  }
  else{
    showText = innerText.slice(1).join("|");
  }
  if (isInterwiki) linkText=linkText.replace(inter[1]+":","");
  res.push(linkText);
  res.push(srcEnd);
  res.push('">');
  res.push(showText);
  res.push('</a>');
  return res.join("");
};
Render.link.FileRender = function(wikiparser, node){
  var res = [];
  var imgFolder = "/file/";
  var imglink = "/wiki/";
  var innerText = wikiparser.OnlyText(node);
  var data = innerText.substring(2,innerText.length - 2).split('|');
  var len = data.length;
  res.push('<a class="image" href="');
  res.push(imglink);
  res.push(data[0]);
  res.push('"><img ');
  var thumbIdx = -1;
  for (var i = 1;i<len;i++) {
    if ((/^\d.*/).test(data[i])) {
      res.push('width="');
      res.push(data[i].match(/\d+/)[0]);
      var unit = data[i].match(/\D+/)[0];
      if (unit.trim()=="픽셀") unit = "px";
      res.push(unit);
      res.push('" ');
    }
    else if ((/thumb|섬네일/i).test(data[i].trim())){
      res.push('class="thumbimage" ');
      thumbIdx = i+1;
    }
    else if (data[i].trim()=="왼쪽") {
      //왼쪽오른쪽 넣어주긴 해야 하는데
    }
    else if (i==thumbIdx) {
      res.push('src="');
      res.push(imgFolder);
      res.push(data[0].substr(3).replace(/ /g,"_"));
      res.push('" /></a>');
      res.push('<div class="thumbcaption">');
      var temp = [];
      for (var k in node.children) {
        var it = node.children[k];
        temp.push(Render[it.render](wikiparser, it));
      }
      var innerThumb = temp.join('').split(/\|섬네일\||\|thumb\|/i)[1];
      innerThumb = innerThumb.substring(0,innerThumb.length-2);
      res.push(innerThumb);
      res.push('</div>');
      break;
    }
  }
  if (thumbIdx==-1) {
    res.push('src="');
    res.push(imgFolder);
    res.push(data[0].substr(3).replace(/ /g,"_"));
    res.push('" /></a>');
  }
  return res.join("");
};
Render.extlink = function(wikiparser, node) {
  var res = [];
  var oriText = wikiparser.OnlyText(node);
  var innerText = oriText.substring(1, oriText.length -1);
  var innerParsed = innerText.split(' ');
  var linkText = innerParsed[0];
  if (innerParsed[1]===undefined) {
    showText = '['+(++wikiparser.linkNum)+']';
  }
  else {
    showText = innerParsed.slice(1).join(" ");
  }
  if (linkText.search(/((http|https|ftp|sftp|gopher|telnet|news|mailto|ed2k):\/\/|magnet:).*/i)!==-1) {
    res.push('<a class="external" href="');
    res.push(linkText);
    res.push('">');
    res.push(showText);
    res.push('</a>');
    return res.join("");
  } else return oriText;
};
Render.ref = function(wikiparser, node) {
  var option = wikiparser.AttrParse(node.children[0].text);
  var named = false, alreadyNamed = false;
  var res = [];
  var contentArr = [];
  for (var k in node.children) {
    var it = node.children[k];
    contentArr.push(Render[it.render](wikiparser, it));
  }
  var content = contentArr.join("");
  var temp = content.indexOf('>');
  content = content.substr(temp+1);
  content = content.substring(0, content.indexOf('</ref')).trim();
  for (var i in option) {
    if (option[i][0]=="name") {
      named = true;
      var refname = option[i][1];
      for (var j = wikiparser.references.length-1; j >= wikiparser.lastReferencesIdx; j--) {
        if (wikiparser.references[j].name==refname) {
          wikiparser.references.push({
            abs : wikiparser.references[j].abs,
            name : option[i][1],
            innernum : wikiparser.references[j].innernum+1,
            content : null
          });
          alreadyNamed = true;
          break;
        }
      }
      if (alreadyNamed===false) {
        wikiparser.references.push({
          abs : ++wikiparser.maxRefAbs,
          name : option[i][1],
          innernum : 0,
          content : content
        });
      }
      break;
    }
  }
  if (named===false) {
    wikiparser.references.push({
      abs : ++wikiparser.maxRefAbs,
      name : null,
      innernum : 0,
      content : content
    });
  }
  var ref = wikiparser.references[wikiparser.references.length-1];
  res.push('<sup id="cite_ref-');
  if (ref.name!==null) {
    res.push(ref.name);
    res.push('_');
    res.push(ref.abs);
    res.push('-');
    res.push(ref.innernum);
  } else {
    res.push(ref.abs);
  }
  res.push('" class="references"><a href="#cite_note-');
  if (ref.name!==null) {
    res.push(ref.name);
    res.push('-');
  }
  res.push(ref.abs);
  res.push('"><span class="reference-hooker">[');
  res.push(ref.abs-wikiparser.lastReferencesAbs);
  res.push(']</span></a></sup>');
  return res.join("");
};
Render.references = function(wikiparser, node) {
  var res = [];
  var refs = [];
  var i, ref;
  res.push('<ol class="references">');
  for (i = wikiparser.lastReferencesIdx; i < wikiparser.references.length; i++) {
    ref = wikiparser.references[i];
    var alreadyNamed = false;
    if (ref.name !== null) {
      for (var j = 0; j < refs.length; j++) {
        if (refs[j].abs === ref.abs) {
          refs[j].count++;
          alreadyNamed = true;
          break;
        }
      }
    }
    if (alreadyNamed === false) {
      refs.push({
        abs : ref.abs,
        name : ref.name,
        content : ref.content,
        count : 1
      });
    }
  }
  for (i = 0; i < refs.length; i++) {
    ref = refs[i];
    if (ref.count==1) {
      res.push('<li id="cite_note-');
      if (ref.name!==null) {
        res.push(ref.name);
        res.push('-');
      }
      res.push(ref.abs);
      res.push('"><span class="mw-cite-backlink"><a href="#cite_ref-');
      if (ref.name!==null) {
        res.push(ref.name);
        res.push('_');
        res.push(ref.abs);
        res.push('-0');
      } else {
        res.push(ref.abs);
      }
      res.push('"><span style="display:none" class="cite-accessibility-label">이동</span>↑ </a></span><span class="reference-text">');
      res.push(ref.content);
      res.push('</span></li>');
    } else {
      res.push('<li id="cite_note-');
      res.push(ref.name);
      res.push('-');
      res.push(ref.abs);
      res.push('"><span class="mw-cite-backlink">↑ ');
      for (var k = 0; k < ref.count; k++) {
        res.push('<sup><a href="#cite_ref-');
        res.push(ref.name);
        res.push('_');
        res.push(ref.abs);
        res.push('-');
        res.push(k);
        res.push('"><span style="display:none" class="cite-accessibility-label">이동:</span>');
        res.push(ref.abs-wikiparser.lastReferencesAbs);
        res.push('.');
        res.push(k);
        res.push('</a></sup>');
        if (k !== ref.count-1) {
          res.push(' ');
        }
      }
      res.push('</span><span class="reference-text">');
      res.push(ref.content);
      res.push('</span></li>\n');
    }
  }
  res.push("</ol>");
  wikiparser.lastReferencesAbs = wikiparser.maxRefAbs;
  wikiparser.lastReferencesIdx = wikiparser.references.length;
  return res.join("");
};
Render.heading = function(wikiparser, node) {
  //레벨 2->4로 건너뛰면 버그 발생(MW도 비권장)
  wikiparser.headingCount++;
  var res = [];
  var curLv = wikiparser.headingQue[wikiparser.headingQueCurr];
  var lastLv = wikiparser.headingQue[wikiparser.headingQueCurr-1];
  if (node.children[0].type == "TEXT") {
    if (node.children[0].text.startsWith("=")) {
      node.children[0].text = node.children[0].text.substr(curLv);
    }
  }
  if (node.children[node.children.length - 1].type == "TEXT") {
    var t = node.children[node.children.length - 1].text;
    if (t.endsWith("=")) {
      t = t.substring(0, t.length -curLv);
      node.children[node.children.length - 1].text = t;
    }
  }
  if (curLv < wikiparser.headingMin) wikiparser.headingMin = curLv;
  var min = wikiparser.headingMin;
  if (wikiparser.headingQueCurr===0) {
    wikiparser.headingNumbering[0] = 1;
  }
  if (wikiparser.headingQueCurr!==0) {
    wikiparser.headingNumbering[curLv-min]++;
    if (curLv<lastLv) {
      for(var n = curLv-min+1;n<6;n++)
      wikiparser.headingNumbering[n] = 0;
    }
  }
  wikiparser.headingQueCurr++;
  var res2 = [];
  for (var k in wikiparser.headingNumbering) {
    if (wikiparser.headingNumbering[k]!==0) {
      res2.push(wikiparser.headingNumbering[k]);
      res2.push('.');
    }
  }
  res2.pop();
  var number = res2.join("");
  res.push('<h');
  res.push(curLv);
  res.push('><span id="s-');
  res.push(number);
  res.push('" class="mw-headline"><a href="#toctitle">');
  res.push(number);
  res.push("</a> ");
  var res3 = [];
  for (var i in node.children) {
    var it = node.children[i];
    res3.push(Render[it.render](wikiparser, it));
  }
  var content = res3.join("").trim();
  wikiparser.headingContents.push([number,content,curLv-min+1]);
  res.push(content);
  res.push('</span>');
  //editsection
  res.push("</h"+curLv+">");
  return res.join("");
};
Render.bold = function(wikiparser, node) {
  var res = [];
  if (node.children[0].type == "TEXT") {
    if (node.children[0].text.startsWith("'''")) {
      node.children[0].text = node.children[0].text.substr(3);
    }
  }
  if (node.children[node.children.length - 1].type == "TEXT") {
    var t = node.children[node.children.length - 1].text;
    if (t.endsWith("'''")) {
      t = t.substring(0, t.length -3);
      node.children[node.children.length - 1].text = t;
    }
  }
  res.push("<strong>");
  for (var i in node.children) {

    var it = node.children[i];
    res.push(Render[it.render](wikiparser, it));
  }
  res.push("</strong>");
  return res.join("");
};
Render.italic = function(wikiparser, node) {
  var res = [];
  if (node.children[0].type == "TEXT") {
    if (node.children[0].text.startsWith("''")) {
      node.children[0].text = node.children[0].text.substr(2);
    }
  }
  if (node.children[node.children.length - 1].type == "TEXT") {
    var t = node.children[node.children.length - 1].text;
    if (t.endsWith("'")) {
      t = t.substring(0, t.length -2);
      node.children[node.children.length - 1].text = t;
    }
  }
  res.push("<em>");
  for (var i in node.children) {
    var it = node.children[i];
    res.push(Render[it.render](wikiparser, it));
  }
  res.push("</em>");
  return res.join("");
};
Render.table = function(wikiparser, node) {
  var res = [];
  var lines = [];
  var stbuilder = [];
  var i, line;
  var reg = /((class|style|align|colspan|rowspan)+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/gi;
  node.children[node.children.length-1].text+="\n";
  for(i in node.children){
    //라인별로 분리한다.
    var iter = node.children[i];
    if (iter.type != "TEXT") {
      stbuilder.push(Render[iter.render](wikiparser, iter));
    }
    else{
      var text = Render[iter.render](wikiparser, iter);
      var tleng = text.length;
      var idx2=-1;
      for(var j = 0;j<tleng;++j){
        if(text[j]=="\n"){
          line = stbuilder.join("").trim();
          if ((!line.startsWith("|"))&&(!line.startsWith("!"))) {
            if (lines.length===0) lines.push(line);
            else {
              if ((idx2 = line.search(/\n\||\n!/))!==-1) {
                lines[lines.length-1] += line.substring(0,idx2);
                lines.push(line[idx2+1] + line.substring(idx2+2).trim());
              } else lines[lines.length-1] += line;
            }
          } else {
            while ((idx2 = line.search(/\|\||!!/))!==-1) {
              lines.push(line.substring(0,idx2));
              line = line[idx2] + " " + line.substring(idx2+2).trim();
            }
            lines.push(line);
          }
          stbuilder = [];
        }
        else {
          stbuilder.push(text[j]);
        }
      }
    }
  }
  if (lines[lines.length-1]!=="|}") {
    return "<h5>error</h5>";
  }
  res.push("<table");
  var tableattr = lines[0].match(reg);
  if (!isNull(tableattr)) {
    res.push(" ");
    res.push(tableattr.join(" "));
  }
  res.push(">");
  i=1;
  if (lines[1][1]=="+") {
    res.push("\n<caption>");
    res.push(lines[1].substr(2).trim());
    res.push("</caption>\n");
    i=2;
  }
  res.push("<tbody>\n");
  var content;
  var open = true;
out:
  for (;i<lines.length-1;++i) {
    line = lines[i];
    switch (line[0]+line[1]) {
      case "|-":
        if (lines[i+1][1]=="-") continue;
        else if (lines[i+1][1]=="}") {
          break out;
        }
        else {
          if (open) {
            res.push("<tr");
            open = false;
          } else {
            res.push("</tr>\n<tr");
          }
          var rowattr = line.match(reg);
          if (!isNull(rowattr)) {
            res.push(" ");
            res.push(rowattr.join(" "));
          }
          res.push(">");
        }
        break;
      case "| ":
        content = line.substr(2).split("|");
        if (!isNull(content[1])) {
          var cellattr = content[0].match(reg);
          if (!isNull(cellattr)) {
            res.push("<td ");
            res.push(cellattr.join(" "));
            res.push(">");
          } else res.push("<td>");
          res.push(content[1].trim());
          res.push("</td>\n");
        } else {
          res.push("<td>");
          res.push(content[0].trim());
          res.push("</td>\n");
        }
        break;
      case "! ":
        content = line.substr(2).split("|");
        if (!isNull(content[1])) {
          var thattr = content[0].match(reg);
          if (!isNull(thattr)) {
            res.push("<th ");
            res.push(thattr.join(" "));
            res.push(">");
          } else {
            res.push("<th>");
          }
          res.push(content[1].trim());
          res.push("</th>\n");
        } else {
          res.push("<th>");
          res.push(content[0].trim());
          res.push("</th>\n");
        }
        break;
      default:
      if (line[1]!==' ') {
        lines[i]=lines[i][0]+" "+lines[i].substr(1);
        i--;
      }
    }
  }
  res.push("</tr></tbody></table>");
  return res.join("");
};
Render.list = function(wikiparser, node) {
  var res = [];
  var prfs = ["*","#",";",":"];
  var subnodeStack = [];
  var lines = [];
  var stbuilder = [];
  var i;
  node.children[node.children.length-1].text+="\n";
  for (i in node.children) {
    //라인별로 분리한다.
    var iter = node.children[i];
    if (iter.type != "TEXT") {
      stbuilder.push(Render[iter.render](wikiparser, iter));
    }
    else {
      var text = Render[iter.render](wikiparser, iter);
      var tleng = text.length;
      for (var j = 0;j<tleng;j++) {
        if (text[j]=="\n") {
          lines.push(stbuilder.join(""));
          stbuilder = [];
        }
        else {
          stbuilder.push(text[j]);
        }
      }
    }
  }
  lines.push("endoflist");
  for (i in lines) {
    var line = lines[i];
    var lineleng = line.length;
    var k;
    for (k = 0; k<lineleng; k++) {
      if (prfs.indexOf(line[k]) === -1) {
        if (subnodeStack.length===0) {
          subnodeStack.push(new ListSubNode(line.substr(0,k),line[k-1],line.substr(k),false));
        }
        else {
          while (subnodeStack.length>0) {
            var last = subnodeStack[subnodeStack.length-1];
            var x = Render.list.common(last.prefixStr,line.substr(0,k));
            if (x==last.prefixStr.length) {
              var sn = new ListSubNode(line.substr(0,k),line[k-1],line.substr(k),x==k);
              last.children.push(sn);
              subnodeStack.push(sn);
              break;
            }
            else {
              if (subnodeStack.length==1) {
                subnodeStack.pop().Render(res);
              }
              else subnodeStack.pop();
            }
          }
          if (subnodeStack.length===0) {
            subnodeStack.push(new ListSubNode(line.substr(0,k),line[k-1],line.substr(k),false));
          }
        }
        break;
      }
    }
  }
  return res.join("");
};
Render.list.common = function(st1,st2) {
  var fl = st1.length;
  var shorter = st2.length;
  var Tags = {
    "*" : "ul",
    "#" : "ol",
    ";" : "dl",
    ":" : "dl"
  };
  if (fl < shorter) {
    shorter = fl;
  }
  var i;
  for (i = 0; i < shorter; ++i) {
    if (Tags[st1[i]] !== Tags[st2[i]]) {
      break;
    }
  }
  return i;
};
function ListSubNode (prefixStr,prefixChar,text,continueous) {
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
ListSubNode.prototype.push1 = function(res) {
  this.st1 = this.Tags[this.prefixChar][0];
  res.push("\n<");
  res.push(this.st1);
  res.push(">");
};
ListSubNode.prototype.push2 = function(res) {
  this.st2 = this.Tags[this.prefixChar][1];
  res.push("<");
  res.push(this.st2);
  res.push(">");
};
ListSubNode.prototype.pop1 = function(res) {
  if (this.st1!=='') {
    res.push("</");
    res.push(this.st1);
    res.push(">\n");
    this.st1='';
  }
};
ListSubNode.prototype.pop2 = function(res) {
  if (this.st2!=='') {
    res.push("</");
    res.push(this.st2);
    res.push(">");
    this.st2='';
  }
};
ListSubNode.prototype.Render = function(res) {
  if (!this.isContinuous) this.push1(res);
  this.push2(res);
  res.push(this.text);
  for (var i in this.children) {
    var iter = this.children[i];
    if (iter.isContinuous) {
      this.pop2(res);
    }
    iter.Render(res);
  }
  this.pop2(res);
  this.pop1(res);
};

Render.brtag = function(wikiparser, node) {
  return "<br />";
};
Render.hr = function(wikiparser, node) {
  return "<hr />";
};
function isNull(obj){
  return obj === null || obj === undefined;
}

module.exports.Render = Render;
