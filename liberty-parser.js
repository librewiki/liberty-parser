"USE STRICT"
//EDITING BY DAMEZUMA

function NowikiNode(text)
{
    this.type = "NOWIKI";
    this.text = text;
}
NowikiNode.prototype.Render = function(){
  return this.text.replace(/</gi,"&lt;").replace(/>/gi,"&gt;");  
};
function TextNode(text)
{
    this.type = "TEXT";
    this.text = text;
}
TextNode.prototype.Render = function(wikiparser)
{
	var res = [];
	var i = 0;
	for(i = 0; i < this.length ; i++){
		
	}
	return this.text;
};
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
	this.cells = [];
	this.tableattr = "";
}
TableNode.prototype.Process = function(){
	var aCountOfCellsInRow = 0;
	var res = [[]];
	var row = 0;
	var children = [];
	var isStartCell = 0;
	var posPreBar = -1;
	var j = -1;
	if(this.children[0] != null)
	{
		if(this.children[0].type == "TEXT")
		{
			var temp = this.children[0].text;
			temp = temp.substring(2,temp.length);
			var i = temp.indexOf("\n");
			if(i != -1)
			{
				this.tableattr = temp.substring(0,i);
				this.children[0].text = temp.substring(i,temp.length);
			}
		}
		if(this.children[this.children.length - 1].type == "TEXT")
		{
			var temp = this.children[this.children.length - 1].text;
			this.children[this.children.length - 1].text = temp.substring(0,temp.length - 2);
		}
	}
	var item = null;
	for(i in this.children)
	{
		var iter = this.children[i];
		if(iter.type == "TEXT")
		{
			posPreBar = -1;
			var temp = iter.text;
			for(j = 0 ; j < temp.length ; j++)
			{
				if(temp.substr(j,2) == "|-")
				{
					res.push([]);
					row++;
					
					isStartCell = 0;
					posPreBar = -1;
					
				}
				else if(temp[j] == "|")
				{
					switch(isStartCell)
					{
						case 0:{
							posPreBar = j;
							isStartCell = 1;
							item = {attr:"",children:[]};
						}
						break;
						case 1:{
							isStartCell = 2;
							var t = temp.substring(posPreBar+1,j);
							item.attr = t;
							posPreBar = j;
						}
						break;
						case 2:{
							var t = temp.substring(posPreBar+1,j);
							var newTextNode = new TextNode( t);
							item.children.push(newTextNode);
							res[row].push(item);
							children.push(newTextNode);
							isStartCell = 0;
							posPreBar = j;
						}
						break;
					}
				}
				else if(temp[j] == '\n' )
				{
					if(isStartCell != 0)
					{
						var t = temp.substring(posPreBar+1,j);
						var newTextNode = new TextNode(t);
						item.children.push(newTextNode);
						res[row].push(item);
						children.push(newTextNode);
						isStartCell = 0;
						posPreBar = j;
					}
					
				}
			}
			if(isStartCell != 0)
			{
				var t = temp.substring(posPreBar+1,temp.length);
				var newTextNode = new TextNode(t);
				item.children.push(newTextNode);
				children.push(newTextNode);
				
			}
		}
		else
		{
			item.children.push(iter);
			children.push(iter);
		}
	}
	for(i in res)
	{
		if(res[i].length != 0){
			this.cells.push(res[i]);
		}
	}
	this.children = children;
};
TableNode.prototype.Render = function(wikiparser)
{
	var res = [];
	res.push("<table ");
	res.push(this.tableattr);
	res.push(">");
	for(i in this.cells)
	{
		var row = this.cells[i];
		res.push("<tr>");
		for(j in row)
		{
			var cell = row[j];
			res.push("<td ");
			res.push(cell.attr);
			res.push(">");
			for(k in cell.children)
			{
				var iter = cell.children[k];
				res.push(iter.Render(wikiparser));
			}
			res.push("</td>");
		}
		res.push("</tr>")
	}
	res.push("</table>");
	return res.join("");
};
function TemplateNode(hooker)
{
	this.NAME = "TEMPLATE";
    this.children = [];
	this.hooker = hooker;
}
TemplateNode.prototype.Process = function()
{
	
};
TemplateNode.prototype.Render = function(wikiparser)
{
	return "[템블릿 있던 자리]";
};
function LibertyMark()
{
	this.children = [];
}
LibertyMark.prototype.Render = function(wikiparser)
{
	res = [];
	for(i in this.children)
	{
		var iter = this.children[i];
		res.push(iter.Render(wikiparser));
	}
	return res.join("");
};
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
TemplateHooker.prototype.GetStartStrLen = function(text)
{
	return 2;
};
TemplateHooker.prototype.GetEndStrLen = function(text)
{
	return 2;
};

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
function Parse(text){
    
    var wikiparser = new WikiParser();
    wikiparser.AddHooker(new NowikiHooker());
    wikiparser.AddHooker(new TemplateHooker());
    wikiparser.AddHooker(new TableHooker());
	
	var a = wikiparser.Parse(text);
    res = a.Render(wikiparser);
	window.document.getElementById("preview").innerHTML = res;
}
