'use strict';

const TextXform = require('./text-xform');
const RichTextXform = require('./rich-text-xform');
const PhoneticTextXform = require('./phonetic-text-xform');

const utils = require('../../../utils/utils');
const BaseXform = require('../base-xform');

// <si>
//   <r></r><r></r>...
// </si>
// <si>
//   <t></t>
// </si>

const SharedStringXform = (module.exports = function(model) {
  this.model = model;

  this.map = {
    r: new RichTextXform(),
    t: new TextXform(),
    rPh: new PhoneticTextXform(),
  };
});

utils.inherits(SharedStringXform, BaseXform, {
  get tag() {
    return 'si';
  },

  render(xmlStream, model) {
    xmlStream.openNode(this.tag);
    if (model && model.hasOwnProperty('richText') && model.richText) {
      const { r } = this.map;
      model.richText.forEach(text => {
        r.render(xmlStream, text);
      });
    } else if (model !== undefined && model !== null) {
      this.map.t.render(xmlStream, model);
    }
    xmlStream.closeNode();
  },

  parseOpen(node) {
    const { name } = node;
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }
    if (name === this.tag) {
      this.model = {};
      return true;
    }
    this.parser = this.map[name];
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }
    return false;
  },
  parseText(text) {
    if (this.parser) {
      this.parser.parseText(text);
    }
  },
  parseClose(name) {
    if (this.parser) {
      if (!this.parser.parseClose(name)) {
        switch (name) {
          case 'r': {
            let rt = this.model.richText;
            if (!rt) {
              rt = this.model.richText = [];
            }
            rt.push(this.parser.model);
            break;
          }
          case 't':
            this.model = this.parser.model;
            break;
          default:
            break;
        }
        this.parser = undefined;
      }
      return true;
    }
    switch (name) {
      case this.tag:
        return false;
      default:
        return true;
    }
  },
});
