import { Storyline } from './storyline'
import { lib } from './lib'
import { DataFactory } from './data'

var GUI = function() {
  this.storyline = {
    classObj: Storyline,
    elem: document.querySelector('#Storyline')
  }
  this.data = new DataFactory();
  this.config = {
    data: {
      url: undefined,
      data_column_name: undefined,
      datetime_format: undefined,
      datetime_column_name: undefined,
    },
    chart: {
      datetime_format: undefined,
      y_axis_label: undefined
    },
    cards: {
      title: undefined,
      text: undefined
    }
  }
}

GUI.prototype = {
  /**
   *
   *
   * @param {String} template name
   * @param {Object} columns
   * @returns {undefined}
   */
  createTemplate: function(template, columns) {
  var mustache = require('mustache');
  var columns  = columns ? columns : ''

  const MUSTACHE_TEMPLATES = {
        "urlBuilder":
          "<div class='data-nav'>" +
           "<input placeholder>" +
           "<button class='load-btn' handler='loadData'>Load Data</button>" +
          "</div>",
        "columnBuilder":
          "<div class='flyout data-nav'>" +
          "<p>Select an {{axis}}</p>" +
           "<a class='data-selected-column' href='#'>Columns</a>" +
           "<ul class='flyout-content data-nav stacked'>" +
            "{{#headers}}" +
             "<li>" +
              "<a class='data-columns' handler='loadColumn' href='#'>" +
               "{{ . }}" +
              "</a>" +
             "</li>" +
            "{{/headers}}" +
           "</ul>" +
          "</div>"
        }
  var rendered = mustache.render(MUSTACHE_TEMPLATES[template], columns),
      parser = new DOMParser(),
      doc = parser.parseFromString(rendered, "text/html")

    return doc.body.children[0];
  },

  buildColumnSelector: function(column, dataContext) {
      var tmpl = this.createTemplate('columnBuilder', dataContext)
      tmpl.classList.add(column);
      this.appendTemplate('#Storyline', tmpl)
      this.bindEvents('.data-columns')
  },

  loadData: function(context) {
    var self = context;
    self.config.data.url = event.target.previousElementSibling.value
    self.data.fetchSheetHeaders(self.config, self.data).then(function(dataObj) {
      self.dataObj = dataObj
      self.buildColumnSelector('x-column', {axis:'x-column', headers: this.dataObj.headers})
    }.bind(self))
  },

  loadColumn: function(context) {
    var self = context;
    var parentElem = event.target.parentElement.parentElement.parentElement
    var selectedElem = parentElem.querySelector('.data-selected-column')
    var classes = parentElem.classList
    var columnPos;
    for(var i=0; i<classes.length; i++) {
      if(classes[i].match('-column') != null) {
        columnPos = classes[i].match('-column').input
      }
    }
    if (columnPos === 'x-column') {
      self.config.data.datetime_column_name = event.target.text
      self.buildColumnSelector('y-column', self.dataObj.headers)
    } else if(columnPos === 'y-column') {
      self.config.data.data_column_name = event.target.text
      self.buildColumnSelector('datetime-format-column', ['MM/DD/YY'])
    } else if(columnPos === 'datetime-format-column') {
      //probably shld convert human readable time to d3time//
      self.config.data.datetime_format = event.target.text
      self.buildColumnSelector('cards-title-column', ['slidetitle', 'slidetext', 'slideactive'])
      self.buildColumnSelector('cards-text-column', ['slidetitle', 'slidetext', 'slideactive'])
    } else if(columnPos === 'cards-title-column') {
      self.config.cards.title = event.target.text
    } else if(columnPos === 'cards-text-column') {
      self.config.cards.text = event.target.text
      debugger;

      window.storyline = new Storyline('Storyline', self.config);
    }
    //plz delete, it should just add an active class and css will reorder//
    selectedElem.innerText = event.target.text
  },

  bindEvents: function(elem) {
    var self = this;
    var elem = document.querySelectorAll(elem)
    var handler = elem[0].getAttribute('handler');
    handler = Object.keys(self.__proto__).indexOf(handler) > -1 ? self.__proto__[handler] : ''
    elem.forEach(function(el) {
      el.onclick = function(){
        handler(self)
      }
    })
  },

  /**
   * appends template to the DOM
   *
   * @param {String} selector name of a dom node
   * @param {HTMLElement} rendered template
   * @returns {undefined}
   */
  appendTemplate: function(selector, template) {
    document.querySelector(selector).appendChild(template)
    return;
  }
}

module.exports = {
  GUI: GUI
}
