//-------------------------------Funzioni per l'apertura della sidebar-----------------------------------------

//$(function()) == document.ready
$(function(){
  // the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
  $('.modal-trigger').leanModal();
  $('select').material_select();
  $('.main-menu').mouseover(function() {
    toggleNavAdd();
  });

  function toggleNavAdd() {
    $('#header').addClass('show-nav');
    $('.main-menu:hover').mouseleave(function() {
      toggleNavRemove();
      Remove();
    });
  }

  function toggleNavRemove() {
    $('#header').removeClass('show-nav');
  }

//autoclose of divs in sidebar when leaving
function Remove(){
  $('.collapsible-body').stop(true,false).slideUp(
  {
    duration: 350,
    easing: "easeOutQuart",
    queue: false,
    complete:
    function() {
      $(this).css('height', '')
    }
  });
  $panel_headers = $('#toggle').find('> li > .collapsible-header');
  $panel_headers.not($('#toggle')).removeClass('active').parent().removeClass('active');
}

//Inizializza il bottone per aprire la sidebar in mobile
  (function($){
    $(function(){
      $('.button-collapse').sideNav();
    }); 
  })(jQuery);
});


//----------------------------Metadata Documenti-----------------------------------------------
// quando si cambia tab, recupera i metadati delle annotazioni sul documento fatte dal parser e aggiorna

$(document).on('click','#main-tabs>li a', function() {
  try{
    if((annotation[$('.card-panel:visible').attr('id').substr(-1)].annotations.length)>0){
      clearDocumentDataModal()
      fillParsed()
    }
    else{
      $('.card-panel:visible .annotation.otherGroup').contents().unwrap();
      groupsActived(annotation[$('.card-panel:visible').attr('id').substr(-1)]['url'])
      clearDocumentDataModal()
    }
  }
  catch(err){console.log('nessun url')}
});


//load metadata
//switcher reader/annotator
function switcher(param) {
  if (param.checked){
    $('#loginmodal').openModal({dismissible: false});
  }
  else {
    $('#annotator').hide()
    Materialize.toast('Switched to Reader', 1000);
  }
}

//estrae la stringa dalla searchBar, carica il metodo load, visualizza il documento
$('.form-search').submit(function( event ) {
  event.preventDefault(); //evita il metodo predefinito
  //if statement to choose from mobile or not mobile searchbar
  if($('#search-br').val()) {
    var name = $('#search-br').val()
  } 
  else {
    var name = $('.search-br').val()

  } 
  getData(name)
});


// ------------------------------TABS----------------------------------------

var indexTab = 0
var MAXTAB = 10              //numero massimo di tab aperte TODO: METTERE LA VERSIONE PRO E PAYPAL

//select tab and show div
function selectTab (indexTab) {
  $('ul.tabs').tabs('select_tab', 'div_'+indexTab);
}
//create new tab and div. check if is the first one.
function newTab(){
  var checklist
  if (indexTab == 0) {
    var $li_tab = '<li class="tab col s3"><a href="#div_'+indexTab+'">Raschietto</a></li>';
    $('ul#main-tabs.tabs').html($li_tab).tabs();
    $('#div_0').html('<div class="show" id="loading"><div class="dots"><i class="dot-1"></i><i class="dot-2"></i><i class="dot-3"></i><i class="dot-4"></i><i class="dot-5"></i><i class="dot-6"></i></div></div>')
    selectTab(indexTab)
  }  
  else if (indexTab < MAXTAB){
    var $li_tab = '<li class="tab col s3"><a href="#div_'+indexTab+'">Document '+indexTab+'</a></li>';
    $('ul#main-tabs.tabs').append($li_tab).tabs()
    newDiv()
    selectTab(indexTab)  
  }  
  else {
    Materialize.toast("You can't open others tabs", 3000)
  }
}

//create newDiv with loader
function newDiv(){
  $('#main-content').append('<div class="card-panel" id="div_'+indexTab+'"><div class="dots show" id="loading"><i class="dot-1"></i><i class="dot-2"></i><i class="dot-3"></i><i class="dot-4"></i><i class="dot-5"></i><i class="dot-6"></i></div></div></div>')
}

//animation for searchbar  
$('#search-br').focus(function() {
  $('#search-br').css('width','250px')
});

$('#search-br').focusout(function() {
  $('#search-br').css('width','200px')
});


// ---------------------- FUNZIONI AJAX PER CARICAMENTO E PARSING ---------------------- 
 function getData(name){
  console.log
         
    $('#loading').toggleClass('hide')
   clearDocumentDataModal() //cancello il DocumentDataModal ogni volta che carico un doc
   elem = $('.list-docs a');
   // controllo se c'è quell'articolo è nella lista documenti
   // non c'è, lo aggiungero' nel loading
   if ( elem.filter($('[name="'+name+'"]')).length == 0 ) {
     Materialize.toast("Loading",3000)
     checkList = false;
   }
   // c'è, controllo che sia aperto e nel caso mi sposto su quella tab
   else {
     checkList = true;//bool, true se è presenta nella lista documenti e faccio la query, false non c'è e faccio il parsing
     if ( $('[name="'+name+'"]').filter(($('[class="doc-link open"]'))).length >0 ) {
       selectTab($('[name="'+name+'"]').attr('value'))
       $('#loading').toggleClass('hide');
       $('.search-br').val('');
       Materialize.toast('The document is already open', 2000)
       return;
     }
     // c'è e non è aperto, aggiungo la classe e l'indexTab
     else {
       $('[name="'+name+'"]').addClass('open')
       $('[name="'+name+'"]').attr('value', indexTab);
     }
   }
   // if ( elem.filter($('[href="'name'"]')).length == 0 ) {
   // }
   $('#loading').toggleClass('hide');
   
    $('.search-br').val('');//resetta l'input
   newTab()
    $.ajax ( {
      type: "GET", 
      dataType: 'json', 
     url: "/load"+(name),
      async: true,
      todo: checkList,
      contentType: "application/json; charset=utf-8",
  
     success: function (data) {     
       if (checkList==false){
        var $aHref = '<li><a onclick="getData(name)" name="'+name+'" class="doc-link open" value="'+indexTab+'">'+name+'</a></li>';
       $('.list-docs').append($aHref);
       }
       var json = $.parseJSON(data); //parsa il json
       $('#div_'+indexTab).html(json.html); //jelo butta
        if(this.todo){ //controllo se checklist è true or false
          groupsActived(name);   //controllo quali gruppi hanno annotato sul documento (name) e richiamo queryAnnotation
        }
         else
         parse(name, indexTab);
       annotation[indexTab] = {}
       annotation[indexTab]['annotations'] = []
       annotation[indexTab]['prefixString'] = (json.prefixString)
       annotation[indexTab]['url'] = (json.url)
       indexTab++
     },  
      error: function(){
        $('.search-br').val(''); 
       var $toastContent = ("L'url '" + name + "' inserito non e' valido");
        Materialize.toast($toastContent, 3000);
        $('ul.tabs li').last().remove()
        $('ul.tabs').tabs()
        $('#div_'+indexTab).remove()
        selectTab(indexTab-1)
      }
    }) ;
  }

function parse(name, tab){
    $('#div_'+tab).toggleClass('loading')
    $('#div_'+tab).append('<div class="dots show" id="loading"><i class="dot-1"></i><i class="dot-2"></i><i class="dot-3"></i><i class="dot-4"></i><i class="dot-5"></i><i class="dot-6"></i></div></div></div>')
    Materialize.toast("Parsing",3000)
    $.ajax({
      type: "GET", 
     dataType: 'json', 
     url: "/parse"+(name),
      async: true,
      contentType: "application/json; charset=utf-8",
      success: function (data) {      
        $('#div_'+tab).toggleClass('loading')
        $('#div_'+tab).toggleClass('parsed')
        $('#div_'+tab+'>#loading').toggleClass('hide')
        $('.search-br').val('');
        var json = $.parseJSON(data); //parsa il json
        annotation[tab]['annotations']=json.annotations
 
       annotation[tab]['data']=(json.data)
       annotation[tab]['doi']=(json.doi)
       annotation[tab]['title']=(json.title)
       annotation[tab]['url']=(json.hasurl)
       annotation[tab]['authors']=(json.authors)
 
       $('.data-pubblication').html(json.data)
       $('.data-doi').html(json.doi)
       $('.data-title').html(json.title)
       $('.data-url').html(json.hasurl)
       $('.data-authors').html('')
       
       elem = $('[href="#div_'+tab+'"]')
       href = $('[value="'+tab+'"]')
       href.text(json.title)
       elem.text(json.title)      
 
       clearDocumentDataModal()
       fillParsed()
 
       $('#div_'+tab).html(json.html)
     },
     error: function(){
       Materialize.toast('Impossible to parse', 2000)
       $('#div_'+tab).toggleClass('loading')
       $('#div_'+tab+'>#loading').toggleClass('hide')
     }
   });
 }
 
 function fillParsed(){
   var json = annotation[$('.card-panel:visible').attr('id').substr(-1)]
   var tr = "\
   <td> Parser ltw1551 </td> \
   <td>" + json.annotations[0].list[0].provenance.time + "</td> \
   </tr>"
 
   for (var i = 0; i < json.authors.length; i++) { 
     $("#annotationDocument-Author").append('<tr><td>' + json.authors[i] + '</td>'+tr)
   }
   $("#annotationDocument-Title").append('<tr><td>' + json.title + '</td>'+tr)
   $("#annotationDocument-DOI").append('<tr><td>' + json.doi + '</td>'+tr)
   $("#annotationDocument-URL").append('<tr><td>' + json.url + '</td>'+tr)
   $("#annotationDocument-hasPublicationYear").append('<tr><td>' + json.data + '</td>'+tr)
 }
 
 function forceParse(name){
   tab = $('.card-panel:visible').attr('id').substr(-1)
   name = $('[value="'+tab+'"]').attr('name')
   $('#div_'+tab).toggleClass('loading')
  $('#div_'+tab+'>#loading').toggleClass('hide')
   $.ajax({
     type: "GET", 
     dataType: 'json', 
     url: "/parse"+(name),
     async: true,
      contentType: "application/json; charset=utf-8",
  
      success: function (data) {
        $('#div_'+tab).toggleClass('loading')
        $('#div_'+tab+'>#loading').toggleClass('hide')
       $('.search-br').val('');
        var json = $.parseJSON(data); //parsa il json
        annotation[tab]['data']=(json.data)
       annotation[tab]['doi']=(json.doi)
       annotation[tab]['title']=(json.title)
       annotation[tab]['url']=(json.hasurl)
       annotation[tab]['authors']=(json.authors)
       
       elem = $('[href="#div_'+tab+'"]')
       href = $('[value="'+tab+'"]')
       href.text(json.title)
       
       elem.text(json.title)
       $('#div_'+tab).html(json.html)
       //annotation[tab]['index'] = json.class
       annotation[tab]['annotations']=json.annotations
       
       console.log(annotation[tab].annotations)
       
       clearDocumentDataModal()
       fillParsed()
     },
  
      error: function(){
        Materialize.toast('Impossible to parse', 2000)
        $('#div_'+tab).toggleClass('loading')
        $('#div_'+tab+'>#loading').toggleClass('hide')
      }
    });
 
  }

function save(){
  $.ajax({
    type: "POST",
    url: "/save",
    data: JSON.stringify((annotation[$('.card-panel:visible').attr('id').substr(-1)].annotations)),
     // data: JSON.stringify(newAnnotation),
     contentType: "application/json; charset=utf-8",
     dataType: "json",
     success: function(data){
      var numberAnnotationToSave = 0
      var annotations = annotation[$('.card-panel:visible').attr('id').substr(-1)].annotations;
       for (i = 0; i<annotations.length; i++){
            if (annotations[i]){
            numberAnnotationToSave += annotations[i].list.length;
            }
          }
      if(numberAnnotationToSave == 0)
        Materialize.toast("There are no annotations to be saved" , 3000)
      else
        Materialize.toast("" + numberAnnotationToSave + " annotations saved!" , 3000)
    },
    failure: function(errMsg) {
      alert(errMsg);
    }
  });
}


// ------------------------------FILTER----------------------------------------
//Gestisce filtri tipi di annotazione

function disableAnnotation(a){
  $('.'+a).each(function( index ) {
    if( $( this ).hasClass('annotation-disabled-graph') ){
      $( this ).toggleClass('annotation-disabled')
    }
    else{
      $( this ).toggleClass('annotation-disabled')
      $( this ).toggleClass('annotation')
    }
  });
}

//Gestisce filtri grafi
function disableGraph(id){
  $('span[graph='+id+']').each(function( index ) {
    if( $( this ).hasClass('annotation-disabled') ){
      $( this ).toggleClass('annotation-disabled-graph')
    }
    else{
      $( this ).toggleClass('annotation-disabled-graph')
      $( this ).toggleClass('annotation')
    }
  });
}


// ---------------------- LOGIN ---------------------- 
$('#login').submit(function( event ) {
  event.preventDefault();
  provenance[0] = document.getElementById("username").value;
  provenance[1] = document.getElementById("email").value;

  if((provenance[0]!= 'username') && (provenance[1]!= 'example@example.com')){
    $('#annotator').show()
    $('#loginmodal').closeModal();
    Materialize.toast('Switched to Annotator', 1000);
  }
  else {
    Materialize.toast('Username or e-mail are not valid', 2000);
  }
});