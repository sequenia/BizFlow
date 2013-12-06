(function () {

    var isAnyAdjustableNumberDragging = false;

    Clarity.classes.ItemDrag = 
    {
      initialize: function (element, options, clarity, variable) 
      {
        this.element = element;
        this.clarity = clarity;
        this.variable = variable;
        this.clickTime = new Date();
        this.delta = 0;
        this.textInput = undefined;

        this.min = (options.min !== undefined) ? parseFloat(options.min) : 1;
        this.max = (options.max !== undefined) ? parseFloat(options.max) : 10;
        this.step = (options.step !== undefined) ? parseFloat(options.step) : 1;
        
        this.initializeHover();
        this.initializeDrag();
        this.initializeStyle();
      },

    // hover
    
    initializeHover: function () 
    {
      this.isHovering = false;
      this.element.addEvent("mouseenter", (function () { this.isHovering = true;  this.updateRolloverEffects(); }).bind(this));
      this.element.addEvent("mouseleave", (function () { this.isHovering = false; this.updateRolloverEffects(); }).bind(this));
    },
    
    initializeStyle: function() 
    {

    },
    
    updateRolloverEffects: function () 
    {
      this.updateCursor();
    },
    
    isActive: function () 
    {
      return this.isDragging || (this.isHovering && !isAnyAdjustableNumberDragging);
    },

    updateCursor: function () 
    {
      var body = document.getElement("body");
      if (this.isActive()) { body.addClass("CKCursorDragHorizontal"); }
      else { body.removeClass("CKCursorDragHorizontal"); }
    },

    createTextInput: function()
    {
      var _this = this;
      var collectionName = this.element.getAttribute("collectionName"); 
      var itemNum = this.element.getAttribute("itemNum");

      this.element.style.display = 'none';
      this.textInput = document.createElement('input');
      this.textInput.type = "text";
      this.textInput.className = "input-small hand-input";
      this.textInput.value = angular.element(this.element).scope().getItemQty(collectionName, itemNum);

      var deleteElement = function(namespace, collectionName, itemNum)
      {
        scope = angular.element(namespace.element).scope();
        scope.$apply(function() {
          scope.updateItemQty(collectionName, itemNum, Math.abs(parseInt(namespace.textInput.value) || 0));
        });

        namespace.element.parentNode.removeChild(namespace.textInput);
        namespace.element.style.display = '';
        namespace.textInput = undefined;
      };

      this.textInput.addEventListener("blur", function(){deleteElement(_this, collectionName, itemNum);}, false);
      this.textInput.addEventListener("keypress", 
      function(e)
      { 
        if(e.keyCode === 13)
        {
          deleteElement(_this, collectionName, itemNum);
        }
      }, 
      false);
      this.element.parentNode.appendChild(this.textInput);
      this.textInput.focus();
    },

    // drag
    
    initializeDrag: function () 
    {
      this.isDragging = false;
      new BVTouchable(this.element, this);
    },
    
    touchDidGoDown: function (touches) 
    {
      $('.hand-input').blur();
      var collectionName = this.element.getAttribute("collectionName"); 
      var itemNum = this.element.getAttribute("itemNum");
      this.valueAtMouseDown = angular.element(this.element).scope().getItemQty(collectionName, itemNum);
      this.isDragging = true;
      isAnyAdjustableNumberDragging = true;
      this.updateRolloverEffects();
      $('.label-container').css('opacity', '0.8');
    },
    
    touchDidMove: function (touches) 
    {
      var value = this.valueAtMouseDown + touches.translation.x / 5 * this.step;
      var collectionName = this.element.getAttribute("collectionName");
      var itemNum = this.element.getAttribute("itemNum");
      value = ((value / this.step).round() * this.step);
      if(value < this.min) value = this.min;
      scope = angular.element(this.element).scope();
      scope.$apply(function() {
        scope.updateItemQty(collectionName, itemNum, value);
      }); 
    },
    
    touchDidGoUp: function (touches) 
    {
      this.isDragging = false;
      isAnyAdjustableNumberDragging = false;
      this.updateRolloverEffects();
      $('.label-container').css('opacity', '0.3');

      var currentTime = new Date();
      this.delta = currentTime - this.clickTime;
      this.clickTime = currentTime;

      if(this.delta < 200) 
      {
        console.log('double-click');
        !this.textInput && this.createTextInput();
      }
    }
  };

})();
