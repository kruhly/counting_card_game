//Created by Robert J. Kruhlak
//License: CC-BY
//Inspiration: Elated.com
//Dedicated to: Justine Kruhlak
//Modification of Drag and Drop and Card Style from Elated.com
//See http://www.elated.com/res/File/articles/development/javascript/jquery/
// drag-and-drop-with-jquery-your-essential-guide/card-game.html

;(function($){
  // &#x2207; =&nabla; ="&#8711;"(do not seem to work in FireFox
  var symbols=['&clubs;', '&hearts;', '&spades;', '&diams;',  '&loz;', '&Delta;',  '&infin;'];
  var myNumbers = [ 1, 2, 3, 4, 5, 6,7,8,9,10,11,12,13,14,15, 16,17,18,19,20];

  $.fn.countingCardGame = function(options) {

      var defaults = {
          numbers: myNumbers, // Numbers used for matching and counting
          __correctCards: 0, // Initialize to zero, increment when cards are placed correctly
          __incorrectCards: 0,
          cardColor: 'purple',
          cardPileLabel: 'Take a card',
          slotsTableColor: 'blue',
          lowCard: 1,
          highCard: 10,
          minCard: 1,
          maxCardFaceCols: 4,
          maxCardFaceRows: 5,
          maxCard: myNumbers.length,
          minColumns: 1,
          maxColumns: 7,
          cardColumns: 4,
          symbolIndex: 1,
          symbols: symbols,
          shufflePictures: true,
          shufflePicturesLabel: 'Shuffle Pictures',
          shuffleNumbers: true,
          shuffleNumbersLabel: 'Shuffle Numbers',
          successMessage: 'You did it!',
          randIds: 1,
          animate: true,
          };
      if (options){
        checkIntOptions(defaults, options);
        options.minColumns = checkMinMax(options.minColumns,options.maxColumns);
        options.lowCard =  checkMinMax(options.lowCard,options.highCard);
      }
      var options = $.extend(defaults, options);

      // support mutltiple elements
      if (this.length > 1){
       this.each(function() {
        $(this).countingCardGame(options)
       });
       return this;
      }
      var ids = {
          debug: 0,
          obj:  this.attr('id'),
          license: 'CC-BY',
          functionPanel: 'functionPanel',
          slot: 'slot',
          slotsTable: 'slotsTable',
          cardTable: 'cardTable',
          cardTableRow: 'cardTableRow',
          cell: 'cell',
          card: 'card',
          cardFace: 'cardFace',
          cardPile:   'cardPile',
          panelList:  'panelList',
          shufflePictures: 'shufflePicts',
          shuffleNumbers:  'shuffleNums',
          shuffleFaces: 'shuffleFaces',
          resetButton: 'resetButton',
          rangeSlider: 'slider-range',
          lowCard:   'low',
          highCard:  'high',
          columnsSlider: 'columnsSlider',
          columnsSliderLabel: 'cardTableColumns',
          symbolsSlider: 'symbolsSlider',
          symbolsSliderLabel: 'symbol',
          successMessage: 'successMessage',
          };
      //Prepend a random string to ids so more than one game
      // can be put on a page. Needs to be done before
      // other objects are populated with ids.

      if (options.randIds){ ids=prependRandomString(ids);}

      var labels = {

          cardPile: options.cardPileLabel,
          shufflePictures: options.shufflePicturesLabel,
          shuffleNumbers: options.shuffleNumbersLabel,
          lowCard: 'Low Card',
          highCard: 'High Card',
          resetButton: 'Reset',
          shuffleFaces:   'Suffle Faces',
          columnsSlider: 'Columns: ',
          symbolsSlider: 'Symbol: ',
          };

      var symbolsSlider = {
          min: 0,
          max: (symbols.length-1),
          value: options.symbolIndex,
          id: ids.symbolsSlider,
          labelId: ids.symbolsSliderLabel,
          label: labels.symbolsSlider,
          symbols: symbols,
          };

      var columnsSlider = {
          min: options.minColumns,
          max: options.maxColumns,
          value: options.cardColumns,
          id: ids.columnsSlider,
          labelId: ids.columnsSliderLabel,
          label: labels.columnsSlider,
          };
      var sliders = {'columns': columnsSlider, 'symbols': symbolsSlider};

      this.getOptions = function() {
            return options;
          };

      this.printOptions = function(){
            alert(dump(options));
           };

      this.getIds = function() {
            return ids;
          };
      this.getLabels = function() {
            return labels;
          };

      this.getSliders = function() {
            return sliders;
          };


      //Private functions
      //UI
      // Card faces are added to cardSlots
      function addCardFace(id, symbol, opts, ids){

        var visArray=[];

        for (var i in opts.numbers){
          visArray.push(0);
        }
        // set visible symbols
        for (i=0; i<id; i++){
          visArray[i]=1;
        }
        // Randomize the placement of the visible symbols
        visArray=fisherYates(visArray);

        // need to send number as data for droppable code
        $('<table><tbody></tbody></table>').data( 'number', id )
                                           .attr( 'id', ids.cardFace + id )
                                           .appendTo('#' + ids.slot+ id);

        // A card face can hold 20 symbols five rows by 4 columns
        // is the max that will fit in a slot


        for (j=0; j<opts.maxCardFaceRows; j++){
          $('<tr></tr>').attr('id', ids.cardFace+ id +'r' + j)
                        .appendTo('#' + ids.cardFace + id);

          for (i = j*opts.maxCardFaceCols; i < ((j+1)*opts.maxCardFaceCols); i++){
             $('<td><div>'+symbol+'</div></td>').attr('id', ids.cardFace + id + 'c' + i)
                                                .appendTo('#' + ids.cardFace + id +'r' + j);
             // <div> above is necessary because drag and drop doesn't play well with tables.
             $('#' + ids.cardFace +id+'c'+i).addClass("hidden");
             if (symbol == "&hearts;" || symbol == "&diams;" || symbol == "&loz;" || symbol == "&Delta;" ){
               $('#' + ids.cardFace + id + 'c' + i).addClass("red");
             }
             if (visArray[i]){
              $('#' + ids. cardFace + id + 'c' + i).toggleClass("hidden");
             }
          }
        }

      };

      function addCardSymbol(ind,symbols){

        if (parseInt(ind)>=0 && parseInt(ind)< symbols.length ){
           return symbols[ind];
        }else{
           return symbols[0];
        }
      };

      function addCardSlots( picts, ids, opts ){

        var myMin = $('#' + ids.lowCard).val();
        var myMax = $('#'  + ids.highCard).val();
        picts = picts.slice((myMin-1),myMax);
        var myColumns = $( '#' + ids.columnsSlider ).slider( 'value' );
        var myRows = Math.ceil(picts.length/myColumns);


        if ($('#' + ids.shufflePictures).prop('checked')){
          picts=fisherYates(picts);
        }


        removeHTML(ids.cardTable);
        createCardSlots(picts, myRows, myColumns, ids, opts);

        if (ids.debug){ alert($('#' + ids.obj).css('height'))}
      };
      // Resize the cardTable and functionPanel

      function resizeUI(){
        //Used when card columns, number of cards change.
        var contentPaddingHeight = 50;
        var contentPaddingWidth = 80;
        var $cardTable = $('table[id$="cardTable"]');
        var $functionPanel = $('div[id*="functionPanel"]');

        var fpWidth = $functionPanel.outerWidth(true);
        var sTableWidth = $cardTable.outerWidth(true);
        var contentWidth = fpWidth + sTableWidth +contentPaddingWidth;
        var slotWidth = $('.slot').first().width();
        var cardFaceWidth = $('table[id*="cardFace"]').first().outerWidth(true);
        var cardFaceHeight =$('table[id*="cardFace"]').first().outerHeight(true);


        if (cardFaceWidth > slotWidth) {$('.slot').width(cardFaceWidth).height(cardFaceHeight)};
        sizeCardPile();
        $cardTable.parent().width(sTableWidth);

        var maxHeight = matchHeight($cardTable,$functionPanel);
        var contentHeight = (maxHeight + contentPaddingHeight);

        $cardTable.parent().parent().width(contentWidth).height(contentHeight);

        return contentHeight;
      };

      function createCardSlots( picts, myRows, myColumns, ids, opts){

        var pictIndex=0;
        var correctCards = opts.__correctCards;
        for ( ii = 0; ii < myRows; ii++) {

          $('<tr></tr>').attr('id', ids.cardTableRow + ii).appendTo('#' + ids.cardTable);

          for ( jj=(ii*(myRows-1)); jj < ((ii*(myRows-1)) + myColumns); jj++ ) {
            if (pictIndex < picts.length) {
              $('<td></td>').attr('id', ids.cell + pictIndex).appendTo('#' + ids.cardTableRow + ii);
              $('<div class="slot"></div>').data( 'number', picts[pictIndex])
                                           .data( 'ids', ids )
                                           .data( 'opts', opts)
                                           .attr( 'id', ids.slot + picts[pictIndex] )
                                           .appendTo( '#' + ids.cell + pictIndex )
                                           .droppable( {
                                             accept: '#' + ids.cardPile + ' div',
                                             hoverClass: 'hovered',
                                             drop: handleCardDrop
                                           } );
              var myPict = picts[pictIndex];
              addCardFace(myPict, addCardSymbol($( '#' + ids.symbolsSlider ).slider( 'value' ), opts.symbols),
              opts,ids);

              //$('.slot').width($('#'+ids.cardFace+myPict).outerWidth(true) ); //Width of card face
              //$('.slot').height($('#'+ids.cardFace+myPict).outerHeight(true) ); //Height of card face
            }
            pictIndex=pictIndex+1;
         }
       }

      };

      function addCardPile(numbers, ids, opts){

        removeHTML(ids.cardPile);
        numbers=numbers.slice(($('#' + ids.lowCard).val()-1), $('#' + ids.highCard).val());
        numbers=numbers.reverse(); // reverse so 1 starts when unshuffled

        if ($('#' + ids.shuffleNumbers).is(':checked')){
          numbers=fisherYates(numbers);
        }
       return createCardPile(numbers, ids, opts);

      };
      function animateTopCard(myShift,myDuration){
          $('.animate').animate({'marginLeft': myShift, 'marginTop': -myShift},myDuration, 'swing')
               .animate({'marginLeft':'10px', 'marginTop': '10px'}, myDuration, 'swing', function() {
                animateTopCard(myShift,myDuration);});
      };

      function stopAnimation(){

          $('.animate').stop(true,true)
                       .animate({'marginLeft':'10', 'marginTop' : '10'},1000)
                       .stop(true,true).removeClass('animate');


      };

      function addLicense(id){
        $('#' + id).html('<a rel="license" href="http://creativecommons.org/licenses/by/3.0/"><img alt="Creative Commons Attribution 3.0 Unported License" style="border-width:0" src="http://upload.wikimedia.org/wikipedia/commons/1/16/CC-BY_icon.svg"></a>').css({'height': '10px', 'padding': '10px'})
      };

      function createCardPile( numbers, ids, opts ){
        var cPId = '#' + ids.cardPile;
        var cardId = ids.card;
        var topCardId = '#'+cardId+numbers[numbers.length-1];
        if (ids.debug){alert($('#' + ids.obj).attr('id'));}

        for ( var i in numbers) {
          $('<div>' + numbers[i] + '</div>').data( 'number', numbers[i] )
            .attr( 'id', cardId + numbers[i] ,'z-index',i,'position','absolute')
            .css( {'background': opts.cardColor})
            .appendTo( cPId).draggable( {
              containment: $('#' + ids.obj),
              stack: cPId + ' div',
              cursor: 'move',
              revert: true
          } );
        }
        //add mousedown so that we can stop the animation on touch screen
        //because it does not seen to respond to hover
        $(topCardId).addClass('animate').hover(function(){stopAnimation();})
                                        .mousedown(function(){stopAnimation();});
        return '#'+cardId+numbers[numbers.length-1];
      };

      function createFunctionPanel(ids, opts, labels){ // will be the right panel in UI
        var cPId=ids.cardPile;
        return $('<div></div>').addClass( 'functionPanel')
                               .attr('id', ids.functionPanel)
                               .append(myLabel(cPId, labels.cardPile))
                               .append(myDiv(cPId).addClass('cardPile'))
                               .append(createPanelList(ids,opts,labels));
      };

      function createPanelList(ids,opts,labels){

       return myList(ids.panelList)
            .append(addCheckboxToList(ids.shufflePictures, labels.shufflePictures,opts.shufflePictures))
            .append(addCheckboxToList(ids.shuffleNumbers, labels.shuffleNumbers,opts.shuffleNumbers))
            .append(addButtonToList(ids.resetButton,labels.resetButton,'resetButton'))
            .append(addInputTextboxToList(ids.lowCard, labels.lowCard))
            .append(addInputTextboxToList(ids.highCard, labels.highCard))
            .append(addDiv(ids.rangeSlider))
            .append(addP(ids.symbolsSliderLabel))
            .append(addDiv(ids.symbolsSlider))
            .append(addP(ids.columnsSliderLabel))
            .append(addDiv(ids.columnsSlider))
            .append(addDiv(ids.license));
      };

      function createSuccessMessage(ids, opts){
          //need to use mouseup so works on mobile browsers
          //that don't seem to handle the click event
          $('<div></div>').appendTo($('#' + ids.obj))
                          .attr('id', ids.successMessage)
                          .css('position', 'absolute')
                          .addClass('successMessage')
                          .mouseup({'ids': ids, 'opts': opts}, handleClick)
                          .append($('<h2>'+opts.successMessage +'</h2>'))
                          .append($('<div></div>').attr('id','stats'))
                          .append( $('<button></button>')
                          .html('Play Again')
                            
                            
                          );

          hideSuccessMessage(ids);
      };


      function hideSuccessMessage(ids){ // Hide the success message
          var $sMId = $('#' + ids.successMessage);
          var $objId = $('#' + ids.obj);
          $sMId.hide();
          $sMId.css( {
          'top': $objId.position().top,
          'left': $objId.position().left,
          'width': '0',
          'height': '0',
          } );
      };

      // Event Handlers

      function handleCardDrop( event, ui ) {
        var slotNumber = $(this).data( 'number' );
        var cardNumber = ui.draggable.data( 'number' );
        var ids= $(this).data( 'ids');
        var opts = $(this).data('opts');
        // currently sent as data
        // because handleCardDrop can't take any other parameters


        var $sMId =$('#' + ids.successMessage);

        // If the card was dropped to the correct slot,
        // change the card colour, position it directly
        // on top of the slot, and prevent it being dragged
        // again
        if ( slotNumber == cardNumber ) {
          ui.draggable.addClass( 'correct' ).css('border','0');
          ui.draggable.draggable( 'disable' );
          $(this).droppable( 'disable' );
          ui.draggable.position( { of: $(this), my: 'left top', at: 'left top' } );
          ui.draggable.draggable( 'option', 'revert', false );
          opts.__correctCards++;

        } else {
          opts.__incorrectCards++;
        }

        // If all the cards have been placed correctly then display a message
        // and reset the cards for another go

        if ( opts.__correctCards ==  ($('#' + ids.highCard).val()-$('#' + ids.lowCard).val()+1)) {
          $('#stats').html('Correct: ' + opts.__correctCards + ' Incorrect: ' + opts.__incorrectCards);
          $sMId.show();

          var $objId = $('#'+ ids.obj);
          //animate the success message
          $sMId.animate( {
            left: $objId.position().left + $objId.width()/4,
            top: $objId.position().top + $objId.height()/4,
            width: '200px',
            height: '120px',
            opacity: 1
          } );
        }

      };

      var delay = (function(){
            var timer = 0;
            return function(callback, ms){
                       clearTimeout (timer);
                       timer = setTimeout(callback, ms);
                   };
          })();

      function matchHeight($class1,$class2){
         // match the height of the slotsTable with the functionPanel
         // depending on which is longest
         var stHeight = $class1.outerHeight(true);
         var fpHeight = $class2.outerHeight(true);

         if (stHeight >= fpHeight) {
            $class2.outerHeight(stHeight);
            $class1.parent().outerHeight(stHeight);
            return stHeight;
         } else {
            $class1.parent().outerHeight(fpHeight);
            return fpHeight;
         }
      };

      function sizeCardPile(){
         // set the size of the card pile to match the slot class size
         // set the line height to height so the text is vertically aligned
         var $cP = $('.cardPile')
         var $slot= $('.slot')
         $cP.outerWidth($slot.outerWidth())
         $cP.outerHeight($slot.outerHeight())//set to size of slot
         $cP.css('line-height',$cP.outerHeight()+'px')
      };

      function setHandleClick(id, ids, opts){
        // ids, and opts needed as parameters for handleClick
        // so that the game can be updated properly.
        //.on('click', ...) does not work on mobile touch screens
        $('#' + id).on('mouseup',{'ids': ids, 'opts': opts}, handleClick);
      };
      function setHandleClick2(id, ids, opts){
        // ids, and opts needed as parameters for handleClick
        // so that the game can be updated properly.
        //.on('click', ...) does not work on mobile touch screens
        $('#' + id).change({'ids': ids, 'opts': opts}, handleClick);
      };

      function updateSlider() {
          var ids = $(this).data('ids');
          var opts = $(this).data('opts');
          if (ids.debug) {alert( 'Check a value of ids array ' +ids.cardPile);}
          if (ids.debug) {alert('Check a value of opts array ' + opts.numbers);}
          resetGame(opts,ids);
      };

      function handleClick(event){
        ids=event.data.ids;
        opts = event.data.opts;
        if (ids.debug){ alert('HandleClick event.data.ids.cardPile=' + ids.cardPile);}
        if (ids.debug) {alert('HandleClick event.data.opts.numbers' + opts.numbers);}
        resetGame(opts,ids);
      };

      function resetGame(opts,ids){ // Reset the game
          stopAnimation();
          hideSuccessMessage(ids,opts);
          opts.__correctCards = 0;
          opts.__incorrectCards = 0;
          //Add card slots before pile so that we can
          // use the size for the card pile
          addCardSlots(opts.numbers,ids, opts);
          //sizeCardPile()
          resizeUI();
          addCardPile(opts.numbers,ids, opts);

          if (opts.animate) {
            jQuery.fx.interval = 50;
            $('.animate').delay(1000).animate({'marginLeft':'10px'},50);
            animateTopCard(-40,2000);
          }
      };

      //Sliders

      function createSlider( o, ids, opts){

          var $id = $('#'+ o.id).data('ids', ids)
                                .data('opts', opts);
          var $labelId = $('#'+ o.labelId);


          $id.slider({
              min: o.min,
              max: o.max,
              value: o.value,
              slide: function(event, ui) {
                  $labelId.html(o.label + ui.value);
              },
              stop: updateSlider,
          });
          //Render initial value
          $labelId.html( o.label + $id.slider( 'value' ) ); // In this instance it is a <p>
          $id.find('a').css({'background':'transparent','border':'none','text-align':'center','text-decoration':'none'}).html('&#9660;');

      };

      function createSymbolSlider( o, ids, opts){

          var $id = $('#'+ o.id).data('ids', ids)
                                .data('opts', opts);
          var $labelId = $('#'+ o.labelId);


          $id.slider({
              min: o.min,
              max: o.max,
              value: o.value,
              slide: function(event, ui) {
                  $labelId.html(o.label + addCardSymbol(ui.value, opts.symbols));
              },
              stop: updateSlider,
          });
          //Render initial value
          $labelId.html( o.label + addCardSymbol( $id.slider( 'value' ), opts.symbols )); // In this instance it is<p>
          $id.find('a').css({'background':'transparent','border':'none','text-align':'center','text-decoration':'none'}).html('&#9650;');

      };

      function createRangeSlider(o,ids, opts){

        var $sliderId = $('#' + ids.rangeSlider ).data('ids', ids)
                                                 .data('opts', opts);
        var $lowId = $( '#' + ids.lowCard );
        var $highId = $( '#' + ids.highCard );

        $sliderId.slider({
  			  range: true,
  			  min: o.minCard,
  			  values: [ o.lowCard, o.highCard ],
  			  max: o.maxCard,
          slide: function( event, ui ) {
  			     $lowId.val( ui.values[ 0 ] );
             $highId.val( ui.values[ 1 ] );
  			     },
          stop: updateSlider
  		  });
        // Render initial values
  		  $lowId.val( $sliderId.slider( "values", 0 )).attr('disabled',true);
        $highId.val( $sliderId.slider( "values", 1 )).attr('disabled',true);
        $sliderId.find($('a')[0]).css({'background':'transparent no-repeat','border':'none','text-align':'left','text-decoration':'none'}).html('&#9654;');
        $sliderId.find($('a')[1]).css({'background':'transparent','border':'none','text-align':'right','text-decoration':'none'}).html('&#9664;');

      };

      //Utilities
      $(function() {
        $( "#sortable" ).sortable();
        $( "#sortable" ).disableSelection();
      });

      function dump(obj) {
        var out = '';
        for (var key in obj) {
            out += key + ": " + obj[key] + "\n";
        }
        return out;
      };
      function checkMinMax(low,high){
        if (low > high){
          return high;
        }
      };

      function checkIntOptions(defaults, options){
        for (var key in defaults){
          switch(key){
            case 'minCard':
            case 'maxCard':
            case 'lowCard':
            case 'highCard':
            case '__correctCards':
            case '__incorrectCards':
            case 'minColumns':
            case 'maxColumns':
            case 'cardColumns':
            case 'symbolIndex':
            case 'randIds':
              if (key in options) {
                if (!isInt(options[key])){
                  options[key]=defaults[key];
                  console.log(key + ' is not an integer. Reverting to default.');
                  alert(key + 'is not an integer. Reverting to default.');
                } else {
                  options[key]=Math.abs(options[key]);
                }
              }
              break;
            default:

              if (key in options){
               console.log(key + ' is ' + options[key]);
              }
          }
        }
      };

      function isInt(val){
         //regex options /^[0-9]+$/.test(val);
        if((parseFloat(val) == parseInt(val)) && !isNaN(val)){
          return true;
        } else {
          return false;
        }
      };


      function prependRandomString(ids){

        var randomString = 'R'+Math.floor(10000*Math.random()).toString();

          for (var key in ids){
            if (key != 'debug' && key !='obj' && key != 'license'){
              ids[key] = randomString + ids[key];
            }
          }
        return ids;
      };

      function removeHTML(id){
        $('#' + id).html( '' ).removeData();
      };
      function myTable(id){
        return $('<table></table>').attr('id', id);
      };



      function myLabel(id,text){
          return $('<label for=' + id + '></label>').html(text);
      };

      function myDiv(id){
          return $('<div></div>').attr( 'id', id);
      };

      function myP(id){
          return $('<p></p>').attr( 'id', id);
      };

      function myList(id){
        return $('<ul></ul>').attr( 'id', id).css({'list-style-type':'none', 'padding': '10px'})
      };

      function addDiv (id){
        return $('<li></li>').append(myDiv(id));
      };

      function addP(id){
        return $('<li></li>').append(myDiv(id));
      };

      function addCheckboxToList(id,text,checked){
       
          var $in = $('<input type="checkbox"  />').prop('checked', checked)
                                                   .attr('id',id);
        
          return $('<li></li>').append($in)
                               .append($('<label for='+id+'>'+text+'</label>'));
      };

      function addButtonToList(id, text, myClass){
          return $('<li></li>').append($('<button></button>').attr('id', id)
                                                             .addClass(myClass)
                                                             .html(text)
                                      );
      };

      function addInputTextboxToList( id, text){
          return $('<li></li>').append(
                                  $('<label for=id>' + text + '</label>')
                               ).append(
       	                        $('<input type="text" id=' + id + '  maxlength="4" size="4"/>')
                               );
      };

      function fisherYates(myArray){
        //Randomizes the order of the array.
        var i = myArray.length;
        while(i--){
          var j=Math.floor(Math.random()*(i+1));
          var tempi=myArray[i];
          myArray[i]=myArray[j];
          myArray[j]=tempi;
        }
        return myArray;
      };

      //Initialization
      function initialize(obj){
          var opts=obj.getOptions();
          var ids = obj.getIds();
          var labels = obj.getLabels();
          var sliders= obj.getSliders();
          obj.addClass('gameContainer');
          obj.append(myDiv(ids.slotsTable)
             .append(myTable(ids.cardTable)));

          $('#'+ids.slotsTable).addClass('slotsTable')
                               .css({'background': opts.slotsTableColor});
          $('#'+ids.cardTable).addClass('cardTable')
                              .css({'background': 'transparent'});
          obj.append(createFunctionPanel(ids, opts, labels));
          createSlider( sliders.columns, ids, opts);
          createSymbolSlider( sliders.symbols,ids, opts);
          createRangeSlider(opts,ids, opts);
          createSuccessMessage(ids, opts);
          addLicense(ids.license);
          setHandleClick(ids.resetButton, ids, opts);
          setHandleClick2(ids.shufflePictures, ids, opts);
          setHandleClick2(ids.shuffleNumbers, ids, opts);



          // Add cards to Table

          addCardSlots(opts.numbers, ids, opts);

          // Create the pile of shuffled cards
          sizeCardPile()
          addCardPile(opts.numbers, ids, opts);
          // flesh out the game area
          // in the event that the game is attached
          // to a zero height div.
          resizeUI();

          var cssObj = {
                    'text-align': 'center',
                    'user-select' : 'none',
                    'width' : $(window).width,
                    'height' : $(window).height,
                    };

          obj.css(cssObj);
          if (opts.animate) {
            jQuery.fx.interval = 50;
            $('.animate').delay(1000);
            animateTopCard(-40,2000);
          };
          var delay = (function(){
                var timer = 0;
                return function(callback, ms){
                         clearTimeout (timer);
                         timer = setTimeout(callback, ms);
                       };
          }());

          $(window).resize(function() {
                               delay(function(){
                                    //alert('window width = ' +$(this).width() + '\n card slot width = ' + //$('.slot').first().width());
                                    resizeUI();
                                    //alert($('.slot').first().width());
                                    //...
                               }, 200); //500 is time in miliseconds
          });  //Not working properly. Widths returning NaN on resize.

        return obj;
      };

    return initialize(this);
  }
})(jQuery);




