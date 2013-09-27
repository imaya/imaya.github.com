SuffixArray = function(str, endch) {
  if (typeof(str) !== 'string') throw TypeError();
  if (endch) str += endch;    /* for BWT */
  /* always new */
  if (!(this instanceof SuffixArray)) return new SuffixArray(str);
  var sa = [],
    i, l;
  /* make an index that holds the location of every single character */
  for (i = 0, l = str.length; i < l; i++) sa.push(i);
  /* and sort it lexicographically */
  sa.sort(function(a, b) {
    /* there is no === case for suffix arrays! */
    return str.substr(a) < str.substr(b) ? -1 : 1;
  });
  this.str = str;
  this.sa  = sa;
};

