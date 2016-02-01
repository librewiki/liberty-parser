module.exports = function (wikiparser) {
  var regex = new RegExp('^#'+wikiparser.i18nKey('redirect')+'\\s*?\\[\\[(.+)\\]\\]');
  var data = regex.exec(wikiparser.wikitext.trim());
  if (data) {
    wikiparser.redirect = data[2];
  } else wikiparser.redirect = false;
  return wikiparser.redirect;
};
