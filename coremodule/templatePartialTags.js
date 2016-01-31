function noTemplatePartial (wikiparser) {
  wikiparser.wikitext =
  wikiparser.wikitext.
  replace(/<\/?noinclude>/gi,"").
  replace(/<\/?onlyinclude>/gi,"").
  replace(/<includeonly>.*<\/includeonly>/gi,"");
}
module.exports.noTemplatePartial = noTemplatePartial;
