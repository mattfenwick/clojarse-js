'use strict';


function defn(node, state, log) {
    var elems = node.elems;
    if ( elems.length >= 2 ) {
        var second = elems[1];
        if ( second.type === 'symbol' ) {
            var name = second.name;
            // one major drawback (for now):
            //   ignoring namespaces
            if ( state.is_bound(name) ) {
                log.issue({'severity': 'warning', 'name': 'defn', 
                           'position': second.pos, 'message': 'redefining symbol', 
                           'symbol': name, 'original position': state.position(name)});
            } else {
                state.define(name, second.pos);
            }
        } else {
            log.issue({'name': 'defn', 'severity': 'error', 'position': second.pos,
                       'message': '2nd arg must be a symbol'});
        }
    }
}


var macros = {
    'defn': defn,
    'defn-': defn,
    'defmacro': defn
};


function macro(node, state, log) {
    if ( node.elems.length === 0 ) { 
        return; 
    }
    var first = node.elems[0];
    if ( ( first.type !== 'symbol'            ) ||
         ( first.ns !== null                  ) ||
         ( !macros.hasOwnProperty(first.name) ) ) {
        return;
    }
    console.log('macro: ' + first.name + ' ...');
    return macros[first.name](node, state, log);
}


module.exports = {
    'macro': macro,
    
    'defn'      : defn,
    'defn-'     : defn,
    'defmacro'  : defn
};

