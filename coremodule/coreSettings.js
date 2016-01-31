module.exports = function (wikiparser) {
  //uc, lc, lcfirst, ucfirst
  require('./parserFunctions/formattings.js').useAll(wikiparser);
  // #if, #ifeq, #ifexpr
  require('./parserFunctions/logics.js').useAll(wikiparser);
};
