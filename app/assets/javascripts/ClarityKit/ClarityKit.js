(function () {

    var isAnyAdjustableNumberDragging = false;

    Clarity.classes.ItemDrag = 
    {
      initialize: function (element, options, clarity, variable) 
      {
        this.element = element;
        this.clarity = clarity;
        this.variable = variable;

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

    // drag
    
    initializeDrag: function () 
    {
      this.isDragging = false;
      new BVTouchable(this.element, this);
    },
    
    touchDidGoDown: function (touches) 
    {
      var collectionName = this.element.getAttribute("collectionName"); 
      var itemNum = this.element.getAttribute("itemNum");
      this.valueAtMouseDown = angular.element(this.element).scope().getItemQty(collectionName, itemNum);
      this.isDragging = true;
      isAnyAdjustableNumberDragging = true;
      this.updateRolloverEffects();
    },
    
    touchDidMove: function (touches) 
    {
      var value = this.valueAtMouseDown + touches.translation.x / 5 * this.step;
      var collectionName = this.element.getAttribute("collectionName");
      var itemNum = this.element.getAttribute("itemNum");
      console.log(itemNum);
      value = ((value / this.step).round() * this.step);
      if(value < this.min) value = this.min;
      console.log("move for " + this.element);
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
    }
  };

})();
