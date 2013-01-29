require(["libs/maybeerror", "libs/parsercombs"], function(me, pc) {
    alert(JSON.stringify([me.zero, pc.item.parse("abc"), pc.item.parse([])]));
});