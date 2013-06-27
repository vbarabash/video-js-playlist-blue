var videosCount = 0,
    paddingSize = playerWidth/2 - 120;
_V_("video1").ready(function() {

  var player = this;
  player.width(playerWidth);
  player.height(playerHeight);

  if (getURLParameter('autoplay') != 'false') {
    setTimeout(function() {player.play()}, 100);
  }
  
  // set right padding to panel elements  
  $('.vjs-controls-panel').css({'padding-right':paddingSize});
  
  // set titles for buttons 
    $('.vjs-fullscreen-control').attr({'title':'Fullscreen'});
    $('.vjs-captions-button').attr({'title':'Subtitles'});
    $('.vjs-pdf-button').attr({'title':'Download PDF'});
    $('.vjs-popup-control').attr({'title':'Popup Subtitles'});
    
    insertPdf(0);
    
    if (videosCount <= 1) {
      $('.playlist-buttons').hide();
      $(".playlist-video-title").css({'padding-right':'15px'}).autoEllipsisText();
    } else {
      // for too long titles
      $(".playlist-video-title").autoEllipsisText({width:450});
    }
    
    // wrap video titles
    $(".playlist-item").autoEllipsisText();
    
    // show control panel all time
    $('.vjs-controls').addClass('vjs-fade-in-start');
    
    // hide/show playlist
    $('.playlist-current').hover(function(){
      showPlaylist();
      
    })
    .mouseleave(function(){
      hidePlaylist();
      $('.playlist-popup').hide();
      $('.playlist-current-label').show();
    }); 
    
    player.volume(0.9);
         
    

});

function download_pdf (pdf_file) {
  window.open(pdf_file,'_blank');
}

function insertPdf(currentIndex) {
      var pdfHtml,
      count = 0;
      
      $('.vjs-pdf-button .vjs-menu').remove();
      pdfHtml = '<ul class="vjs-menu"><li class="vjs-menu-title">Download PDF</li>'; 
      for (var param in _V_.options.playlist[currentIndex]['sources']) {        
        if (_V_.options.playlist[currentIndex]['sources'][param]['type'] == 'application/pdf') {
          count++;
          pdfHtml += '<li class="vjs-menu-item" tabindex="0" onclick="download_pdf(\''+_V_.options.playlist[currentIndex]['sources'][param]['src']+'\')">'+ _V_.options.playlist[currentIndex]['sources'][param]['title'] +'</li>';
        }
      
      }
      pdfHtml += '</ul>';
      
      if (count > 0) {
        $('.vjs-pdf-button').show();
        $('.vjs-pdf-button div').after(pdfHtml);
      } else {
        $('.vjs-pdf-button').hide();
      }  

}

// set count of videos in playlist
function setVideosCount (count) {
    videosCount = count;
}

// function for changing control panel' CSS by changing the size of screen
var time;
function fullSizePlayer (status) {
  
  if (status) {
    // for FullSize:
    // control panel position
    $('.vjs-controls').css({'bottom':'0'});
    // buttons centering
    $('.vjs-controls-panel').css({'padding-right':$('#video1').width()/2 - 120});
    // captions size
    $('.video-js .vjs-text-track').css({'font-size':'18px'});
    
    // add events to show/hide CP (control panel)
    addControlPanelShowHideEvents();
    
    // add events on hover the CP
    addCPEvents();
    
  } else {  
    // for Small Size
    clearTimeout(time);
    fadeIn();
    deleteControlPanelShowHideEvents();
    deleteCPEvents();
    $('.vjs-controls').css({'bottom':'-30px'});
    $('.vjs-controls-panel').css({'padding-right':paddingSize});
    $('.video-js .vjs-text-track').css({'font-size':'14px'});
  }
}

function hidePlaylist() {
  $('.playlist-popup').hide(); 
  $('.playlist-current-label').show();  
  $('.playlist-current').css({'background':'url("js/video-js.png") -30px -32px'});
}

function showPlaylist () {
  $('.playlist-popup').show();
  $('.playlist-current-label').hide();
  $('.playlist-current').css({'background':'url("js/video-js.png") -30px -57px'});
}

function getURLParameter(name) {
    return decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );
}

function fadeIn () {
  $('.vjs-controls').stop().css({'opacity':1});   
}

function fadeOut () {
  fadeIn();
  $('.vjs-controls').animate({
    opacity:0 },500, function() {});
}

function addControlPanelShowHideEvents () {
  // show\hide controls on mousemove
    $('#video1').mousemove(function() {
      fadeIn();
      clearTimeout(time);
      time = setTimeout(function () {
        fadeOut();  
      },2000);  
    })
    .mouseleave(function() {
      clearTimeout(time);
      fadeOut();
    });
} 

function deleteControlPanelShowHideEvents () {
  $('#video1').unbind('mousemove').unbind('mouseleave');
}

function addCPEvents () {
  $('.vjs-controls').mouseenter(function () {
      deleteControlPanelShowHideEvents();
      clearTimeout(time);
      fadeIn();
    }).mouseleave(function () {
      addControlPanelShowHideEvents();    
    });
}

function deleteCPEvents () {
  $('.vjs-controls').unbind('mouseenter').unbind('mouseleave');
}