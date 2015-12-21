function MediaMark()
{
    this.children = [];
}
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
function TableNode(text)
{
    
}
function TemplateNode(text)
{
    
}
function NowikiParse(text)
{
    var t = text;
    var nowikiList = [];
    var idx = 0;
    var nowikiRes = /<nowiki>/g;
    var res = [];
    var lastIdx = 0;
    while((idx = text.search(nowikiRes)) != -1)
    {
        
        nowikiList.push([0,lastIdx + idx]);
        idx += 8;
        text = text.slice(idx);
        lastIdx += idx;
    }
    
    nowikiRes = /<\/nowiki>/g;
    text = t;
    lastIdx = 0;
    while((idx = text.search(nowikiRes)) != -1)
    {
        var isInsertCorrect = false;
        for(i in nowikiList)
        {
            if(nowikiList[i][1] < idx)
            {
                nowikiList.insert(i, [1,lastIdx + idx]);
                isInsertCorrect = true;
                break;
            }
        }
        if(isInsertCorrect == false)
        {
            nowikiList.push([1,lastIdx + idx]);
        }
        text = text.slice(idx + 9);
        lastIdx += idx;
    }
    var openediter = null;
    lastIdx = 0;
    for(i in nowikiList)
    {
        var iter = nowikiList[i];
        if(openediter == null || iter[0] == 0)
        {
            if(lastIdx != iter[1])
            {
                res.push(new TextNode(text.substr(lastIdx,iter[1])));
            }
            lastIdx = iter[1];
            openediter = iter;
        }
        else if(openediter != null || iter[0] == 1)
        {
            var nowiki_node = new NowikiNode(text.substr(openediter[1] + 8,iter[1]));
            res.push(nowiki_node);
            openediter = null;
            lastIdx = iter[1] + 10;
        }
        else
        {
            tag = "&lt;nowiki&gt;";
            lastIdx = iter[1] + 8;
            if(iter[0] == 1)
            {
                lastIdx = iter[1] + 9;
                tag = "&lt;/nowiki&gt;";
            }
            res.push(new TextNode(tag));
        }
        
    }
    res.push(new TextNode(text.substr(lastIdx,text.length)));
    return res;
}
function Parse(text)
{
    if(text.type == null)
    {
        text = NowikiParse(text);
    }
    for(i in text)
    {
        
    }
}
