"USE STRICT"
//EDITING BY DAMEZUMA
//각 클래스 메소드 별 역할
//Render() -> 노드를 HTML로 변환한다.
//Process()-> 노드를 HTML로 변환하기 이전에 해야 할 일들을 한다. 
//테이블의 경우 각 셀을 분리하고, 템플릿의 경우에는 틀 이름과 매개변수를 정리한다

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
TextNode.prototype.Process = function(wikiparser){
//텍스트 노드안에 있는 링크, 문단, 헤딩, 볼드체등을 파싱, 노드 트리구조로 만든 후 반환한다.
//여기는 다시 짜야 한다.
//텍스트를 char순회가 아니라 indexOf혹은 search를 이용하여 각 태그위치에 표시를 찍고 이것을 돌면서 파싱해야 한다.
	var stack = [{
        nodeClass:null,
        pos:0,
        children:[]
    }];
    var lastIdx = 0;
    var i;
	for(i = 0 ; i < this.text.length ; i++)
	{
		if(this.text.substr(i,3) == "'''")
        {
            if(stack[stack.length - 1].nodeClass != BoldNode)
            {
                var node = new TextNode(this.text.substring(lastIdx, i));
                if(node.text.length != 0)
                {
                    stack[stack.length - 1].children.push(node);
                }
                stack.push({
                    nodeClass:BoldNode,
                    pos:i,
                    children:[]
                });
                i+=2;
                lastIdx = i + 1;
            }
            else
            {
                var item = stack.pop();
                var node = new item.nodeClass();
                var node2 = new TextNode(this.text.substring(lastIdx, i));
                node.children = item.children;
                node.children.push(node2);
                node.Process(wikiparser);
                stack[stack.length - 1].children.push(node);
                lastIdx = i + 1;
            }
            
        }
	}
    lastIdx++;
    if(lastIdx < this.text.length - 1)
    {
        var node = new TextNode(this.text.substring(lastIdx, i));
        if(node.text.length != 0)
        {
            stack[stack.length - 1].children.push(node);
        }
    }
    return stack[0].children;
};
TextNode.prototype.Render = function(wikiparser)
{
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
function RefNode()
{
    
}
function ReferenceNode()
{
	
};

function BoldNode()
{
	this.type = "BOLD";
	this.children = [];
}
BoldNode.prototype.Render = function(wikiparser)
{
	res = [];
	res.push("<b>");
	for(i in this.children)
	{
		var it = this.children[i];
		res.push(it.Render(wikiparser));
	}
	res.push("</b>");
	return res.join("");
};
BoldNode.prototype.Process = function(wikiparser)
{
	
};
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
//테이블의 셀을 구한다.
//셀 파싱 규칙은 '|속성|셀 내용\n'이 기본이며, '|셀 내용\n'이나 '||셀 내용'은 변칙일 뿐이다
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
WikiParser.prototype.TextNodeParse = function(node){
	var i = 0;
	for(i = 0 ; i < node.children.length ; i++)
	{
		var iter = node.children[i];
		if(iter.children != null )
		{
			node.children[i] = this.TextNodeParse(iter);
		}
		else if(iter.type == "TEXT")
		{
			var res = iter.Process();
            if(res.length == 1 && res.type == "TEXT")
            {
                
            }
            else
            {
                var tempA = node.children.splice(i);
                node.children.pop();
                res.forEach(function(value,idx,arr){
                    node.children.push(value);
                });
                tempA.forEach(function(value,idx,arr){
                    node.children.push(value);
                });
            }
		}
	}
	return node;
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
    if(lastIdx <= text.length -1)
    {
        stack[stack.length - 1].children.push(new TextNode(text.substring(lastIdx, text.length)));
    }
	
	
	return this.TextNodeParse(stack[0]);
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
	//위키파서의 파서메소드가 반환하는 것은 LibertyMark객체이다.
	var a = wikiparser.Parse(text);
    res = a.Render(wikiparser);
	window.document.getElementById("preview").innerHTML = res;
}
