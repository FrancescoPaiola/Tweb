 /*
  Crea la stringa che definisce l'ID del target dell'annotazione
  - nodeSelection: è il nodo antenato comune e valido dei nodi di inizio e fine selezione
  - prefix: è i l prefisso da anteporre alla stringa e dipende dalla fonte del documento
*/
function createPathString(nodeSelection, prefix) {
  pathString = ''
  while(nodeSelection.parentNode.id != 'main-content') {
    if(nodeSelection.getAttribute('name') != null){
      pathString = "_" + nodeSelection.tagName + nodeSelection.getAttribute('name') + pathString;
    }
    nodeSelection = nodeSelection.parentNode;
  }

  pathString = pathString.toLowerCase();
  pathString = prefix + pathString

  return(pathString);
}


/*
  Restituisce il nodo padre più vicino a nodeSelection che sia conforme alle nostre esigenze
  ovvero che sia di tipo "text" e non sia uno tra quelli in listTag
*/
function nodeSelectionValid(nodeSelection) {
  var listTag = ["A","EM","SPAN","B","I"];  

  while((nodeSelection.nodeType == 3) || (($.inArray(nodeSelection.tagName,listTag)) != -1 ))
  //risale al padre se il nodo è di tipo testo o se il suo tag è da ignorare
   nodeSelection = nodeSelection.parentNode;

  return nodeSelection;
}


/*
  Restituisce l'offset in caratteri tra l'inizio di nodeSelection e l'inizio della selezione
  e tra l'inizio di nodeSelectione  la fine della selezione
  - range: è il range che racchiude la selezione
  - nodeSelection: è l'antentato in comune valido dei nodi di inizio e fine selezione
  Restituisce l'array contenente la posizione di inizio e di fine della selezione
*/
function createStartEnd(nodeSelection, range){
  var rangeCommon = document.createRange();
  var startEnd = []; // startEnd[0] = start, startEnd[1] = end  
  
  rangeCommon.selectNodeContents(nodeSelection);  //setta il range in modo che contenga il nodo ancestor valido
  
  rangeCommon.setEnd(range.endContainer, range.endOffset); /*setto il rangeCommon in modo che finisca alla fine della selezione(range) in modo 
  che poi riesca a risalire alla posizione di inizio di range rispetto al common */

  dimCommonRange = rangeCommon.toString().length   //lunghezza del range del common in cui è avvenuta la selezione
  
  dimRange = range.toString().length;    //lunghezza della selezione

  startEnd[0] = dimCommonRange - dimRange;
  startEnd[1] = dimCommonRange;

  checkNode(nodeSelection, startEnd[0], startEnd[1]);
  
  return (startEnd);
}


/*
  - nodeSelection: è il nodo Ancestor
  - start: è l'offset iniziale rispetto all'ancestor
  - end: è l'offset finale rispetto all'ancestor.
*/
function checkNode(nodeSelection, start, end){
  var structNode;                           
  if(nodeSelection.nodeType !== 3){                  //controllo se il nodeSelection è diverso da un Node Text
    var child = nodeSelection.childNodes;            //child è un NodeList contenente tutti i figli dell'ancestor  
    var j = 0;
    if(typeof child !== "undefined"){                //controllo se l'ancestor ha almeno dei figli
      while(j < child.length){                       //itero questa NodeList, se la sel avviene nello stesso nodo, non entra in questo while
        out = checkNode(child[j], start, end);       //per ogni Node di questa lista applico ricorsivamente la funzione. Out è una structNode
        if (out.exit) {
          return out;                                //se è il nodo finale
        }
        else { 
          if (out.other){                             //se è un altro nodo
            j++;    
          }
          start = out.first;                         
          end = out.last;
        }
        j++;
    }
    structNode = {first: start, last: end};
    }
  }
  else{
    structNode= scanNode(nodeSelection, start, end); 
  } 
  return structNode;
}

function scanNode(nodeSelection, start, end){
  var structNode;
  var length = nodeSelection.length;
  if(start >= length) {
    structNode = {first: start - length, last: end - length};
  }
  else if(end < length){
    makeSpan(nodeSelection, start, end);
    structNode = {exit : true};
  }
  else {
    makeSpan(nodeSelection, start, length);
    structNode= {first: 0, last: end - length, other: true};
  }
  return structNode;
}