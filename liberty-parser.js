
//EDITING BY DAMEZUMA

function NowikiNode(text)
{
    this.type = "NOWIKI";
    this.text = text;
}
NowikiNode.prototype.toHtml = function(){
  return this.text.replace(/</gi,"&lt;").replace(/>/gi,"&gt;");  
};
function TextNode(text)
{
    this.type = "TEXT";
    this.text = text;
}
function HeadingNode(text)
{
    
}
function ArticleNode(text)
{
    
}
function LinkNode(text)
{
    
}
function ReferenceNode(text)
{
    
}
function Insert(obj, index, item)
{
    var a = obj.splice(index);
    obj.push(item);
    for(i in a)obj.push(a[i]);
}
function TableNode(text)
{
    
}
function TemplateNode(text)
{
    
}
function NowikiMark(text, markList){
    var t = text;
    var idx = 0;
    var nowikiRes = /<nowiki>/g;
    var res = [];
    var lastIdx = 0;
    while((idx = text.search(nowikiRes)) != -1){
        markList.push({
            type:"NOWIKI",
            tag:"OPEN",
            pos:lastIdx + idx
        });
        idx += 8;
        text = text.slice(idx);
        lastIdx += idx;
    }
    
    nowikiRes = /<\/nowiki>/g;
    text = t;
    lastIdx = 0;
    while((idx = text.search(nowikiRes)) != -1){
        var isInsertCorrect = false;
        var item = {
            type:"NOWIKI",
            tag:"CLOSE",
            pos:lastIdx + idx
        }
        for(i in markList){
            if(markList[i].pos > item.pos){
               
                Insert(markList,i,item);
                isInsertCorrect = true;
                break;
            }
        }
        if(isInsertCorrect == false)markList.push(item);
        
        text = text.slice(idx + 9);
        lastIdx += idx;
    }
}
function TemplateMark(text,markList){
    var idx;
    var lastIdx = 0;
    var t = text;
	while((idx = text.indexOf("{{")) != -1){
        var isInsertCorrect = false;
        var item = {
            type:"TEMPLATE",
            tag:"OPEN",
            pos:lastIdx + idx
        }
        for(i in markList){
            if(markList[i].pos > item.pos){
                Insert(markList,i,item);
                isInsertCorrect = true;
                break;
            }
        }
        if(isInsertCorrect == false)markList.push(item);
        
        text = text.slice(idx + 2);
        lastIdx += idx;
    }
    
    text = t;
    lastIdx = 0;
    
    while((idx = text.indexOf("}}")) != -1){
        var isInsertCorrect = false;
        var item = {
            type:"TEMPLATE",
            tag:"CLOSE",
            pos:lastIdx + idx
        }
        for(i in markList){
            if(markList[i].pos > item.pos){
                Insert(markList,i,item);
                isInsertCorrect = true;
                break;
            }
        }
        if(isInsertCorrect == false)markList.push(item);
        text = text.slice(idx + 2);
        lastIdx += idx;
    }
}
function TableMark(text,markList){
    var idx;
    var lastIdx = 0;
    var t = text;
	while((idx = text.indexOf("{|-")) != -1){
        var isInsertCorrect = false;
        var item = {
            type:"TABLE",
            tag:"OPEN",
            pos:lastIdx + idx
        }
        for(i in markList){
            if(markList[i].pos > item.pos){
                Insert(markList,i,item);
                isInsertCorrect = true;
                break;
            }
        }
        if(isInsertCorrect == false) markList.push(item);
        text = text.slice(idx + 3);
        lastIdx += idx;
    }
    
    text = t;
    lastIdx = 0;
    
    while((idx = text.indexOf("-|}")) != -1){
        var isInsertCorrect = false;
        var item = {
            type:"TABLE",
            tag:"CLOSE",
            pos:lastIdx + idx
        }
        for(i in markList){
            if(markList[i].pos > item.pos)
            {
                Insert(markList,i,item);
                isInsertCorrect = true;
                break;
            }
        }
        if(isInsertCorrect == false)markList.push(item);
        text = text.slice(idx + 3);
        lastIdx += idx;
    }
}
function MarkProcess(text,markList){
    
}
var MARK_TYPE = {
    STANDALONE:"STANDALONE",
    OPEN_TAG:"OPEN",
    CLOSE_TAG:"CLOSE"
};
function HookMarker(hooker,markType){
    this.hookker = hooker;
    this.markType = markType;
}
function WikiParser(){
    this.hookers = [];
    this.marklist = [];
}
WikiParser.prototype.AddHooker = function(hooker){
    this.hookers.push(hooker);
};
WikiParser.prototype.MarkPosition = function(marker,position){
    var isDoneInsert = false;
    var item = {marker:marker,pos:position};
    for(i in this.markList){
        var iter = this.markList[i];
        if(iter.pos > position)
        {
            Insert(this.markList,i,item);
            isDoneInsert = true;
            break;
        }
    }
    if(isDoneInsert){
        this.markList.push(item);
    }
};
WikiParser.prototype.DoBasicMarkTag = function(tagName){
    
};
WikiParser.prototype.Parse = function(text){
    
};
function NowikiHooker(){
    
};
NowikiHooker.prototype.DoMark = function(wikiparser,text){
    wikiparser.DoBasicMarkTag("nowiki");
};

function Parse(text){
    
    var wikiparser = new WikiParser();
    wikiparser.AddHooker(new NowikiHooker());
    wikiparser.AddHooker(new TemplateHooker());
    wikiparser.AddHooker(new TableHooker());
    wikiparser.Parse(text);
    
    NowikiMark(text,markList);
    TemplateMark(text,markList);
    TableMark(text,markList);
    var root = MarkProcess(text,markList);
    console.log(markList);
}
