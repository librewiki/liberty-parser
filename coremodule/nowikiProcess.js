function nowikiProcess (wikiparser) {
  var text = wikiparser.wikitext;
  text = text.replace(/<(pre|nowiki|math)(?:(?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(?:\/?)>((?:.|\n)*?)<\/\1>/gi,function ($0,$1,$2) {
    $2 = $2.replace(/</g,"&lt").replace(/>/g,"&gt");
    var x = wikiparser.nowikiMatch.push('<'+$1+'>'+$2+'</'+$1+'>');
    return "\\nowiki\\_"+(x-1)+"_\\nowiki\\";
  });
  wikiparser.wikitext = text;
}

module.exports = nowikiProcess;
