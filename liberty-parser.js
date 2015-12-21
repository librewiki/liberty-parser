var constants = require("./lib/wikiUrl");
var STRONG_EM_STYLE_REGEX = /[']{5}\s*([^']+'[^']+|[^']*)\s*[']{5}/g;
var STRONG_STYLE_REGEX = /[']{3}\s*([^']+'[^']+|[^']*)\s*[']{3}/g;
var EM_STYLE_REGEX = /[']{2}\s*([^']+'[^']+|[^']*)\s*[']{2}/g;
var HEADING_REGEX = /^=+([^=]*).*$/g;
var SINGLE_BRACKET_LINK_REGEX = /\[([^\]]*)\]/g;
var LINK_REGEX = /\[\[([^\]]*)\]\]/g;
var CITATION_REFERENCE_REGEX = /\{\{Cite\s*([^\}]*)\}\}/gi;
var GUTENBERG_REFERENCE_REGEX = /\{\{Gutenberg\s*([^\}]*)\}\}/gi;
var WORLDCAT_REFERENCE_REGEX = /\{\{worldcat\s*([^\}]*)\}\}/gi;
var SPECIAL_LANGUAGE_INFO_REGEX = /\{\{([^\}]*)\}\}/g;
var REFERENCE_REGEX = /<ref\s*name="([^"]*)"\s*\/?>[^<]*(<\/ref>)?/g;
var REFERENCES_TO_IGNORE = /<ref[^\/]*\/>|<ref[^>]*>[^<]*<\/ref>/g;
var COMMENTS_REGEX = /<!--\s*[^-]*-->/g;
var NOWIKI_TAG_REGEX = /<nowiki>(+)</nowiki>/g;
var LANGUAGE_MAP = {
	"lang-fr": "French",
	"lang-es": "Spanish",
	"lang-en": "English",
	"lang-it": "Italian"
};
function convertTableToHTML(text){
	var tablePositions = [];
	var idx = -1;
	while((idx = text.indexOf("{|",idx)) != -1)
	{
		tablePositions.push({type:0,pos:idx});
	}
	while((idx = text.indexOf("|}",idx)) != -1)
	{
		var i = 0;
		for(i = 0 ; i < tablePositions.length;i++)
		{
			
		}
	}
}
function convertLineToHTML(line, lang) {
	var matched = false;
	line = line.replace(NOWIKI_TAG_REGEX, function(match, matchedSequence){
		matched = true;
		return line.replace(/</gi,"&lt;").replace(/>/gi,"&gt;");
	};
	line = line.replace(CITATION_REFERENCE_REGEX, function(match, matchedSequence) {
		var sections = matchedSequence.split("|");
		var refType = sections.shift();
		var tile = "";
		var elem = '<span class="reference" data-type="' + refType + '"';
		sections.forEach(function(section) {
			var keyValue = section.split("=");
			if (keyValue[0] !== "title") {
				elem += ' data-' + keyValue[0] + '="' + keyValue[1] + '"';
			} else {
				tile = keyValue[1];
			}
		});

		elem += ">" + tile + "</span>";
		matched = true;
		return elem;
	});

	//  if(matched){
	//    //Short-circuit here, since we have matched a reference
	//    return line;
	//  }

	line = line.replace(GUTENBERG_REFERENCE_REGEX, function(match, matchedSequence) {
		// e.g. {Gutenberg|no=3567|name=Memoirs of Napoleon}}
		var sections = matchedSequence.split("|");
		//Get rid of the "Gutenberg"
		sections.shift();
		var gutenbergNb = 0;
		var title = "";
		sections.forEach(function(section) {
			var keyValue = section.split("=");
			if (keyValue[0] === "name") {
				title = keyValue[1];
			} else if (keyValue[0] === "no") {
				gutenbergNb = keyValue[1];
			}
		});
		matched = true;

		return '<a href="' + constants.PROJECT_GUTENBERG_EBOOK_BASE_URL + gutenbergNb + '">' + title + "</a>";
	});

	//  if(matched){
	//    return line;
	//  }

	line = line.replace(WORLDCAT_REFERENCE_REGEX, function(natch, matchedSequence) {
		// e.g. {{worldcat id|id=lccn-n79-54933}}
		var idIndex = matchedSequence.indexOf("id=");
		var id = matchedSequence.substring(idIndex + 3);

		matched = true;
		return '<a href="' + constants.WORLDCAT_IDENTITY_LINK + id + '">Worldcat reference</a>';
	});

	//  if(matched){
	//    return line;
	//  }




	line = line.replace(HEADING_REGEX, function(match, subMatch1) {
		var index = match.indexOf(subMatch1);
		var lastIndex = match.length - index;
		var headingTag = "h" + index;
		return "<" + headingTag + ">" + match.substring(index, lastIndex) + "</" + headingTag + ">";
	});

	// cascading order of quote matching such that we don't match a lesser number
	// of quotes inside a larger number
	line = line.replace(STRONG_EM_STYLE_REGEX, function(match, subMatch1) {
		return "<strong><em>" + subMatch1 + "</em></strong>";
	});

	line = line.replace(STRONG_STYLE_REGEX, function(match, subMatch1) {
		return "<strong>" + subMatch1 + "</strong>";
	});

	line = line.replace(EM_STYLE_REGEX, function(match, subMatch1) {
		return "<em>" + subMatch1 + "</em>";
	});

	line = line.replace(LINK_REGEX, function(match, matchedLink) {
		var underscoreLink = "";

		if (matchedLink.indexOf("Category:") === 0) {
			var elem = '<span class="category">';
			var colonIndex = matchedLink.indexOf(":");
			var category = matchedLink.substring(colonIndex + 1);
			var link = '<a href="' + constants.WIKIPEDIA_STUB + lang + constants.WIKIPEDIA_URL_WIKI + 'Category:' + category.replace(/\s/g, "_") + '">' + category + '</a>';

			return elem + link + '</span>';
		} else if (/\|/.test(matchedLink)) {
			//TODO Use underscore to perform trimming
			var splitLink = matchedLink.split("|");
			matchedLink = splitLink[1];
			underscoreLink = splitLink[0].replace(/\s/g, "_");
		} else {
			underscoreLink = matchedLink.replace(/\s/g, "_");
		}

		return '<a href="' + constants.WIKIPEDIA_STUB + lang + constants.WIKIPEDIA_URL + '/wiki/' + underscoreLink + '">' + matchedLink + '</a>';
	});


	line = line.replace(SINGLE_BRACKET_LINK_REGEX, function(match, matchedLink) {
		if (matchedLink.indexOf("http://") === 0) {
			var firstSpaceIndex = matchedLink.indexOf(" ");
			var link = matchedLink.substring(0, firstSpaceIndex);
			var title = matchedLink.substring(firstSpaceIndex + 1);

			return '<a href="' + link + '">' + title + "</a>";
		} else {
			return matchedLink;
		}
	});


	line = line.replace(COMMENTS_REGEX, "");

	line = line.replace(SPECIAL_LANGUAGE_INFO_REGEX, function(match, matchedLangStr) {
		var splitInfo = matchedLangStr.split("|");
		if (splitInfo.length > 0) {
			//short circuit rightaway if we are dealing with a citation/reference
			if (/cite/.test(splitInfo[0])) {
				return "";
			}
			var langInfo = LANGUAGE_MAP[splitInfo[0]];
			var prefix = "";
			var suffix = "";

			//Print the language information if it is present
			if (langInfo) {
				langInfo = langInfo ? langInfo + ": " : "";
				prefix = langInfo;
			} else {
				prefix = "[";
				suffix = "]"
			}
			var ret = prefix;
			for (var i = 1; i < splitInfo.length; ++i) {
				var curr = splitInfo[i];
				if (!/links|IPA|icon/.test(curr)) {
					ret += splitInfo[i];
				}
			}
			ret += suffix;
			return ret;
		} else {
			return "";
		}
	});

	line = line.replace(REFERENCE_REGEX, function(match, matchedAuthor) {
		return "(ref: " + matchedAuthor + ")";
	});

	line = line.replace(REFERENCES_TO_IGNORE, "");

	return line;
}


module.exports.convertLineToHTML = convertLineToHTML;



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
function TableNode(text)
{
    
}
function TemplateNode(text)
{
    
}
function NowikiParse(ROOT)
{
	var preTextExistNowikiStart = false;
	if(ROOT.children != null)
	{
		for( i in ROOT.children)
		{
			var iter = ROOT.children[i];
			if(iter.type == "TEXT")
			{
				var text = iter.text;
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
			}
		}
	}
}
function TemplateNodeParse(nodeList)
{
	
}
function Parse(text)
{
	var ROOT = {type:"ROOT",children:[new TextNode(text)]};
	NowikiParse(ROOT);
	TemplateNodeParse(ROOT);
}
