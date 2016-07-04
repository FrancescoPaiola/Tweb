// *********************Background************************

$("#background1").on('click', function () {
  $(document.body).css('background-image', 'url(/static/images/background1.png)');
  Materialize.toast('Background is changed!', 4000);
});

$("#background2").on('click', function () {
  $(document.body).css('background-image', 'url(/static/images/background2.png)');
  Materialize.toast('Background is changed!', 4000);
});

$("#background3").on('click', function () {
  $(document.body).css('background-image', 'url(/static/images/background3.png)');
  Materialize.toast('Background is changed!', 4000);
});

// *********************FontSize************************

$("#plusFontSize").click(function() {
    var fontSize = parseInt($(document.body).css("font-size"));
    fontSize = fontSize + 1 + "px";
    $(document.body).css({'font-size':fontSize});
    Materialize.toast('The font-size is increased!', 4000);

});

$("#minusFontSize").click(function() {
    var fontSize = parseInt($(document.body).css("font-size"));
    fontSize = fontSize - 1 + "px";
    $(document.body).css({'font-size':fontSize});
    Materialize.toast('The font-size is decreased!', 4000);
});

$("#defaultFontSize").click(function() {
	fontsize = 15 +"px";
  $(document.body).css({'font-size':fontsize});
  Materialize.toast('The font size is returned to the default value!', 4000);
});

// **********************NavbarColor****************************

$("#redButton").click(function() {
  $("#header > nav").removeClass();
  $("#header > nav").addClass("deep-orange darken-4");
  $("#sidebar a").css("color", '#bf360c')
  $("#sidebar .label").css("color", '#bf360c')
  $("#list-group label").css("color", '#bf360c')
  $("#sidebar .label-data-value").css("color", '#bf360c')
  $("#sidebar .label-data").removeClass().addClass('label-data')
  $("#sidebar .label-filter").removeClass().addClass('label-filter')
  $("#sidebar .label-data").addClass('deep-orange darken-4')
  $("#sidebar .label-filter").addClass('deep-orange darken-4')
  $("#sidebar .item-docs").css("border-color", '#bf360c')
  $("#sidebar .document-li").css("border-color", '#bf360c')
  $("#sidebar .filter-li").css("border-color", '#bf360c')
  Materialize.toast('The color of the navbar is changed!', 4000);
});

$("#tealButton").click(function() {
  $("#header > nav").removeClass();
  $("#header > nav").addClass("teal");
  $("#sidebar .label").css("color", '#009688')
  $("#list-group label").css("color", '#009688')
  $("#sidebar .label-data-value").css("color", '#009688')
  $("#sidebar a").css("color", '#009688')
  $("#sidebar .item-docs").css("border-color", '#009688')
  $("#sidebar .document-li").css("border-color", '#009688')
  $("#sidebar .filter-li").css("border-color", '#009688')
  $("#sidebar .label-data").removeClass().addClass('label-data')
  $("#sidebar .label-filter").removeClass().addClass('label-filter')
  $("#sidebar .label-data").addClass('teal')
  $("#sidebar .label-filter").addClass('teal')
  Materialize.toast('The color of the navbar is changed!', 4000);
});

$("#purpleButton").click(function() {
  $("#header > nav").removeClass();
  $("#header > nav").addClass("purple darken-4");
  $("#sidebar .label").css("color", '#4a148c')
  $("#list-group label").css("color", '#4a148c')
  $("#sidebar .label-data-value").css("color", '#4a148c')
  $("#sidebar a").css("color", '#4a148c')
  $("#sidebar .item-docs").css("border-color", '#4a148c')
  $("#sidebar .document-li").css("border-color", '#4a148c')
  $("#sidebar .document-li").css("border-color", '#4a148c')
  $("#sidebar .filter-li").css("border-color", '#4a148c')
  $("#sidebar .label-data").removeClass().addClass('label-data')
  $("#sidebar .label-filter").removeClass().addClass('label-filter')
  $("#sidebar .label-data").addClass('purple darken-4')
  $("#sidebar .label-filter").addClass('purple darken-4')
  Materialize.toast('The color of the navbar is changed!', 4000);
});

$("#cyanButton").click(function() {
  $("#header > nav").removeClass();
  $("#header > nav").addClass("cyan");
  $("#sidebar a").css("color", '#00bcd4')  
  $("#list-group label").css("color", '#00bcd4')
  $("#sidebar .label").css("color", '#00bcd4')
  $("#sidebar .label-data-value").css("color", '#00bcd4')
  $("#sidebar a").css("color", '#00bcd4')
  $("#sidebar li").css("color", '#00bcd4')
  $("#sidebar .item-docs").css("border-color", '#00bcd4')
  $("#sidebar .document-li").css("border-color", '#00bcd4')
  $("#sidebar .filter-li").css("border-color", '#00bcd4')
  $("#sidebar .label-data").removeClass().addClass('label-data')
  $("#sidebar .label-filter").removeClass().addClass('label-filter')
  $("#sidebar .label-data").addClass('cyan')
  $("#sidebar .label-filter").addClass('cyan')
  Materialize.toast('The color of the navbar is returned to the default color!', 4000);
});