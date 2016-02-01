module.exports = function noTemplateParam(wikiparser) {
  var text = wikiparser.wikitext;
  var idx = 0;
  var paramArr = [];
  var open, close;
  while((idx = text.indexOf('{{{', idx)) != -1){
    open = idx+3;
    if((idx = text.indexOf('}}}', idx)) != -1){
      close = idx;
      var param = text.substring(open,close).split('|');
      var paramName = param[0];
      if(param[1]===undefined){
        param[1] = text.substring(open-3,close+3);
      }
      paramArr.push([paramName,open-3,close,param[1]]);
    } else {
      break;
    }
    idx += 3;
  }
  var sb = [];
  open = 0;
  close = 0;
  for (var i = 0; i < paramArr.length; i++) {
    open = paramArr[i][1];
    sb.push(text.substring(close,open));
    sb.push(paramArr[i][3]);
    close = paramArr[i][2]+3;
  }
  sb.push(text.substring(close));
  wikiparser.wikitext = sb.join('');
};
