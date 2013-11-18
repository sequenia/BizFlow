var Clarity = this.Clarity = function (rootElement) 
{
    var clarity = this;
    clarity.element = rootElement;

    // Конструктор
    initializeElements();
    return clarity;

    // Всем DOM-элементам из roolElement настраивает поведение,
    // заданное в классах из хэша classes.
    function initializeElements() 
    {
        var elements = rootElement.getElementsByTagName("*");
        var interestingElements = [];
        
        for (var i = 0, length = elements.length; i < length; i++) 
        {
            var element = elements[i];
            if (element.getAttribute("class")) 
            {
                interestingElements.push(element);
            }
        }

        // Инициализируем все элементы, у которых задан класс
        
        for (var i = 0, length = interestingElements.length; i < length; i++) 
        {
            var element = interestingElements[i];

            var views = null;
            var classAttribute = element.getAttribute("class");
            if (classAttribute) 
            {
                var classNames = classAttribute.split(" ");
                views = getViewsForElement(element, classNames);
            }
        }
    }
          
    // Для каждого класса переданного элемента
    // инициализирут класс, если он присутствует в classes
    function getViewsForElement(element, classNames) 
    {
        var views = null;
        
        for (var i = 0, length = classNames.length; i < length; i++) 
        {
            var clas = Clarity.classes[classNames[i]];
            if (!clas) { continue; }
            
            var options = getOptionsForElement(element);
            var args = [ element, options, clarity ];
            
            var view = constructClass(clas, args);
            
            if (!views) { views = []; }
            views.push(view);
        }
        
        return views;
    }
    
    function getOptionsForElement(element) 
    {   
        var options = {};

        var attributes = element.attributes;
        var regexp = /^data-[\w\-]+$/;

        for (var i = 0, length = attributes.length; i < length; i++) 
        {
            var attr = attributes[i];
            var attrName = attr.name;
            if (!attrName || !regexp.test(attrName)) { continue; }
            
            options[attrName.substr(5)] = attr.value;
        }
         
        return options;   
    }

    function constructClass(clas, args) 
    {
        if (typeof clas !== "function") 
        {
            var View = function () { };
            View.prototype = clas;
            var view = new View();
            if (view.initialize) { view.initialize.apply(view,args); }
            return view;
        }
    }
};

Clarity.classes = {};