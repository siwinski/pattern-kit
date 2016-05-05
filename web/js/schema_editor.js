handleHeights = function () {
    var iframes = $("iframe"),
        len = iframes.length,
        index,
        snippet,
        overflow,
        overflowData,
        height;

    for (index = 0; index < len; index++) {
        snippet = $(iframes[index]).contents().find("#snippet"); // element for height measurement
        overflow = snippet.css("overflow");
        overflowData = snippet.attr("data-default-overflow");
        if (overflowData !== undefined && overflowData !== "") {
            overflow = overflowData;
        } else {
            snippet.attr("data-default-overflow", overflow); //sets default after first check, so temp value does not get picked on resize iterations
        }
        snippet.css("overflow", "scroll"); // sets temp value for measuring
        height = snippet.get(0).offsetHeight;
        snippet.css("overflow", overflow); // sets styling value

        $(iframes[index]).height(height);
    }
};


var $preview = $(".js-snippet-preview"),
    $previewSource = $preview.find("iframe"),
    //viewport
    $handleLeft = $(".js-snippet-resize-handle-left"),
    $handleRight = $(".js-snippet-resize-handle-right"),
    $resizeLength = $(".js-resize-length"),
    //data
    snippetSource = $(".js-snippet-source");

(function() {
  var windowWidth = $(".left").width(),
      width = 1024;


  if ((width) + 100 > windowWidth) {
      width = (windowWidth - 100);
  }
  $preview.css('width', width);
  $resizeLength.css('width', parseInt(width / 2, 10));
})();

interact('.js-resize-length')
  .resizable({
      edges: {
          left: ".js-snippet-resize-handle-right",
          right: ".js-snippet-resize-handle-left",
          bottom: false,
          top: false
      },
      onmove: function (e) {

          var width = e.rect.width,
              windowWidth = $(".left").width();

          if (width < 160) {
              width = 160;
          } else if ((width * 2) + 100 > windowWidth) {
              width = (windowWidth - 100) / 2;
          }

          $preview
              .find(snippetSource)
              .addClass('resize-overlay');
          $preview[0].style.width = (width * 2) + 'px';
          $resizeLength[0].style.width = width + 'px';
          handleHeights();
      },
      onend: function () {
          $preview
              .find(snippetSource)
              .removeClass('resize-overlay');
          handleHeights();
      }
  });







var editor_update = function(markup, json) {
    $("#display_holder").attr('srcdoc', markup);
    $("#json_holder pre").text(JSON.stringify(json,null,2));
    $("#twig_holder").text(JSON.stringify(json,null,2));
    updateDirectLink();
    $('#display_holder').load(function(){
        handleHeights();
    });

}


var updateDirectLink = function() {
    var url = window.location.href.replace(/\?.*/,'');

    url += '?data='+LZString.compressToBase64(JSON.stringify(editor.getValue()));
    document.getElementById('direct_link').href = url;
};

if(window.location.href.match('[?&]data=([^&]+)')) {
    try {
        data.starting = JSON.parse(LZString.decompressFromBase64(window.location.href.match('[?&]data=([^&]+)')[1]));
    }
    catch(e) {
        console.log('invalid starting data');
    }
    handleHeights();
}
if (data.starting.name) {
  JSONEditor.defaults.options.startval = data.starting;
};

  // Initialize the editor with a JSON schema
  var editor = new JSONEditor(document.getElementById('editor_holder'),{
    schema: data.schema,
    theme: 'bootstrap3',
    iconlib: 'fontawesome4',
    keep_oneof_values: false
  });


  JSONEditor.plugins.sceditor.emoticonsEnabled = false;
  JSONEditor.plugins.ace.theme = 'twilight';


  editor.on('change',function() {
    var json = editor.getValue();
    $.ajax({
      url: "/validate",
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(json,null,2)
    }).success(function(response) {
      $('.valid').html(response);
      $.ajax({
        url: "/render/page",
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(json,null,2)
      }).done(function(markup) {
        editor_update(markup, json);
      });

    });
  });
