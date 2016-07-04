String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

function makeSpan(nodeSelection, start, end){
  var rangeSpan= document.createRange();
  rangeSpan.setStart(nodeSelection, start);
  rangeSpan.setEnd(nodeSelection, end);

  var span = document.createElement('span');

  span.setAttribute('class','annotation span-' + annotation[$('.card-panel:visible').attr('id').substr(-1)]['annotations'].length);

  rangeSpan.surroundContents(span);
}

/*
  funzione per attribuire i diversi colori alle annotazioni
*/
function spanColor (type) {
  if(type == 'hasAuthor') color = 'author';
  else if(type == 'hasPublicationYear') color = 'year';
  else if(type == 'hasTitle') color = 'title';
  else if(type == 'hasDOI') color = 'doi';
  else if(type == 'hasURL') color = 'uri';
  else if(type == 'hasComment') color = 'comment';
  else if(type == 'denotesRhetoric') color = 'rhetoric';
  else if(type == 'cites') color = 'cites'; 
  else {
    console.log("spanColor: something gone wrong");
    return false;
  }

  $(".span-" + annotation[$('.card-panel:visible').attr('id').substr(-1)]['annotations'].length).addClass(color);

}

/*
  Riempie la modale "showAnnotation", per visualizzare tutte le annotazioni create ma non ancora salvate
*/

function populateSpan(){ 
  if (annotation[$('.card-panel:visible').attr('id').substr(-1)].annotations.length == 0) {
    Materialize.toast("Non ci sono annotazioni", 2000);
    return false;
  }
  $('#annotationContents').html('')

  var annotations = annotation[$('.card-panel:visible').attr('id').substr(-1)].annotations
  for(var i=0; i < annotations.length; i++){
    if(annotations[i]){
      try{
        spanColor(annotations[i].list[0].type) 
        var classes = '.span-'+i+'.'+color
        $('#annotationContents').append('<div class="info span-'+i+' '+color+'"></div>')
        var div =  $('#annotationContents >' +classes)
        
        div.append('<h6>Annotation\'s type: <a href="#" onclick="removeAnnotation(this)"><i class="fa fa-trash right" title="rimuovi"></i></a> <a href="#" onclick="editAnnotation(this)"><i class="fa fa-pencil-square-o right" title="modifica"></i></a></h6><p class="annotaType">'+annotations[i].list[0].label.capitalize()+'</p>')
        div.append('<h6>Label: <a href="#" onclick="modifyFields(this)"><i class="fa fa-pencil-square-o right" title="modifica"></i></a></h6><p class="annotaLabel" contenteditable="true">' + annotations[i].list[0].body.label + '</p>')
         if (annotations[i].list[0].type == 'cites'){
          div.append('<h6>Link citated is</h6><p blue-text><p class="annotaLink" contenteditable="true">'+annotations[i].list[0].body.object+'</p>')
        }
        div.append('<h6>Created by</h6><p blue-text><i>'+annotations[i].list[0].provenance.author.name+', '+annotations[i].list[0].provenance.time+'</i></p>')
       }      
      catch (e) { console.log(e) }
    }
  }
  
  $("#annotationInfo").openModal({
    dismissible:true,
    complete: function() { $('#annotationContents').html(''); }
  });
}

function modifyFields(something){
  var div = something.parentElement.parentElement.className.replace(/ /g, '.')
  var number = []
  for (var i = 0; i < div.length ; i++) {
    if(!isNaN(div[i])){
      number.push(div[i])
    }
  } 
  Materialize.toast('Campi modificati', 2000)
  annotation[$('.card-panel:visible').attr('id').substr(-1)].annotations[number].list[0].body.label=$('.'+div+' p.annotaLabel').text()
  annotation[$('.card-panel:visible').attr('id').substr(-1)].annotations[number].list[0].body.object=$('.'+div+' p.annotaLink').text()
}

function removeAnnotation(something){
  var div = something.parentElement.parentElement.className.replace(/ /g, '.')
  var number = []
  for (var i = 0; i < div.length ; i++) {
    if(!isNaN(div[i])){
      number.push(div[i])
    }
  }
  
  $('.span-'+number).contents().unwrap()
  
  Materialize.toast('Annotation deleted!', 2000)
  annotation[$('.card-panel:visible').attr('id').substr(-1)].annotations[number] = null
  populateSpan()
}

function editAnnotation(something){
  var div = something.parentElement.parentElement.className.replace(/ /g, '.')
  var number = []
  for (var i = 0; i < div.length ; i++) {
    if(!isNaN(div[i])){
      number.push(div[i])
    }
  }
  annotation[$('.card-panel:visible').attr('id').substr(-1)].annotations[number] = null
  $('.span-'+number).contents().unwrap()
  Materialize.toast('Make a new annotations', 5000)
  $("#annotationInfo").closeModal()


}

/* -----------------------------------------------------------------------------------------------------
Doppio click sullo span e mi apre la modale in cui mi mostra le informazioni relative all'annotazione.
Faccio il controllo se lo span contiene la classe othergroup o meno e gestisco di conseguenza.

--------------------------------------------------------------------------------------------------------*/


$(document).on('dblclick touchstart', '.annotation.highlight', function() {
 
  if($(this).hasClass('otherGroup')){ //query
    var info = this.className.replace('annotation', '').replace('highlight', '').replace('otherGroup', '').replace('  ', ' ').trim().split(' ')
    // type e index

    $('#annotationContents').append('<div class="info ' + info[0] + ' ' + info[1] + '"></div>')
    var classes = '.' + info[0] + '.' + info[1]
      
    var date = timeStampToHuman($(this).attr('date'))
    var user = $(this).attr('user_name')
    var email = $(this).attr('user')
    var type = $(this).attr('type')
    var graph = $(this).attr('graph')
    var content = $(this).attr('object')
    var labelA = $(this).attr('labelA')
    var labelO = $(this).attr('labelO')
    var contentSpan = $(this).text()


    var div = $('#annotationContents')
    div.append('<div class="'+ classes+'">')
    div = $('#annotationContents >'+classes)
    annoLab = getAnnotationLabel(type)
    console.log(annoLab)
    if (annoLab == -1) {
       annoLab = "Undefined Type";
       console.log(type)
     }
    div.append("<h4>" + annoLab + "</h4>")
    div.append("<p><b>User:</b><a href='" + email + "'> " + user + "</a></p>")
    div.append("<p><b>Date:</b> " + date + "</p>")
    //L'Object varia a seconda del tipo di annotazione
    if(type == 'hasAuthor'){
      if (labelA != '')
        div.append("<p><b>Author is:</b> " + labelA + "</p>")
      else
        div.append("<p><b>Author is:</b> " + contentSpan + "</p>")
    }
    else if(type == 'hasTitle'){
        div.append("<p><b>Title is:</b> " + content + "</p>")
    }
    else if(type == 'hasURL'){
        div.append("<p><b>URL is:</b> " + content + "</p>")
    }
    else if(type == 'hasDOI'){
        div.append("<p><b>DOI is:</b> " + content + "</p>")
    }
    else if((type == 'denotesRhetoric') || (type == 'denotesRethoric')){
      if (labelO != '')
        div.append("<p><b>Type of Rhetoric:</b> " + labelO+ "</p>")
      else
        div.append("<p><b>Type of Rhetoric:</b> " + getLabelRhetType(content) + "</p>")
    }
    else
      div.append("<p><b>Object:</b> " + content + "</p>")
  } 
  else { //no query
    var info = this.className.replace('annotation', '').replace('highlight', '').replace('  ', ' ').trim().split(' ')
    $('#annotationContents').append('<div class="info ' + info[0] + ' ' + info[1] + '"></div>')
    var classes = '.' + info[0] + '.' + info[1]
    var div = $('#annotationContents >' + classes)
    var content = $('.' + this.className.split(' ').join('.')).text()
    
    if (info[0].includes("span-"))
      var id_span = info[0].replace("span-", "");
    else
      var id_span = info[1].replace("span-", "");

    var annotations = annotation[$('.card-panel:visible').attr('id').substr(-1)].annotations[id_span].list[0]

    div.append("<h4>" + annotations.label.capitalize() + "</h4>")
    div.append("<p>" + annotations.body.label + "</p>")
    if (annotations.type == 'cites'){
      div.append("<p><b>Link Citated:</b> " + annotations.body.object+ "</p>")
    }
    else if(annotations. type == 'denotesRhetoric'){
        div.append("<p><b>Type of Rhetoric:</b> " + getLabelRhetType(annotations.body.resource) + "</p>")
    }
    div.append("<p><b>User email:</b> " + annotations.provenance.author.email+ "</p>")
    div.append("<p><b>User name:</b> " + annotations.provenance.author.name + "</p>")
    div.append("<p><b>Date:</b> " + annotations.provenance.time + "</p>")  
  }
  
  $("#annotationInfo").openModal({
    dismissible:true,
    complete: function() { $('#annotationContents').html(''); }
  });
});

/*
  Gestisce gli higlight degli span
*/
$(document).on({  
    mouseenter: function () {
        var spanClass = this.className.split(' ').join('.')
        $('.card-panel:visible .'+spanClass).addClass('highlight')
         },

    mouseleave: function () {
        var spanClass = this.className.split(' ').join('.')
        $('.card-panel:visible .'+spanClass).removeClass('highlight')
    }
}, 'span.annotation');




