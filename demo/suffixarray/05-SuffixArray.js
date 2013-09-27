
/*
 * SAIS algorithm [ http://yuta.256.googlepages.com/sais ]
 * MIT/X11 license.
 */

const EXPORT = ['SuffixArray'];

var SuffixArray = function (string) {
    this.string = string;
    this.lowerString = string.toLowerCase();
    this.defaultLength = 255;
}

var p = function(){};
p.b = function(){};

SuffixArray.prototype = {
    make: function SuffixArray_createSuffixArray() {
        var string = this.lowerString;
        var sary = [];
        var saryIndex = 0;
        var str;
        var index;
        var dLen = this.defaultLength;
/*
        p.b(function() {
        for (var i = 0, len = string.length; i < len; i++) {
            str = string.substr(i, dLen);
            sary[saryIndex++] = [str, i];
            // index = str.indexOf("\n");
            // if (index != 0) {
            //     if (index != -1)
            //         str = str.substr(0, index);
            //     sary[saryIndex++] = [str, i];
            // }
        }
//         }, 'create');
//         p.b(function() {
        sary.sort(function(a, b) {
            if (a[0] > b[0]) {
                return 1;
            } else if (a[0] < b[0]) {
                return -1;
            }
            return 0;
        });
        }, 'qsort');
        var qsortSary = sary.map(function(_, i) { return i; });
*/
//         this.sary = sary.map(function([_,i]) i);
//        p.b(function() {
            function recSAIS(s, k, off, n, sa, n0) {
                var Buckets = function(s, k, off, n) {
                    var start = new Array(k);
                    var end = new Array(k);
                    var sum = 0;
                    n += off;
                    for (var i=0; i <= k; i++) start[i] = 0;
                    for (var i=off; i < n; i++) start[s[i]]++;
                    for (var i=0; i <= k; i++) {
                        var t = sum;
                        sum += start[i];
                        start[i] = t;
                        end[i] = sum;
                    }
                    return {
                        cloneStartTo: function(bkt) {
                            for (var i=0; i <= k; i++) bkt[i] = start[i];
                            return bkt;
                        },
                        cloneEndTo: function(bkt) {
                            for (var i=0; i <= k; i++) bkt[i] = end[i];
                            return bkt;
                        },
                        get start() {
                            var bkt = new Array(k);
                            for (var i=0; i <= k; i++) bkt[i] = start[i];
                            return bkt;
                        },
                        get end() {
                            var bkt = new Array(k);
                            for (var i=0; i <= k; i++) bkt[i] = end[i];
                            return bkt;
                        }
                    };
                };

                // merged induceSAl and induceSAs
                var induceSA = function(t, sa, s, off, n, bkts) {
                    var bktStart = bkts.start;
                    var bktEnd = bkts.end;
                    for (var i=0; i < n; i++) {
                        var j = sa[i]-1;
                        if (0 <= j && !t[j]) {
                            sa[bktStart[s[off+j]]++] = j;
                        }
                    }
                    for (var i=n-1; 0 <= i; i--) {
                        var j = sa[i]-1;
                        if (0 <= j && t[j]) {
                            sa[--bktEnd[s[off+j]]] = j;
                        }
                    }
                };

                off = off || 0;
                n = n || s.length;
                sa = sa || new Array(n);
                n0 = n0 || n;
                var t = new Array(n);
                var bkt = new Array(k);
                var n1 = 0;
                var name = 0;
                var bkts = new Buckets(s, k, off, n);

                // Classify the type of each character
                t[n-2] = false; t[n-1] = true; // the sentinel must be in s1
                for (var i=n-3, o=off+n-3; 0 <= i; i--, o--) {
                    var ch1 = s[o];
                    var ch2 = s[o+1];
                    t[i] = (ch1 < ch2 || (ch1==ch2 && t[i+1]));
                }

                // stage 1: reduce the problem by at least 1/2
                // sort all the S-substrings
                bkts.cloneEndTo(bkt);
                for (var i=0; i < n; i++) sa[i] = -1;
                for (var i=n-2, t0=false, t1=t[n-1], o=off+n-1; 0 <= i;
                     i--, o--, t1=t0) {
                    if (!(t0 = t[i]) && t1) sa[--bkt[s[o]]] = i+1;
                }

                induceSA(t, sa, s, off, n, bkts);

                // compact all the sorted substrings
                // into the first n1 items of SA
                // 2*n1 must be not larger than n (proveable)
                for (var i=0; i < n; i++) {
                    var sai = sa[i];
                    if (0 < sai && t[sai] && !t[sai-1]) {
                        sa[n1++] = sai;
                    }
                }

                // store the length of all substrings
                for (var i=n1; i < n; i++) sa[i] = -1; // init
                for (var i=n-2, o=n-1, j=n, t0=false, t1=t[n-1]; 0 <= i;
                     i--, o--, t1=t0) {
                    if (!(t0 = t[i]) && t1) {
                        sa[n1 + (o >> 1)] = j-o;
                        j = o;
                    }
                }
                // find the lexicographic names of all substrings
                for (var i=0, q=n, qlen=0; i < n1; i++) {
                    var p = sa[i];
                    var nn = n1+(p >> 1);
                    var plen = sa[nn];
                    var diff = true;
                    if (plen == qlen) {
                        var j, op=off+p, oq=off+q;
                        for (j=0; j < plen && s[op+j] == s[oq+j]; j++);
                        if (j == plen) diff = false;
                    }
                    if (diff) {
                        name++;
                        q = p;
                        qlen = plen;
                    }
                    sa[nn] = name-1;
                }
                for (var i=n-1, j=n-1; n1 <= i; i--) {
                    var sai = sa[i];
                    if (0 <= sai) sa[j--] = sai;
                }

                // stage 2: solve the reduced problem
                // recurse if names are not yet unique
                var s1 = sa;
                var off1 = n-n1;
                if (name < n1) {
                    recSAIS(s1, name-1, n-n1, n0+n1-n, sa, n1);
                } else {
                    // generate the suffix array of s1 directly
                    for (var i=0, o=off1; i < n1; i++, o++) {
                        sa[s1[o]] = i;
                    }
                }

                // stage 3: induce the result for the original problem
                bkts.cloneEndTo(bkt);
                // put all left-most S characters into their buckets
                for (var i=1, j=off1, t0=t[0], t1=false; i < n; i++, t0=t1) {
                    if ((t1 = t[i]) && !t0) {
                        s1[j++] = i; // get p1
                    }
                }
                for (var i=0; i < n1; i++) sa[i] = s1[off1+sa[i]];
                for (var i=n1; i < n; i++) sa[i] = -1;
                for (var i=n1-1; 0 <= i; i--) {
                    var j=sa[i]; sa[i] = -1;
                    sa[--bkt[s[off+j]]] = j;
                }
                induceSA(t, sa, s, off, n, bkts);

                return sa;
            }
            /* create suffix array by induced sorting
               s:  input string
               returns sa : int array */
            function SAIS(s) {
                var n = s.length;
                var ss = new Array(n+1);
                var embedded = false;
                for (var i=0; i < n; i++) {
                    var ch = s.charCodeAt(i);
                    if (ch == 0x0c) embedded = !embedded;
                    if (embedded) ch = 0x0c;
                    ss[i] = ch;
                }
                ss[n] = 0;
//                 p('input', ss.map(function(v,i) [i,v]).join('|'));

                var sary = recSAIS(ss, 65535);
                return sary.slice(1).filter(function(i) { return ss[i] != 0x0c; });
            }
            sary = SAIS(string);
//        }, 'SAIS');
        this.setSary(sary);
//        p('qsort', qsortSary.slice(0,1000));
//        p('SAIS', this.getSary().slice(0,1000));
//         var esc = function(str) {
//             var r='';
//             for (var i=0,n=str.length; i<n; i++) {
//                 var ch = str.charCodeAt(i);
//                 r += ch <= 0x0f ? ('[0x'+ch.toString(16)+']') : str[i];
//             }
//             return r;
//         };
//         p('substr', this.sary.map(function(i) esc(string.substr(i))));
//        p('veryfy: ' + qsortSary.every(function(v,i) { return v==sary[i]; }));
    },
    setSary: function(sary) { this._sary = sary; this._len = sary.length },
    getSary: function() {
      return  this._sary;
    },
    getLength: function() { return this._len },
    search: function SuffixArray_search(word) {
        var wLen = word.length;
        if (wLen == 0) return [];
        if (!this.getSary()) this.make();

        word = word.toLowerCase();
        var string = this.lowerString;
        var sary = this.getSary();
        var len = this.getLength();
        var lastIndex = -1;
        var index = parseInt(len / 2);

        var floor = Math.floor;
        var ceil = Math.ceil;

        var str;
        var range = index;

        while (lastIndex != index) {
            lastIndex = index;
            str = string.substr(sary[index], wLen);
            if (word < str) {
                range = floor(range / 2);
                index = index - range;
            } else if (word > str) {
                range = ceil(range / 2);
                index = index + range;
            } else {
                var res = [sary[index]];
                var start = index;
                while (string.substr(sary[--start], wLen) == word)
                    res.unshift(sary[start]);
                var end = index;
                while (string.substr(sary[++end], wLen) == word)
                    res.push(sary[end]);
                res.sort(function(a, b) { return a - b; });
                return res;
            }
        }

        return [];
    }
}
/*
     while (low < high) {
            int middle = low + (high-low)/2;
            if (suffixes[middle].compareTo(p) >= 0) {
                high = middle;
            } else {
                low = middle+1;
            }
        }
        if (suffixes[high].startsWith(p)) {
            return len - suffixes[high].length();
        }
        return -1;
    }
*/
