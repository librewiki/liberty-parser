"USE STRICT"
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
function HeadingNode()
{
    
}
function ArticleNode()
{
    
}
function LinkNode()
{
    
}
function ReferenceNode()
{
    
}
function TableNode()
{
	this.NAME = "TABLE";
    this.children = [];
}
function TemplateNode()
{
	this.NAME = "TEMPLATE";
    this.children = [];
}
function LibertyMark()
{
	this.children = [];
}
var MARK_TYPE = {
    STANDALONE:"STANDALONE",
    OPEN_TAG:"OPEN",
    CLOSE_TAG:"CLOSE"
};
function HookMarker(hooker,markType){
	if(hooker == null) throw "hooker is null!";
	if(markType == null) throw "mark type is null!";
    this.hooker = hooker;
    this.markType = markType;
	this.NAME = "HOOK MARKER";
}
function WikiParser(){
    this.hookers = [];
    this.markList = [];
}
WikiParser.prototype.AddHooker = function(hooker){
    this.hookers.push(hooker);
};
WikiParser.prototype.AddMark = function(marker,position){
    var isDoneInsert = false;
    var item = {marker:marker,position:position};
    for(i in this.markList){
        var iter = this.markList[i];
        if(iter.position > position)
        {
            var a = this.markList.splice(i);
			this.markList.push(item);
			for(i in a)this.markList.push(a[i]);
            isDoneInsert = true;
            break;
        }
    }
    if(isDoneInsert == false){
        this.markList.push(item);
    }
};
WikiParser.prototype.DoBasicMarkTag = function(tagName){
    
};
WikiParser.prototype.Parse = function(text){
    for(i in this.hookers){
		var hooker = this.hookers[i];
		hooker.DoMark(this,text);
	}
	var stack = [];
	var lastIdx = 0;
	stack.push(new LibertyMark());
	for(i in this.markList){
		var iter = this.markList[i];
		switch(iter.marker.markType)
		{
			case MARK_TYPE.CLOSE_TAG:{
				if(stack.length == 1){
					throw "parsing error! 문법이 틀렸다!";
				}
				var lastNode = stack[stack.length - 1];
				stack.pop();
				lastNode.children.push(new TextNode(text.substring(lastIdx, iter.position)));
			}
			break;
			case MARK_TYPE.OPEN_TAG:
				stack[stack.length - 1].children.push(new TextNode(text.substring(lastIdx, iter.position)));
				var node = new iter.marker.hooker.NODE();
				stack[stack.length - 1].children.push(node);
				stack.push(node);
			break;
			case MARK_TYPE.STANDALONE:
				stack[stack.length - 1].children.push(new iter.marker.hooker.NODE());
			break;
		}
		lastIdx = iter.position;
	}
	return stack[0];
};
function NowikiHooker(){
    this.NAME = "NOWIKI HOOKER";
	this.NODE = NowikiNode;
};
NowikiHooker.prototype.DoMark = function(wikiparser,text){
    wikiparser.DoBasicMarkTag("nowiki");
};
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
function TableHooker(){
	this.NAME = "TABLE HOOKER";
	this.NODE = TableNode;
}
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
function Parse(text){
    
    var wikiparser = new WikiParser();
    wikiparser.AddHooker(new NowikiHooker());
    wikiparser.AddHooker(new TemplateHooker());
    wikiparser.AddHooker(new TableHooker());
    console.log(wikiparser.Parse(text));
    console.log(wikiparser.markList);
}
