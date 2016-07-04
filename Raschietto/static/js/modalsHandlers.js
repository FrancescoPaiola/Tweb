/*
  Funzione che gestisce lo switch dalle annotazioni
  su documento da quelle su frammento
*/
function switchAnnotationSubject() {
  $('#docChoices').toggleClass('hide');
  $('#fragChoices').toggleClass('hide');
}


/*
  Cambia pagina nella modale createAnnotation
  (serve solamente nel caso in cui si scelga
  come soggetto dell'annotazione il frammento)
*/
function modalSwitchPage(type, widget) {
  // da nascondere
  $('#modalSelectTypeAnnotation').toggleClass('hide');
  $('#modalCloseButton').toggleClass('hide');

  // da visualizzare
  $('#modalPreviousPageButton').toggleClass('hide');
  $('#modalConfirmButton').toggleClass('hide');

  if (widget == undefined) {
    $(".widgetShow").toggleClass('hide');
    $(".widgetShow").toggleClass('widgetShow');
    $('#createAnnotation .modal-title').replaceWith("<h5 class='modal-title'>Create annotation </h5>");
  }
  else {
    $('#' + widget).toggleClass('hide');
    $('#' + widget).toggleClass('widgetShow');
    $('#createAnnotation .modal-title').replaceWith("<h5 class='modal-title'>Create fragment's annotation - " + getAnnotationLabel(type) + "</h5>");
  }
}

/*
  Una volta selezionato il soggetto e il tipo
  di annotazione che si vuole creare, si chiama
  questa funzione che salva l'annotazione
  nel JSON locale
*/
function modalConfirm() {
  if ($('.widgetShow').attr('id') == "widgetComment") {
    checkInput("fragment", "hasComment");
  } else if ($('.widgetShow').attr('id') == "widgetRhetorical") {
    checkInput("fragment", "denotesRhetoric");
  } else
    checkInput("fragment", "cites")
}

/*
  Riporta la modal #createAnnotation allo stato iniziale
*/
function modalReset(type) {
  if ($('#selectedTextArea').attr('class') == 'hide')
    $('#selectedTextArea').toggleClass('hide');

  if ($('#docInputArea').attr('class') != 'hide')
    $('#docInputArea').toggleClass('hide');

  if ($('#annotationSubject').attr('class') == 'hide')
    $('#annotationSubject').toggleClass('hide');

  if ($('#fragChoices').attr('class') == 'hide')
    switchAnnotationSubject();

  $('#createAnnotation input:checked').attr('checked',false); 
  $('#inputComment').val('');
  $('#inputAuthor').val('');
  $('#createAnnotation .modal-title').replaceWith("<h5 class='modal-title'>Create annotation</h5>");
  
  if (type == "hasComment") 
    modalSwitchPage(type, "widgetComment");
  else if (type == "denotesRhetoric")
    modalSwitchPage(type, "widgetRhetorical");
  else if (type == "cites")
    modalSwitchPage(type, "widgetCitation");

  $('#createAnnotation').closeModal();
}

/*
  Apre la modale quando non vi è testo selezionato
*/

function openDocumentModal() {
  $('#selectedTextArea').toggleClass('hide');
  $('#docInputArea').toggleClass('hide');
  $('#annotationSubject').toggleClass('hide');
  $('#createAnnotation .modal-title').replaceWith("<h5 class='modal-title'>Create document's annotation</h5>");
  if ($('#docChoices').attr('class') == 'hide') {
    switchAnnotationSubject();
  }
  $('#createAnnotation').openModal({dismissible: false});
}

/*
  Elimina tutte le annotazioni non ancora salvate
  sul documento aperto
*/
function deleteModal(){
  $('#annotationsNumber').html(annotation[$('.card-panel:visible').attr('id').substr(-1)]['annotations'].length)
  $("#annotationDelete").openModal({
    dismissible:false
  });
}

/* 
  Conferma dell'utente per deleteModal()
*/
function confirmDelete(){
  $('.card-panel:visible .annotation').contents().unwrap();
  groupsActived( annotation[$('.card-panel:visible').attr('id').substr(-1)].url)
  delete annotation[$('.card-panel:visible').attr('id').substr(-1)]['annotations']
  annotation[$('.card-panel:visible').attr('id').substr(-1)]['annotations'] = []
  $("#annotationDelete").closeModal()
}
