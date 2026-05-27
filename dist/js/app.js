var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/mithril/render/vnode.js
var require_vnode = __commonJS({
  "node_modules/mithril/render/vnode.js"(exports, module) {
    "use strict";
    function Vnode(tag, key, attrs, children, text, dom) {
      return { tag, key, attrs, children, text, dom, is: void 0, domSize: void 0, state: void 0, events: void 0, instance: void 0 };
    }
    Vnode.normalize = function(node) {
      if (Array.isArray(node)) return Vnode("[", void 0, void 0, Vnode.normalizeChildren(node), void 0, void 0);
      if (node == null || typeof node === "boolean") return null;
      if (typeof node === "object") return node;
      return Vnode("#", void 0, void 0, String(node), void 0, void 0);
    };
    Vnode.normalizeChildren = function(input) {
      var children = new Array(input.length);
      var numKeyed = 0;
      for (var i = 0; i < input.length; i++) {
        children[i] = Vnode.normalize(input[i]);
        if (children[i] !== null && children[i].key != null) numKeyed++;
      }
      if (numKeyed !== 0 && numKeyed !== input.length) {
        throw new TypeError(
          children.includes(null) ? "In fragments, vnodes must either all have keys or none have keys. You may wish to consider using an explicit keyed empty fragment, m.fragment({key: ...}), instead of a hole." : "In fragments, vnodes must either all have keys or none have keys."
        );
      }
      return children;
    };
    module.exports = Vnode;
  }
});

// node_modules/mithril/render/hyperscriptVnode.js
var require_hyperscriptVnode = __commonJS({
  "node_modules/mithril/render/hyperscriptVnode.js"(exports, module) {
    "use strict";
    var Vnode = require_vnode();
    module.exports = function(attrs, children) {
      if (attrs == null || typeof attrs === "object" && attrs.tag == null && !Array.isArray(attrs)) {
        if (children.length === 1 && Array.isArray(children[0])) children = children[0];
      } else {
        children = children.length === 0 && Array.isArray(attrs) ? attrs : [attrs, ...children];
        attrs = void 0;
      }
      return Vnode("", attrs && attrs.key, attrs, children);
    };
  }
});

// node_modules/mithril/util/hasOwn.js
var require_hasOwn = __commonJS({
  "node_modules/mithril/util/hasOwn.js"(exports, module) {
    "use strict";
    module.exports = {}.hasOwnProperty;
  }
});

// node_modules/mithril/render/emptyAttrs.js
var require_emptyAttrs = __commonJS({
  "node_modules/mithril/render/emptyAttrs.js"(exports, module) {
    "use strict";
    module.exports = {};
  }
});

// node_modules/mithril/render/cachedAttrsIsStaticMap.js
var require_cachedAttrsIsStaticMap = __commonJS({
  "node_modules/mithril/render/cachedAttrsIsStaticMap.js"(exports, module) {
    "use strict";
    var emptyAttrs = require_emptyAttrs();
    module.exports = /* @__PURE__ */ new Map([[emptyAttrs, true]]);
  }
});

// node_modules/mithril/render/hyperscript.js
var require_hyperscript = __commonJS({
  "node_modules/mithril/render/hyperscript.js"(exports, module) {
    "use strict";
    var Vnode = require_vnode();
    var hyperscriptVnode = require_hyperscriptVnode();
    var hasOwn = require_hasOwn();
    var emptyAttrs = require_emptyAttrs();
    var cachedAttrsIsStaticMap = require_cachedAttrsIsStaticMap();
    var selectorParser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[(.+?)(?:\s*=\s*("|'|)((?:\\["'\]]|.)*?)\5)?\])/g;
    var selectorCache = /* @__PURE__ */ Object.create(null);
    function isEmpty(object) {
      for (var key in object) if (hasOwn.call(object, key)) return false;
      return true;
    }
    function isFormAttributeKey(key) {
      return key === "value" || key === "checked" || key === "selectedIndex" || key === "selected";
    }
    function compileSelector(selector) {
      var match, tag = "div", classes = [], attrs = {}, isStatic = true;
      while (match = selectorParser.exec(selector)) {
        var type = match[1], value = match[2];
        if (type === "" && value !== "") tag = value;
        else if (type === "#") attrs.id = value;
        else if (type === ".") classes.push(value);
        else if (match[3][0] === "[") {
          var attrValue = match[6];
          if (attrValue) attrValue = attrValue.replace(/\\(["'])/g, "$1").replace(/\\\\/g, "\\");
          if (match[4] === "class") classes.push(attrValue);
          else {
            attrs[match[4]] = attrValue === "" ? attrValue : attrValue || true;
            if (isFormAttributeKey(match[4])) isStatic = false;
          }
        }
      }
      if (classes.length > 0) attrs.className = classes.join(" ");
      if (isEmpty(attrs)) attrs = emptyAttrs;
      else cachedAttrsIsStaticMap.set(attrs, isStatic);
      return selectorCache[selector] = { tag, attrs, is: attrs.is };
    }
    function execSelector(state, vnode) {
      vnode.tag = state.tag;
      var attrs = vnode.attrs;
      if (attrs == null) {
        vnode.attrs = state.attrs;
        vnode.is = state.is;
        return vnode;
      }
      if (hasOwn.call(attrs, "class")) {
        if (attrs.class != null) attrs.className = attrs.class;
        attrs.class = null;
      }
      if (state.attrs !== emptyAttrs) {
        var className = attrs.className;
        attrs = Object.assign({}, state.attrs, attrs);
        if (state.attrs.className != null) attrs.className = className != null ? String(state.attrs.className) + " " + String(className) : state.attrs.className;
      }
      if (state.tag === "input" && hasOwn.call(attrs, "type")) {
        attrs = Object.assign({ type: attrs.type }, attrs);
      }
      vnode.is = attrs.is;
      vnode.attrs = attrs;
      return vnode;
    }
    function hyperscript(selector, attrs, ...children) {
      if (selector == null || typeof selector !== "string" && typeof selector !== "function" && typeof selector.view !== "function") {
        throw Error("The selector must be either a string or a component.");
      }
      var vnode = hyperscriptVnode(attrs, children);
      if (typeof selector === "string") {
        vnode.children = Vnode.normalizeChildren(vnode.children);
        if (selector !== "[") return execSelector(selectorCache[selector] || compileSelector(selector), vnode);
      }
      if (vnode.attrs == null) vnode.attrs = {};
      vnode.tag = selector;
      return vnode;
    }
    module.exports = hyperscript;
  }
});

// node_modules/mithril/render/trust.js
var require_trust = __commonJS({
  "node_modules/mithril/render/trust.js"(exports, module) {
    "use strict";
    var Vnode = require_vnode();
    module.exports = function(html) {
      if (html == null) html = "";
      return Vnode("<", void 0, void 0, html, void 0, void 0);
    };
  }
});

// node_modules/mithril/render/fragment.js
var require_fragment = __commonJS({
  "node_modules/mithril/render/fragment.js"(exports, module) {
    "use strict";
    var Vnode = require_vnode();
    var hyperscriptVnode = require_hyperscriptVnode();
    module.exports = function(attrs, ...children) {
      var vnode = hyperscriptVnode(attrs, children);
      if (vnode.attrs == null) vnode.attrs = {};
      vnode.tag = "[";
      vnode.children = Vnode.normalizeChildren(vnode.children);
      return vnode;
    };
  }
});

// node_modules/mithril/hyperscript.js
var require_hyperscript2 = __commonJS({
  "node_modules/mithril/hyperscript.js"(exports, module) {
    "use strict";
    var hyperscript = require_hyperscript();
    hyperscript.trust = require_trust();
    hyperscript.fragment = require_fragment();
    module.exports = hyperscript;
  }
});

// node_modules/mithril/render/delayedRemoval.js
var require_delayedRemoval = __commonJS({
  "node_modules/mithril/render/delayedRemoval.js"(exports, module) {
    "use strict";
    module.exports = /* @__PURE__ */ new WeakMap();
  }
});

// node_modules/mithril/render/domFor.js
var require_domFor = __commonJS({
  "node_modules/mithril/render/domFor.js"(exports, module) {
    "use strict";
    var delayedRemoval = require_delayedRemoval();
    function* domFor(vnode) {
      var dom = vnode.dom;
      var domSize = vnode.domSize;
      var generation = delayedRemoval.get(dom);
      if (dom != null) do {
        var nextSibling = dom.nextSibling;
        if (delayedRemoval.get(dom) === generation) {
          yield dom;
          domSize--;
        }
        dom = nextSibling;
      } while (domSize);
    }
    module.exports = domFor;
  }
});

// node_modules/mithril/render/render.js
var require_render = __commonJS({
  "node_modules/mithril/render/render.js"(exports, module) {
    "use strict";
    var Vnode = require_vnode();
    var delayedRemoval = require_delayedRemoval();
    var domFor = require_domFor();
    var cachedAttrsIsStaticMap = require_cachedAttrsIsStaticMap();
    module.exports = function() {
      var nameSpace = {
        svg: "http://www.w3.org/2000/svg",
        math: "http://www.w3.org/1998/Math/MathML"
      };
      var currentRedraw;
      var currentRender;
      function getDocument(dom) {
        return dom.ownerDocument;
      }
      function getNameSpace(vnode) {
        return vnode.attrs && vnode.attrs.xmlns || nameSpace[vnode.tag];
      }
      function checkState(vnode, original) {
        if (vnode.state !== original) throw new Error("'vnode.state' must not be modified.");
      }
      function callHook(vnode) {
        var original = vnode.state;
        try {
          return this.apply(original, arguments);
        } finally {
          checkState(vnode, original);
        }
      }
      function activeElement(dom) {
        try {
          return getDocument(dom).activeElement;
        } catch (e) {
          return null;
        }
      }
      function createNodes(parent, vnodes, start, end, hooks, nextSibling, ns) {
        for (var i = start; i < end; i++) {
          var vnode = vnodes[i];
          if (vnode != null) {
            createNode(parent, vnode, hooks, ns, nextSibling);
          }
        }
      }
      function createNode(parent, vnode, hooks, ns, nextSibling) {
        var tag = vnode.tag;
        if (typeof tag === "string") {
          vnode.state = {};
          if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks);
          switch (tag) {
            case "#":
              createText(parent, vnode, nextSibling);
              break;
            case "<":
              createHTML(parent, vnode, ns, nextSibling);
              break;
            case "[":
              createFragment(parent, vnode, hooks, ns, nextSibling);
              break;
            default:
              createElement(parent, vnode, hooks, ns, nextSibling);
          }
        } else createComponent(parent, vnode, hooks, ns, nextSibling);
      }
      function createText(parent, vnode, nextSibling) {
        vnode.dom = getDocument(parent).createTextNode(vnode.children);
        insertDOM(parent, vnode.dom, nextSibling);
      }
      var possibleParents = { caption: "table", thead: "table", tbody: "table", tfoot: "table", tr: "tbody", th: "tr", td: "tr", colgroup: "table", col: "colgroup" };
      function createHTML(parent, vnode, ns, nextSibling) {
        var match = vnode.children.match(/^\s*?<(\w+)/im) || [];
        var temp = getDocument(parent).createElement(possibleParents[match[1]] || "div");
        if (ns === "http://www.w3.org/2000/svg") {
          temp.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg">' + vnode.children + "</svg>";
          temp = temp.firstChild;
        } else {
          temp.innerHTML = vnode.children;
        }
        vnode.dom = temp.firstChild;
        vnode.domSize = temp.childNodes.length;
        var fragment = getDocument(parent).createDocumentFragment();
        var child;
        while (child = temp.firstChild) {
          fragment.appendChild(child);
        }
        insertDOM(parent, fragment, nextSibling);
      }
      function createFragment(parent, vnode, hooks, ns, nextSibling) {
        var fragment = getDocument(parent).createDocumentFragment();
        if (vnode.children != null) {
          var children = vnode.children;
          createNodes(fragment, children, 0, children.length, hooks, null, ns);
        }
        vnode.dom = fragment.firstChild;
        vnode.domSize = fragment.childNodes.length;
        insertDOM(parent, fragment, nextSibling);
      }
      function createElement(parent, vnode, hooks, ns, nextSibling) {
        var tag = vnode.tag;
        var attrs = vnode.attrs;
        var is = vnode.is;
        ns = getNameSpace(vnode) || ns;
        var element = ns ? is ? getDocument(parent).createElementNS(ns, tag, { is }) : getDocument(parent).createElementNS(ns, tag) : is ? getDocument(parent).createElement(tag, { is }) : getDocument(parent).createElement(tag);
        vnode.dom = element;
        if (attrs != null) {
          setAttrs(vnode, attrs, ns);
        }
        insertDOM(parent, element, nextSibling);
        if (!maybeSetContentEditable(vnode)) {
          if (vnode.children != null) {
            var children = vnode.children;
            createNodes(element, children, 0, children.length, hooks, null, ns);
            if (vnode.tag === "select" && attrs != null) setLateSelectAttrs(vnode, attrs);
          }
        }
      }
      function initComponent(vnode, hooks) {
        var sentinel;
        if (typeof vnode.tag.view === "function") {
          vnode.state = Object.create(vnode.tag);
          sentinel = vnode.state.view;
          if (sentinel.$$reentrantLock$$ != null) return;
          sentinel.$$reentrantLock$$ = true;
        } else {
          vnode.state = void 0;
          sentinel = vnode.tag;
          if (sentinel.$$reentrantLock$$ != null) return;
          sentinel.$$reentrantLock$$ = true;
          vnode.state = vnode.tag.prototype != null && typeof vnode.tag.prototype.view === "function" ? new vnode.tag(vnode) : vnode.tag(vnode);
        }
        initLifecycle(vnode.state, vnode, hooks);
        if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks);
        vnode.instance = Vnode.normalize(callHook.call(vnode.state.view, vnode));
        if (vnode.instance === vnode) throw Error("A view cannot return the vnode it received as argument");
        sentinel.$$reentrantLock$$ = null;
      }
      function createComponent(parent, vnode, hooks, ns, nextSibling) {
        initComponent(vnode, hooks);
        if (vnode.instance != null) {
          createNode(parent, vnode.instance, hooks, ns, nextSibling);
          vnode.dom = vnode.instance.dom;
          vnode.domSize = vnode.instance.domSize;
        } else {
          vnode.domSize = 0;
        }
      }
      function updateNodes(parent, old, vnodes, hooks, nextSibling, ns) {
        if (old === vnodes || old == null && vnodes == null) return;
        else if (old == null || old.length === 0) createNodes(parent, vnodes, 0, vnodes.length, hooks, nextSibling, ns);
        else if (vnodes == null || vnodes.length === 0) removeNodes(parent, old, 0, old.length);
        else {
          var isOldKeyed = old[0] != null && old[0].key != null;
          var isKeyed = vnodes[0] != null && vnodes[0].key != null;
          var start = 0, oldStart = 0;
          if (!isOldKeyed) while (oldStart < old.length && old[oldStart] == null) oldStart++;
          if (!isKeyed) while (start < vnodes.length && vnodes[start] == null) start++;
          if (isOldKeyed !== isKeyed) {
            removeNodes(parent, old, oldStart, old.length);
            createNodes(parent, vnodes, start, vnodes.length, hooks, nextSibling, ns);
          } else if (!isKeyed) {
            var commonLength = old.length < vnodes.length ? old.length : vnodes.length;
            start = start < oldStart ? start : oldStart;
            for (; start < commonLength; start++) {
              o = old[start];
              v = vnodes[start];
              if (o === v || o == null && v == null) continue;
              else if (o == null) createNode(parent, v, hooks, ns, getNextSibling(old, start + 1, nextSibling));
              else if (v == null) removeNode(parent, o);
              else updateNode(parent, o, v, hooks, getNextSibling(old, start + 1, nextSibling), ns);
            }
            if (old.length > commonLength) removeNodes(parent, old, start, old.length);
            if (vnodes.length > commonLength) createNodes(parent, vnodes, start, vnodes.length, hooks, nextSibling, ns);
          } else {
            var oldEnd = old.length - 1, end = vnodes.length - 1, map, o, v, oe, ve, topSibling;
            while (oldEnd >= oldStart && end >= start) {
              oe = old[oldEnd];
              ve = vnodes[end];
              if (oe.key !== ve.key) break;
              if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns);
              if (ve.dom != null) nextSibling = ve.dom;
              oldEnd--, end--;
            }
            while (oldEnd >= oldStart && end >= start) {
              o = old[oldStart];
              v = vnodes[start];
              if (o.key !== v.key) break;
              oldStart++, start++;
              if (o !== v) updateNode(parent, o, v, hooks, getNextSibling(old, oldStart, nextSibling), ns);
            }
            while (oldEnd >= oldStart && end >= start) {
              if (start === end) break;
              if (o.key !== ve.key || oe.key !== v.key) break;
              topSibling = getNextSibling(old, oldStart, nextSibling);
              moveDOM(parent, oe, topSibling);
              if (oe !== v) updateNode(parent, oe, v, hooks, topSibling, ns);
              if (++start <= --end) moveDOM(parent, o, nextSibling);
              if (o !== ve) updateNode(parent, o, ve, hooks, nextSibling, ns);
              if (ve.dom != null) nextSibling = ve.dom;
              oldStart++;
              oldEnd--;
              oe = old[oldEnd];
              ve = vnodes[end];
              o = old[oldStart];
              v = vnodes[start];
            }
            while (oldEnd >= oldStart && end >= start) {
              if (oe.key !== ve.key) break;
              if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns);
              if (ve.dom != null) nextSibling = ve.dom;
              oldEnd--, end--;
              oe = old[oldEnd];
              ve = vnodes[end];
            }
            if (start > end) removeNodes(parent, old, oldStart, oldEnd + 1);
            else if (oldStart > oldEnd) createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns);
            else {
              var originalNextSibling = nextSibling, vnodesLength = end - start + 1, oldIndices = new Array(vnodesLength), li = 0, i = 0, pos = 2147483647, matched = 0, map, lisIndices;
              for (i = 0; i < vnodesLength; i++) oldIndices[i] = -1;
              for (i = end; i >= start; i--) {
                if (map == null) map = getKeyMap(old, oldStart, oldEnd + 1);
                ve = vnodes[i];
                var oldIndex = map[ve.key];
                if (oldIndex != null) {
                  pos = oldIndex < pos ? oldIndex : -1;
                  oldIndices[i - start] = oldIndex;
                  oe = old[oldIndex];
                  old[oldIndex] = null;
                  if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns);
                  if (ve.dom != null) nextSibling = ve.dom;
                  matched++;
                }
              }
              nextSibling = originalNextSibling;
              if (matched !== oldEnd - oldStart + 1) removeNodes(parent, old, oldStart, oldEnd + 1);
              if (matched === 0) createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns);
              else {
                if (pos === -1) {
                  lisIndices = makeLisIndices(oldIndices);
                  li = lisIndices.length - 1;
                  for (i = end; i >= start; i--) {
                    v = vnodes[i];
                    if (oldIndices[i - start] === -1) createNode(parent, v, hooks, ns, nextSibling);
                    else {
                      if (lisIndices[li] === i - start) li--;
                      else moveDOM(parent, v, nextSibling);
                    }
                    if (v.dom != null) nextSibling = vnodes[i].dom;
                  }
                } else {
                  for (i = end; i >= start; i--) {
                    v = vnodes[i];
                    if (oldIndices[i - start] === -1) createNode(parent, v, hooks, ns, nextSibling);
                    if (v.dom != null) nextSibling = vnodes[i].dom;
                  }
                }
              }
            }
          }
        }
      }
      function updateNode(parent, old, vnode, hooks, nextSibling, ns) {
        var oldTag = old.tag, tag = vnode.tag;
        if (oldTag === tag && old.is === vnode.is) {
          vnode.state = old.state;
          vnode.events = old.events;
          if (shouldNotUpdate(vnode, old)) return;
          if (typeof oldTag === "string") {
            if (vnode.attrs != null) {
              updateLifecycle(vnode.attrs, vnode, hooks);
            }
            switch (oldTag) {
              case "#":
                updateText(old, vnode);
                break;
              case "<":
                updateHTML(parent, old, vnode, ns, nextSibling);
                break;
              case "[":
                updateFragment(parent, old, vnode, hooks, nextSibling, ns);
                break;
              default:
                updateElement(old, vnode, hooks, ns);
            }
          } else updateComponent(parent, old, vnode, hooks, nextSibling, ns);
        } else {
          removeNode(parent, old);
          createNode(parent, vnode, hooks, ns, nextSibling);
        }
      }
      function updateText(old, vnode) {
        if (old.children.toString() !== vnode.children.toString()) {
          old.dom.nodeValue = vnode.children;
        }
        vnode.dom = old.dom;
      }
      function updateHTML(parent, old, vnode, ns, nextSibling) {
        if (old.children !== vnode.children) {
          removeDOM(parent, old);
          createHTML(parent, vnode, ns, nextSibling);
        } else {
          vnode.dom = old.dom;
          vnode.domSize = old.domSize;
        }
      }
      function updateFragment(parent, old, vnode, hooks, nextSibling, ns) {
        updateNodes(parent, old.children, vnode.children, hooks, nextSibling, ns);
        var domSize = 0, children = vnode.children;
        vnode.dom = null;
        if (children != null) {
          for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if (child != null && child.dom != null) {
              if (vnode.dom == null) vnode.dom = child.dom;
              domSize += child.domSize || 1;
            }
          }
        }
        vnode.domSize = domSize;
      }
      function updateElement(old, vnode, hooks, ns) {
        var element = vnode.dom = old.dom;
        ns = getNameSpace(vnode) || ns;
        if (old.attrs != vnode.attrs || vnode.attrs != null && !cachedAttrsIsStaticMap.get(vnode.attrs)) {
          updateAttrs(vnode, old.attrs, vnode.attrs, ns);
        }
        if (!maybeSetContentEditable(vnode)) {
          updateNodes(element, old.children, vnode.children, hooks, null, ns);
        }
      }
      function updateComponent(parent, old, vnode, hooks, nextSibling, ns) {
        vnode.instance = Vnode.normalize(callHook.call(vnode.state.view, vnode));
        if (vnode.instance === vnode) throw Error("A view cannot return the vnode it received as argument");
        updateLifecycle(vnode.state, vnode, hooks);
        if (vnode.attrs != null) updateLifecycle(vnode.attrs, vnode, hooks);
        if (vnode.instance != null) {
          if (old.instance == null) createNode(parent, vnode.instance, hooks, ns, nextSibling);
          else updateNode(parent, old.instance, vnode.instance, hooks, nextSibling, ns);
          vnode.dom = vnode.instance.dom;
          vnode.domSize = vnode.instance.domSize;
        } else {
          if (old.instance != null) removeNode(parent, old.instance);
          vnode.domSize = 0;
        }
      }
      function getKeyMap(vnodes, start, end) {
        var map = /* @__PURE__ */ Object.create(null);
        for (; start < end; start++) {
          var vnode = vnodes[start];
          if (vnode != null) {
            var key = vnode.key;
            if (key != null) map[key] = start;
          }
        }
        return map;
      }
      var lisTemp = [];
      function makeLisIndices(a) {
        var result = [0];
        var u = 0, v = 0, i = 0;
        var il = lisTemp.length = a.length;
        for (var i = 0; i < il; i++) lisTemp[i] = a[i];
        for (var i = 0; i < il; ++i) {
          if (a[i] === -1) continue;
          var j = result[result.length - 1];
          if (a[j] < a[i]) {
            lisTemp[i] = j;
            result.push(i);
            continue;
          }
          u = 0;
          v = result.length - 1;
          while (u < v) {
            var c = (u >>> 1) + (v >>> 1) + (u & v & 1);
            if (a[result[c]] < a[i]) {
              u = c + 1;
            } else {
              v = c;
            }
          }
          if (a[i] < a[result[u]]) {
            if (u > 0) lisTemp[i] = result[u - 1];
            result[u] = i;
          }
        }
        u = result.length;
        v = result[u - 1];
        while (u-- > 0) {
          result[u] = v;
          v = lisTemp[v];
        }
        lisTemp.length = 0;
        return result;
      }
      function getNextSibling(vnodes, i, nextSibling) {
        for (; i < vnodes.length; i++) {
          if (vnodes[i] != null && vnodes[i].dom != null) return vnodes[i].dom;
        }
        return nextSibling;
      }
      function moveDOM(parent, vnode, nextSibling) {
        if (vnode.dom != null) {
          var target;
          if (vnode.domSize == null || vnode.domSize === 1) {
            target = vnode.dom;
          } else {
            target = getDocument(parent).createDocumentFragment();
            for (var dom of domFor(vnode)) target.appendChild(dom);
          }
          insertDOM(parent, target, nextSibling);
        }
      }
      function insertDOM(parent, dom, nextSibling) {
        if (nextSibling != null) parent.insertBefore(dom, nextSibling);
        else parent.appendChild(dom);
      }
      function maybeSetContentEditable(vnode) {
        if (vnode.attrs == null || vnode.attrs.contenteditable == null && // attribute
        vnode.attrs.contentEditable == null) return false;
        var children = vnode.children;
        if (children != null && children.length === 1 && children[0].tag === "<") {
          var content = children[0].children;
          if (vnode.dom.innerHTML !== content) vnode.dom.innerHTML = content;
        } else if (children != null && children.length !== 0) throw new Error("Child node of a contenteditable must be trusted.");
        return true;
      }
      function removeNodes(parent, vnodes, start, end) {
        for (var i = start; i < end; i++) {
          var vnode = vnodes[i];
          if (vnode != null) removeNode(parent, vnode);
        }
      }
      function tryBlockRemove(parent, vnode, source, counter) {
        var original = vnode.state;
        var result = callHook.call(source.onbeforeremove, vnode);
        if (result == null) return;
        var generation = currentRender;
        for (var dom of domFor(vnode)) delayedRemoval.set(dom, generation);
        counter.v++;
        Promise.resolve(result).finally(function() {
          checkState(vnode, original);
          tryResumeRemove(parent, vnode, counter);
        });
      }
      function tryResumeRemove(parent, vnode, counter) {
        if (--counter.v === 0) {
          onremove(vnode);
          removeDOM(parent, vnode);
        }
      }
      function removeNode(parent, vnode) {
        var counter = { v: 1 };
        if (typeof vnode.tag !== "string" && typeof vnode.state.onbeforeremove === "function") tryBlockRemove(parent, vnode, vnode.state, counter);
        if (vnode.attrs && typeof vnode.attrs.onbeforeremove === "function") tryBlockRemove(parent, vnode, vnode.attrs, counter);
        tryResumeRemove(parent, vnode, counter);
      }
      function removeDOM(parent, vnode) {
        if (vnode.dom == null) return;
        if (vnode.domSize == null || vnode.domSize === 1) {
          parent.removeChild(vnode.dom);
        } else {
          for (var dom of domFor(vnode)) parent.removeChild(dom);
        }
      }
      function onremove(vnode) {
        if (typeof vnode.tag !== "string" && typeof vnode.state.onremove === "function") callHook.call(vnode.state.onremove, vnode);
        if (vnode.attrs && typeof vnode.attrs.onremove === "function") callHook.call(vnode.attrs.onremove, vnode);
        if (typeof vnode.tag !== "string") {
          if (vnode.instance != null) onremove(vnode.instance);
        } else {
          if (vnode.events != null) vnode.events._ = null;
          var children = vnode.children;
          if (Array.isArray(children)) {
            for (var i = 0; i < children.length; i++) {
              var child = children[i];
              if (child != null) onremove(child);
            }
          }
        }
      }
      function setAttrs(vnode, attrs, ns) {
        for (var key in attrs) {
          setAttr(vnode, key, null, attrs[key], ns);
        }
      }
      function setAttr(vnode, key, old, value, ns) {
        if (key === "key" || value == null || isLifecycleMethod(key) || old === value && !isFormAttribute(vnode, key) && typeof value !== "object") return;
        if (key[0] === "o" && key[1] === "n") return updateEvent(vnode, key, value);
        if (key.slice(0, 6) === "xlink:") vnode.dom.setAttributeNS("http://www.w3.org/1999/xlink", key.slice(6), value);
        else if (key === "style") updateStyle(vnode.dom, old, value);
        else if (hasPropertyKey(vnode, key, ns)) {
          if (key === "value") {
            if ((vnode.tag === "input" || vnode.tag === "textarea") && vnode.dom.value === "" + value) return;
            if (vnode.tag === "select" && old !== null && vnode.dom.value === "" + value) return;
            if (vnode.tag === "option" && old !== null && vnode.dom.value === "" + value) return;
            if (vnode.tag === "input" && vnode.attrs.type === "file" && "" + value !== "") {
              console.error("`value` is read-only on file inputs!");
              return;
            }
          }
          if (vnode.tag === "input" && key === "type") vnode.dom.setAttribute(key, value);
          else vnode.dom[key] = value;
        } else {
          if (typeof value === "boolean") {
            if (value) vnode.dom.setAttribute(key, "");
            else vnode.dom.removeAttribute(key);
          } else vnode.dom.setAttribute(key === "className" ? "class" : key, value);
        }
      }
      function removeAttr(vnode, key, old, ns) {
        if (key === "key" || old == null || isLifecycleMethod(key)) return;
        if (key[0] === "o" && key[1] === "n") updateEvent(vnode, key, void 0);
        else if (key === "style") updateStyle(vnode.dom, old, null);
        else if (hasPropertyKey(vnode, key, ns) && key !== "className" && key !== "title" && !(key === "value" && (vnode.tag === "option" || vnode.tag === "select" && vnode.dom.selectedIndex === -1 && vnode.dom === activeElement(vnode.dom))) && !(vnode.tag === "input" && key === "type")) {
          vnode.dom[key] = null;
        } else {
          var nsLastIndex = key.indexOf(":");
          if (nsLastIndex !== -1) key = key.slice(nsLastIndex + 1);
          if (old !== false) vnode.dom.removeAttribute(key === "className" ? "class" : key);
        }
      }
      function setLateSelectAttrs(vnode, attrs) {
        if ("value" in attrs) {
          if (attrs.value === null) {
            if (vnode.dom.selectedIndex !== -1) vnode.dom.value = null;
          } else {
            var normalized = "" + attrs.value;
            if (vnode.dom.value !== normalized || vnode.dom.selectedIndex === -1) {
              vnode.dom.value = normalized;
            }
          }
        }
        if ("selectedIndex" in attrs) setAttr(vnode, "selectedIndex", null, attrs.selectedIndex, void 0);
      }
      function updateAttrs(vnode, old, attrs, ns) {
        var val;
        if (old != null) {
          if (old === attrs && !cachedAttrsIsStaticMap.has(attrs)) {
            console.warn("Don't reuse attrs object, use new object for every redraw, this will throw in next major");
          }
          for (var key in old) {
            if ((val = old[key]) != null && (attrs == null || attrs[key] == null)) {
              removeAttr(vnode, key, val, ns);
            }
          }
        }
        if (attrs != null) {
          for (var key in attrs) {
            setAttr(vnode, key, old && old[key], attrs[key], ns);
          }
        }
      }
      function isFormAttribute(vnode, attr) {
        return attr === "value" || attr === "checked" || attr === "selectedIndex" || attr === "selected" && (vnode.dom === activeElement(vnode.dom) || vnode.tag === "option" && vnode.dom.parentNode === activeElement(vnode.dom));
      }
      function isLifecycleMethod(attr) {
        return attr === "oninit" || attr === "oncreate" || attr === "onupdate" || attr === "onremove" || attr === "onbeforeremove" || attr === "onbeforeupdate";
      }
      function hasPropertyKey(vnode, key, ns) {
        return ns === void 0 && // If it's a custom element, just keep it.
        (vnode.tag.indexOf("-") > -1 || vnode.is || // If it's a normal element, let's try to avoid a few browser bugs.
        key !== "href" && key !== "list" && key !== "form" && key !== "width" && key !== "height") && key in vnode.dom;
      }
      function updateStyle(element, old, style) {
        if (old === style) {
        } else if (style == null) {
          element.style = "";
        } else if (typeof style !== "object") {
          element.style = style;
        } else if (old == null || typeof old !== "object") {
          element.style = "";
          for (var key in style) {
            var value = style[key];
            if (value != null) {
              if (key.includes("-")) element.style.setProperty(key, String(value));
              else element.style[key] = String(value);
            }
          }
        } else {
          for (var key in old) {
            if (old[key] != null && style[key] == null) {
              if (key.includes("-")) element.style.removeProperty(key);
              else element.style[key] = "";
            }
          }
          for (var key in style) {
            var value = style[key];
            if (value != null && (value = String(value)) !== String(old[key])) {
              if (key.includes("-")) element.style.setProperty(key, value);
              else element.style[key] = value;
            }
          }
        }
      }
      function EventDict() {
        this._ = currentRedraw;
      }
      EventDict.prototype = /* @__PURE__ */ Object.create(null);
      EventDict.prototype.handleEvent = function(ev) {
        var handler = this["on" + ev.type];
        var result;
        if (typeof handler === "function") result = handler.call(ev.currentTarget, ev);
        else if (typeof handler.handleEvent === "function") handler.handleEvent(ev);
        var self2 = this;
        if (self2._ != null) {
          if (ev.redraw !== false) (0, self2._)();
          if (result != null && typeof result.then === "function") {
            Promise.resolve(result).then(function() {
              if (self2._ != null && ev.redraw !== false) (0, self2._)();
            });
          }
        }
        if (result === false) {
          ev.preventDefault();
          ev.stopPropagation();
        }
      };
      function updateEvent(vnode, key, value) {
        if (vnode.events != null) {
          vnode.events._ = currentRedraw;
          if (vnode.events[key] === value) return;
          if (value != null && (typeof value === "function" || typeof value === "object")) {
            if (vnode.events[key] == null) vnode.dom.addEventListener(key.slice(2), vnode.events, false);
            vnode.events[key] = value;
          } else {
            if (vnode.events[key] != null) vnode.dom.removeEventListener(key.slice(2), vnode.events, false);
            vnode.events[key] = void 0;
          }
        } else if (value != null && (typeof value === "function" || typeof value === "object")) {
          vnode.events = new EventDict();
          vnode.dom.addEventListener(key.slice(2), vnode.events, false);
          vnode.events[key] = value;
        }
      }
      function initLifecycle(source, vnode, hooks) {
        if (typeof source.oninit === "function") callHook.call(source.oninit, vnode);
        if (typeof source.oncreate === "function") hooks.push(callHook.bind(source.oncreate, vnode));
      }
      function updateLifecycle(source, vnode, hooks) {
        if (typeof source.onupdate === "function") hooks.push(callHook.bind(source.onupdate, vnode));
      }
      function shouldNotUpdate(vnode, old) {
        do {
          if (vnode.attrs != null && typeof vnode.attrs.onbeforeupdate === "function") {
            var force = callHook.call(vnode.attrs.onbeforeupdate, vnode, old);
            if (force !== void 0 && !force) break;
          }
          if (typeof vnode.tag !== "string" && typeof vnode.state.onbeforeupdate === "function") {
            var force = callHook.call(vnode.state.onbeforeupdate, vnode, old);
            if (force !== void 0 && !force) break;
          }
          return false;
        } while (false);
        vnode.dom = old.dom;
        vnode.domSize = old.domSize;
        vnode.instance = old.instance;
        vnode.attrs = old.attrs;
        vnode.children = old.children;
        vnode.text = old.text;
        return true;
      }
      var currentDOM;
      return function(dom, vnodes, redraw) {
        if (!dom) throw new TypeError("DOM element being rendered to does not exist.");
        if (currentDOM != null && dom.contains(currentDOM)) {
          throw new TypeError("Node is currently being rendered to and thus is locked.");
        }
        var prevRedraw = currentRedraw;
        var prevDOM = currentDOM;
        var hooks = [];
        var active = activeElement(dom);
        var namespace = dom.namespaceURI;
        currentDOM = dom;
        currentRedraw = typeof redraw === "function" ? redraw : void 0;
        currentRender = {};
        try {
          if (dom.vnodes == null) dom.textContent = "";
          vnodes = Vnode.normalizeChildren(Array.isArray(vnodes) ? vnodes : [vnodes]);
          updateNodes(dom, dom.vnodes, vnodes, hooks, null, namespace === "http://www.w3.org/1999/xhtml" ? void 0 : namespace);
          dom.vnodes = vnodes;
          if (active != null && activeElement(dom) !== active && typeof active.focus === "function") active.focus();
          for (var i = 0; i < hooks.length; i++) hooks[i]();
        } finally {
          currentRedraw = prevRedraw;
          currentDOM = prevDOM;
        }
      };
    };
  }
});

// node_modules/mithril/render.js
var require_render2 = __commonJS({
  "node_modules/mithril/render.js"(exports, module) {
    "use strict";
    module.exports = require_render()();
  }
});

// node_modules/mithril/api/mount-redraw.js
var require_mount_redraw = __commonJS({
  "node_modules/mithril/api/mount-redraw.js"(exports, module) {
    "use strict";
    var Vnode = require_vnode();
    module.exports = function(render, schedule, console2) {
      var subscriptions = [];
      var pending = false;
      var offset = -1;
      function sync() {
        for (offset = 0; offset < subscriptions.length; offset += 2) {
          try {
            render(subscriptions[offset], Vnode(subscriptions[offset + 1]), redraw);
          } catch (e) {
            console2.error(e);
          }
        }
        offset = -1;
      }
      function redraw() {
        if (!pending) {
          pending = true;
          schedule(function() {
            pending = false;
            sync();
          });
        }
      }
      redraw.sync = sync;
      function mount(root, component) {
        if (component != null && component.view == null && typeof component !== "function") {
          throw new TypeError("m.mount expects a component, not a vnode.");
        }
        var index = subscriptions.indexOf(root);
        if (index >= 0) {
          subscriptions.splice(index, 2);
          if (index <= offset) offset -= 2;
          render(root, []);
        }
        if (component != null) {
          subscriptions.push(root, component);
          render(root, Vnode(component), redraw);
        }
      }
      return { mount, redraw };
    };
  }
});

// node_modules/mithril/mount-redraw.js
var require_mount_redraw2 = __commonJS({
  "node_modules/mithril/mount-redraw.js"(exports, module) {
    "use strict";
    var render = require_render2();
    module.exports = require_mount_redraw()(render, typeof requestAnimationFrame !== "undefined" ? requestAnimationFrame : null, typeof console !== "undefined" ? console : null);
  }
});

// node_modules/mithril/querystring/build.js
var require_build = __commonJS({
  "node_modules/mithril/querystring/build.js"(exports, module) {
    "use strict";
    module.exports = function(object) {
      if (Object.prototype.toString.call(object) !== "[object Object]") return "";
      var args = [];
      for (var key in object) {
        destructure(key, object[key]);
      }
      return args.join("&");
      function destructure(key2, value) {
        if (Array.isArray(value)) {
          for (var i = 0; i < value.length; i++) {
            destructure(key2 + "[" + i + "]", value[i]);
          }
        } else if (Object.prototype.toString.call(value) === "[object Object]") {
          for (var i in value) {
            destructure(key2 + "[" + i + "]", value[i]);
          }
        } else args.push(encodeURIComponent(key2) + (value != null && value !== "" ? "=" + encodeURIComponent(value) : ""));
      }
    };
  }
});

// node_modules/mithril/pathname/build.js
var require_build2 = __commonJS({
  "node_modules/mithril/pathname/build.js"(exports, module) {
    "use strict";
    var buildQueryString = require_build();
    module.exports = function(template, params) {
      if (/:([^\/\.-]+)(\.{3})?:/.test(template)) {
        throw new SyntaxError("Template parameter names must be separated by either a '/', '-', or '.'.");
      }
      if (params == null) return template;
      var queryIndex = template.indexOf("?");
      var hashIndex = template.indexOf("#");
      var queryEnd = hashIndex < 0 ? template.length : hashIndex;
      var pathEnd = queryIndex < 0 ? queryEnd : queryIndex;
      var path = template.slice(0, pathEnd);
      var query = {};
      Object.assign(query, params);
      var resolved = path.replace(/:([^\/\.-]+)(\.{3})?/g, function(m14, key, variadic) {
        delete query[key];
        if (params[key] == null) return m14;
        return variadic ? params[key] : encodeURIComponent(String(params[key]));
      });
      var newQueryIndex = resolved.indexOf("?");
      var newHashIndex = resolved.indexOf("#");
      var newQueryEnd = newHashIndex < 0 ? resolved.length : newHashIndex;
      var newPathEnd = newQueryIndex < 0 ? newQueryEnd : newQueryIndex;
      var result = resolved.slice(0, newPathEnd);
      if (queryIndex >= 0) result += template.slice(queryIndex, queryEnd);
      if (newQueryIndex >= 0) result += (queryIndex < 0 ? "?" : "&") + resolved.slice(newQueryIndex, newQueryEnd);
      var querystring = buildQueryString(query);
      if (querystring) result += (queryIndex < 0 && newQueryIndex < 0 ? "?" : "&") + querystring;
      if (hashIndex >= 0) result += template.slice(hashIndex);
      if (newHashIndex >= 0) result += (hashIndex < 0 ? "" : "&") + resolved.slice(newHashIndex);
      return result;
    };
  }
});

// node_modules/mithril/request/request.js
var require_request = __commonJS({
  "node_modules/mithril/request/request.js"(exports, module) {
    "use strict";
    var buildPathname = require_build2();
    var hasOwn = require_hasOwn();
    module.exports = function($window, oncompletion) {
      function PromiseProxy(executor) {
        return new Promise(executor);
      }
      function makeRequest(url, args) {
        return new Promise(function(resolve, reject) {
          url = buildPathname(url, args.params);
          var method = args.method != null ? args.method.toUpperCase() : "GET";
          var body = args.body;
          var assumeJSON = (args.serialize == null || args.serialize === JSON.serialize) && !(body instanceof $window.FormData || body instanceof $window.URLSearchParams);
          var responseType = args.responseType || (typeof args.extract === "function" ? "" : "json");
          var xhr = new $window.XMLHttpRequest(), aborted = false, isTimeout = false;
          var original = xhr, replacedAbort;
          var abort = xhr.abort;
          xhr.abort = function() {
            aborted = true;
            abort.call(this);
          };
          xhr.open(method, url, args.async !== false, typeof args.user === "string" ? args.user : void 0, typeof args.password === "string" ? args.password : void 0);
          if (assumeJSON && body != null && !hasHeader(args, "content-type")) {
            xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
          }
          if (typeof args.deserialize !== "function" && !hasHeader(args, "accept")) {
            xhr.setRequestHeader("Accept", "application/json, text/*");
          }
          if (args.withCredentials) xhr.withCredentials = args.withCredentials;
          if (args.timeout) xhr.timeout = args.timeout;
          xhr.responseType = responseType;
          for (var key in args.headers) {
            if (hasOwn.call(args.headers, key)) {
              xhr.setRequestHeader(key, args.headers[key]);
            }
          }
          xhr.onreadystatechange = function(ev) {
            if (aborted) return;
            if (ev.target.readyState === 4) {
              try {
                var success = ev.target.status >= 200 && ev.target.status < 300 || ev.target.status === 304 || /^file:\/\//i.test(url);
                var response = ev.target.response, message;
                if (responseType === "json") {
                  if (!ev.target.responseType && typeof args.extract !== "function") {
                    try {
                      response = JSON.parse(ev.target.responseText);
                    } catch (e) {
                      response = null;
                    }
                  }
                } else if (!responseType || responseType === "text") {
                  if (response == null) response = ev.target.responseText;
                }
                if (typeof args.extract === "function") {
                  response = args.extract(ev.target, args);
                  success = true;
                } else if (typeof args.deserialize === "function") {
                  response = args.deserialize(response);
                }
                if (success) {
                  if (typeof args.type === "function") {
                    if (Array.isArray(response)) {
                      for (var i = 0; i < response.length; i++) {
                        response[i] = new args.type(response[i]);
                      }
                    } else response = new args.type(response);
                  }
                  resolve(response);
                } else {
                  var completeErrorResponse = function() {
                    try {
                      message = ev.target.responseText;
                    } catch (e) {
                      message = response;
                    }
                    var error = new Error(message);
                    error.code = ev.target.status;
                    error.response = response;
                    reject(error);
                  };
                  if (xhr.status === 0) {
                    setTimeout(function() {
                      if (isTimeout) return;
                      completeErrorResponse();
                    });
                  } else completeErrorResponse();
                }
              } catch (e) {
                reject(e);
              }
            }
          };
          xhr.ontimeout = function(ev) {
            isTimeout = true;
            var error = new Error("Request timed out");
            error.code = ev.target.status;
            reject(error);
          };
          if (typeof args.config === "function") {
            xhr = args.config(xhr, args, url) || xhr;
            if (xhr !== original) {
              replacedAbort = xhr.abort;
              xhr.abort = function() {
                aborted = true;
                replacedAbort.call(this);
              };
            }
          }
          if (body == null) xhr.send();
          else if (typeof args.serialize === "function") xhr.send(args.serialize(body));
          else if (body instanceof $window.FormData || body instanceof $window.URLSearchParams) xhr.send(body);
          else xhr.send(JSON.stringify(body));
        });
      }
      PromiseProxy.prototype = Promise.prototype;
      PromiseProxy.__proto__ = Promise;
      function hasHeader(args, name) {
        for (var key in args.headers) {
          if (hasOwn.call(args.headers, key) && key.toLowerCase() === name) return true;
        }
        return false;
      }
      return {
        request: function(url, args) {
          if (typeof url !== "string") {
            args = url;
            url = url.url;
          } else if (args == null) args = {};
          var promise = makeRequest(url, args);
          if (args.background === true) return promise;
          var count = 0;
          function complete() {
            if (--count === 0 && typeof oncompletion === "function") oncompletion();
          }
          return wrap2(promise);
          function wrap2(promise2) {
            var then = promise2.then;
            promise2.constructor = PromiseProxy;
            promise2.then = function() {
              count++;
              var next = then.apply(promise2, arguments);
              next.then(complete, function(e) {
                complete();
                if (count === 0) throw e;
              });
              return wrap2(next);
            };
            return promise2;
          }
        }
      };
    };
  }
});

// node_modules/mithril/request.js
var require_request2 = __commonJS({
  "node_modules/mithril/request.js"(exports, module) {
    "use strict";
    var mountRedraw = require_mount_redraw2();
    module.exports = require_request()(typeof window !== "undefined" ? window : null, mountRedraw.redraw);
  }
});

// node_modules/mithril/util/decodeURIComponentSafe.js
var require_decodeURIComponentSafe = __commonJS({
  "node_modules/mithril/util/decodeURIComponentSafe.js"(exports, module) {
    "use strict";
    var validUtf8Encodings = /%(?:[0-7]|(?!c[01]|e0%[89]|ed%[ab]|f0%8|f4%[9ab])(?:c|d|(?:e|f[0-4]%[89ab])[\da-f]%[89ab])[\da-f]%[89ab])[\da-f]/gi;
    module.exports = function(str) {
      return String(str).replace(validUtf8Encodings, decodeURIComponent);
    };
  }
});

// node_modules/mithril/querystring/parse.js
var require_parse = __commonJS({
  "node_modules/mithril/querystring/parse.js"(exports, module) {
    "use strict";
    var decodeURIComponentSafe = require_decodeURIComponentSafe();
    module.exports = function(string) {
      if (string === "" || string == null) return {};
      if (string.charAt(0) === "?") string = string.slice(1);
      var entries = string.split("&"), counters = {}, data = {};
      for (var i = 0; i < entries.length; i++) {
        var entry = entries[i].split("=");
        var key = decodeURIComponentSafe(entry[0]);
        var value = entry.length === 2 ? decodeURIComponentSafe(entry[1]) : "";
        if (value === "true") value = true;
        else if (value === "false") value = false;
        var levels = key.split(/\]\[?|\[/);
        var cursor = data;
        if (key.indexOf("[") > -1) levels.pop();
        for (var j = 0; j < levels.length; j++) {
          var level = levels[j], nextLevel = levels[j + 1];
          var isNumber = nextLevel == "" || !isNaN(parseInt(nextLevel, 10));
          if (level === "") {
            var key = levels.slice(0, j).join();
            if (counters[key] == null) {
              counters[key] = Array.isArray(cursor) ? cursor.length : 0;
            }
            level = counters[key]++;
          } else if (level === "__proto__") break;
          if (j === levels.length - 1) cursor[level] = value;
          else {
            var desc = Object.getOwnPropertyDescriptor(cursor, level);
            if (desc != null) desc = desc.value;
            if (desc == null) cursor[level] = desc = isNumber ? [] : {};
            cursor = desc;
          }
        }
      }
      return data;
    };
  }
});

// node_modules/mithril/pathname/parse.js
var require_parse2 = __commonJS({
  "node_modules/mithril/pathname/parse.js"(exports, module) {
    "use strict";
    var parseQueryString = require_parse();
    module.exports = function(url) {
      var queryIndex = url.indexOf("?");
      var hashIndex = url.indexOf("#");
      var queryEnd = hashIndex < 0 ? url.length : hashIndex;
      var pathEnd = queryIndex < 0 ? queryEnd : queryIndex;
      var path = url.slice(0, pathEnd).replace(/\/{2,}/g, "/");
      if (!path) path = "/";
      else {
        if (path[0] !== "/") path = "/" + path;
      }
      return {
        path,
        params: queryIndex < 0 ? {} : parseQueryString(url.slice(queryIndex + 1, queryEnd))
      };
    };
  }
});

// node_modules/mithril/pathname/compileTemplate.js
var require_compileTemplate = __commonJS({
  "node_modules/mithril/pathname/compileTemplate.js"(exports, module) {
    "use strict";
    var parsePathname = require_parse2();
    module.exports = function(template) {
      var templateData = parsePathname(template);
      var templateKeys = Object.keys(templateData.params);
      var keys = [];
      var regexp = new RegExp("^" + templateData.path.replace(
        // I escape literal text so people can use things like `:file.:ext` or
        // `:lang-:locale` in routes. This is all merged into one pass so I
        // don't also accidentally escape `-` and make it harder to detect it to
        // ban it from template parameters.
        /:([^\/.-]+)(\.{3}|\.(?!\.)|-)?|[\\^$*+.()|\[\]{}]/g,
        function(m14, key, extra) {
          if (key == null) return "\\" + m14;
          keys.push({ k: key, r: extra === "..." });
          if (extra === "...") return "(.*)";
          if (extra === ".") return "([^/]+)\\.";
          return "([^/]+)" + (extra || "");
        }
      ) + "\\/?$");
      return function(data) {
        for (var i = 0; i < templateKeys.length; i++) {
          if (templateData.params[templateKeys[i]] !== data.params[templateKeys[i]]) return false;
        }
        if (!keys.length) return regexp.test(data.path);
        var values = regexp.exec(data.path);
        if (values == null) return false;
        for (var i = 0; i < keys.length; i++) {
          data.params[keys[i].k] = keys[i].r ? values[i + 1] : decodeURIComponent(values[i + 1]);
        }
        return true;
      };
    };
  }
});

// node_modules/mithril/util/censor.js
var require_censor = __commonJS({
  "node_modules/mithril/util/censor.js"(exports, module) {
    "use strict";
    var hasOwn = require_hasOwn();
    var magic = /^(?:key|oninit|oncreate|onbeforeupdate|onupdate|onbeforeremove|onremove)$/;
    module.exports = function(attrs, extras) {
      var result = {};
      if (extras != null) {
        for (var key in attrs) {
          if (hasOwn.call(attrs, key) && !magic.test(key) && extras.indexOf(key) < 0) {
            result[key] = attrs[key];
          }
        }
      } else {
        for (var key in attrs) {
          if (hasOwn.call(attrs, key) && !magic.test(key)) {
            result[key] = attrs[key];
          }
        }
      }
      return result;
    };
  }
});

// node_modules/mithril/api/router.js
var require_router = __commonJS({
  "node_modules/mithril/api/router.js"(exports, module) {
    "use strict";
    var Vnode = require_vnode();
    var hyperscript = require_hyperscript();
    var decodeURIComponentSafe = require_decodeURIComponentSafe();
    var buildPathname = require_build2();
    var parsePathname = require_parse2();
    var compileTemplate = require_compileTemplate();
    var censor = require_censor();
    module.exports = function($window, mountRedraw) {
      var p = Promise.resolve();
      var scheduled = false;
      var ready = false;
      var hasBeenResolved = false;
      var dom, compiled, fallbackRoute;
      var currentResolver, component, attrs, currentPath, lastUpdate;
      var RouterRoot = {
        onremove: function() {
          ready = hasBeenResolved = false;
          $window.removeEventListener("popstate", fireAsync, false);
        },
        view: function() {
          var vnode = Vnode(component, attrs.key, attrs);
          if (currentResolver) return currentResolver.render(vnode);
          return [vnode];
        }
      };
      var SKIP = route.SKIP = {};
      function resolveRoute() {
        scheduled = false;
        var prefix = $window.location.hash;
        if (route.prefix[0] !== "#") {
          prefix = $window.location.search + prefix;
          if (route.prefix[0] !== "?") {
            prefix = $window.location.pathname + prefix;
            if (prefix[0] !== "/") prefix = "/" + prefix;
          }
        }
        var path = decodeURIComponentSafe(prefix).slice(route.prefix.length);
        var data = parsePathname(path);
        Object.assign(data.params, $window.history.state);
        function reject(e) {
          console.error(e);
          route.set(fallbackRoute, null, { replace: true });
        }
        loop(0);
        function loop(i) {
          for (; i < compiled.length; i++) {
            if (compiled[i].check(data)) {
              var payload = compiled[i].component;
              var matchedRoute = compiled[i].route;
              var localComp = payload;
              var update = lastUpdate = function(comp) {
                if (update !== lastUpdate) return;
                if (comp === SKIP) return loop(i + 1);
                component = comp != null && (typeof comp.view === "function" || typeof comp === "function") ? comp : "div";
                attrs = data.params, currentPath = path, lastUpdate = null;
                currentResolver = payload.render ? payload : null;
                if (hasBeenResolved) mountRedraw.redraw();
                else {
                  hasBeenResolved = true;
                  mountRedraw.mount(dom, RouterRoot);
                }
              };
              if (payload.view || typeof payload === "function") {
                payload = {};
                update(localComp);
              } else if (payload.onmatch) {
                p.then(function() {
                  return payload.onmatch(data.params, path, matchedRoute);
                }).then(update, path === fallbackRoute ? null : reject);
              } else update(
                /* "div" */
              );
              return;
            }
          }
          if (path === fallbackRoute) {
            throw new Error("Could not resolve default route " + fallbackRoute + ".");
          }
          route.set(fallbackRoute, null, { replace: true });
        }
      }
      function fireAsync() {
        if (!scheduled) {
          scheduled = true;
          setTimeout(resolveRoute);
        }
      }
      function route(root, defaultRoute, routes) {
        if (!root) throw new TypeError("DOM element being rendered to does not exist.");
        compiled = Object.keys(routes).map(function(route2) {
          if (route2[0] !== "/") throw new SyntaxError("Routes must start with a '/'.");
          if (/:([^\/\.-]+)(\.{3})?:/.test(route2)) {
            throw new SyntaxError("Route parameter names must be separated with either '/', '.', or '-'.");
          }
          return {
            route: route2,
            component: routes[route2],
            check: compileTemplate(route2)
          };
        });
        fallbackRoute = defaultRoute;
        if (defaultRoute != null) {
          var defaultData = parsePathname(defaultRoute);
          if (!compiled.some(function(i) {
            return i.check(defaultData);
          })) {
            throw new ReferenceError("Default route doesn't match any known routes.");
          }
        }
        dom = root;
        $window.addEventListener("popstate", fireAsync, false);
        ready = true;
        resolveRoute();
      }
      route.set = function(path, data, options) {
        if (lastUpdate != null) {
          options = options || {};
          options.replace = true;
        }
        lastUpdate = null;
        path = buildPathname(path, data);
        if (ready) {
          fireAsync();
          var state = options ? options.state : null;
          var title = options ? options.title : null;
          if (options && options.replace) $window.history.replaceState(state, title, route.prefix + path);
          else $window.history.pushState(state, title, route.prefix + path);
        } else {
          $window.location.href = route.prefix + path;
        }
      };
      route.get = function() {
        return currentPath;
      };
      route.prefix = "#!";
      route.Link = {
        view: function(vnode) {
          var child = hyperscript(
            vnode.attrs.selector || "a",
            censor(vnode.attrs, ["options", "params", "selector", "onclick"]),
            vnode.children
          );
          var options, onclick, href;
          if (child.attrs.disabled = Boolean(child.attrs.disabled)) {
            child.attrs.href = null;
            child.attrs["aria-disabled"] = "true";
          } else {
            options = vnode.attrs.options;
            onclick = vnode.attrs.onclick;
            href = buildPathname(child.attrs.href, vnode.attrs.params);
            child.attrs.href = route.prefix + href;
            child.attrs.onclick = function(e) {
              var result;
              if (typeof onclick === "function") {
                result = onclick.call(e.currentTarget, e);
              } else if (onclick == null || typeof onclick !== "object") {
              } else if (typeof onclick.handleEvent === "function") {
                onclick.handleEvent(e);
              }
              if (
                // Skip if `onclick` prevented default
                result !== false && !e.defaultPrevented && // Ignore everything but left clicks
                (e.button === 0 || e.which === 0 || e.which === 1) && // Let the browser handle `target=_blank`, etc.
                (!e.currentTarget.target || e.currentTarget.target === "_self") && // No modifier keys
                !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey
              ) {
                e.preventDefault();
                e.redraw = false;
                route.set(href, null, options);
              }
            };
          }
          return child;
        }
      };
      route.param = function(key) {
        return attrs && key != null ? attrs[key] : attrs;
      };
      return route;
    };
  }
});

// node_modules/mithril/route.js
var require_route = __commonJS({
  "node_modules/mithril/route.js"(exports, module) {
    "use strict";
    var mountRedraw = require_mount_redraw2();
    module.exports = require_router()(typeof window !== "undefined" ? window : null, mountRedraw);
  }
});

// node_modules/mithril/index.js
var require_mithril = __commonJS({
  "node_modules/mithril/index.js"(exports, module) {
    "use strict";
    var hyperscript = require_hyperscript2();
    var mountRedraw = require_mount_redraw2();
    var request = require_request2();
    var router = require_route();
    var m14 = function m15() {
      return hyperscript.apply(this, arguments);
    };
    m14.m = hyperscript;
    m14.trust = hyperscript.trust;
    m14.fragment = hyperscript.fragment;
    m14.Fragment = "[";
    m14.mount = mountRedraw.mount;
    m14.route = router;
    m14.render = require_render2();
    m14.redraw = mountRedraw.redraw;
    m14.request = request.request;
    m14.parseQueryString = require_parse();
    m14.buildQueryString = require_build();
    m14.parsePathname = require_parse2();
    m14.buildPathname = require_build2();
    m14.vnode = require_vnode();
    m14.censor = require_censor();
    m14.domFor = require_domFor();
    module.exports = m14;
  }
});

// node_modules/dayjs/dayjs.min.js
var require_dayjs_min = __commonJS({
  "node_modules/dayjs/dayjs.min.js"(exports, module) {
    "use strict";
    !(function(t, e) {
      "object" == typeof exports && "undefined" != typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define(e) : (t = "undefined" != typeof globalThis ? globalThis : t || self).dayjs = e();
    })(exports, (function() {
      "use strict";
      var t = 1e3, e = 6e4, n = 36e5, r = "millisecond", i = "second", s = "minute", u = "hour", a = "day", o = "week", c = "month", f = "quarter", h = "year", d = "date", l = "Invalid Date", $ = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/, y = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g, M = { name: "en", weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"), months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"), ordinal: function(t2) {
        var e2 = ["th", "st", "nd", "rd"], n2 = t2 % 100;
        return "[" + t2 + (e2[(n2 - 20) % 10] || e2[n2] || e2[0]) + "]";
      } }, m14 = function(t2, e2, n2) {
        var r2 = String(t2);
        return !r2 || r2.length >= e2 ? t2 : "" + Array(e2 + 1 - r2.length).join(n2) + t2;
      }, v = { s: m14, z: function(t2) {
        var e2 = -t2.utcOffset(), n2 = Math.abs(e2), r2 = Math.floor(n2 / 60), i2 = n2 % 60;
        return (e2 <= 0 ? "+" : "-") + m14(r2, 2, "0") + ":" + m14(i2, 2, "0");
      }, m: function t2(e2, n2) {
        if (e2.date() < n2.date()) return -t2(n2, e2);
        var r2 = 12 * (n2.year() - e2.year()) + (n2.month() - e2.month()), i2 = e2.clone().add(r2, c), s2 = n2 - i2 < 0, u2 = e2.clone().add(r2 + (s2 ? -1 : 1), c);
        return +(-(r2 + (n2 - i2) / (s2 ? i2 - u2 : u2 - i2)) || 0);
      }, a: function(t2) {
        return t2 < 0 ? Math.ceil(t2) || 0 : Math.floor(t2);
      }, p: function(t2) {
        return { M: c, y: h, w: o, d: a, D: d, h: u, m: s, s: i, ms: r, Q: f }[t2] || String(t2 || "").toLowerCase().replace(/s$/, "");
      }, u: function(t2) {
        return void 0 === t2;
      } }, g = "en", D = {};
      D[g] = M;
      var p = "$isDayjsObject", S = function(t2) {
        return t2 instanceof _ || !(!t2 || !t2[p]);
      }, w = function t2(e2, n2, r2) {
        var i2;
        if (!e2) return g;
        if ("string" == typeof e2) {
          var s2 = e2.toLowerCase();
          D[s2] && (i2 = s2), n2 && (D[s2] = n2, i2 = s2);
          var u2 = e2.split("-");
          if (!i2 && u2.length > 1) return t2(u2[0]);
        } else {
          var a2 = e2.name;
          D[a2] = e2, i2 = a2;
        }
        return !r2 && i2 && (g = i2), i2 || !r2 && g;
      }, O = function(t2, e2) {
        if (S(t2)) return t2.clone();
        var n2 = "object" == typeof e2 ? e2 : {};
        return n2.date = t2, n2.args = arguments, new _(n2);
      }, b = v;
      b.l = w, b.i = S, b.w = function(t2, e2) {
        return O(t2, { locale: e2.$L, utc: e2.$u, x: e2.$x, $offset: e2.$offset });
      };
      var _ = (function() {
        function M2(t2) {
          this.$L = w(t2.locale, null, true), this.parse(t2), this.$x = this.$x || t2.x || {}, this[p] = true;
        }
        var m15 = M2.prototype;
        return m15.parse = function(t2) {
          this.$d = (function(t3) {
            var e2 = t3.date, n2 = t3.utc;
            if (null === e2) return /* @__PURE__ */ new Date(NaN);
            if (b.u(e2)) return /* @__PURE__ */ new Date();
            if (e2 instanceof Date) return new Date(e2);
            if ("string" == typeof e2 && !/Z$/i.test(e2)) {
              var r2 = e2.match($);
              if (r2) {
                var i2 = r2[2] - 1 || 0, s2 = (r2[7] || "0").substring(0, 3);
                return n2 ? new Date(Date.UTC(r2[1], i2, r2[3] || 1, r2[4] || 0, r2[5] || 0, r2[6] || 0, s2)) : new Date(r2[1], i2, r2[3] || 1, r2[4] || 0, r2[5] || 0, r2[6] || 0, s2);
              }
            }
            return new Date(e2);
          })(t2), this.init();
        }, m15.init = function() {
          var t2 = this.$d;
          this.$y = t2.getFullYear(), this.$M = t2.getMonth(), this.$D = t2.getDate(), this.$W = t2.getDay(), this.$H = t2.getHours(), this.$m = t2.getMinutes(), this.$s = t2.getSeconds(), this.$ms = t2.getMilliseconds();
        }, m15.$utils = function() {
          return b;
        }, m15.isValid = function() {
          return !(this.$d.toString() === l);
        }, m15.isSame = function(t2, e2) {
          var n2 = O(t2);
          return this.startOf(e2) <= n2 && n2 <= this.endOf(e2);
        }, m15.isAfter = function(t2, e2) {
          return O(t2) < this.startOf(e2);
        }, m15.isBefore = function(t2, e2) {
          return this.endOf(e2) < O(t2);
        }, m15.$g = function(t2, e2, n2) {
          return b.u(t2) ? this[e2] : this.set(n2, t2);
        }, m15.unix = function() {
          return Math.floor(this.valueOf() / 1e3);
        }, m15.valueOf = function() {
          return this.$d.getTime();
        }, m15.startOf = function(t2, e2) {
          var n2 = this, r2 = !!b.u(e2) || e2, f2 = b.p(t2), l2 = function(t3, e3) {
            var i2 = b.w(n2.$u ? Date.UTC(n2.$y, e3, t3) : new Date(n2.$y, e3, t3), n2);
            return r2 ? i2 : i2.endOf(a);
          }, $2 = function(t3, e3) {
            return b.w(n2.toDate()[t3].apply(n2.toDate("s"), (r2 ? [0, 0, 0, 0] : [23, 59, 59, 999]).slice(e3)), n2);
          }, y2 = this.$W, M3 = this.$M, m16 = this.$D, v2 = "set" + (this.$u ? "UTC" : "");
          switch (f2) {
            case h:
              return r2 ? l2(1, 0) : l2(31, 11);
            case c:
              return r2 ? l2(1, M3) : l2(0, M3 + 1);
            case o:
              var g2 = this.$locale().weekStart || 0, D2 = (y2 < g2 ? y2 + 7 : y2) - g2;
              return l2(r2 ? m16 - D2 : m16 + (6 - D2), M3);
            case a:
            case d:
              return $2(v2 + "Hours", 0);
            case u:
              return $2(v2 + "Minutes", 1);
            case s:
              return $2(v2 + "Seconds", 2);
            case i:
              return $2(v2 + "Milliseconds", 3);
            default:
              return this.clone();
          }
        }, m15.endOf = function(t2) {
          return this.startOf(t2, false);
        }, m15.$set = function(t2, e2) {
          var n2, o2 = b.p(t2), f2 = "set" + (this.$u ? "UTC" : ""), l2 = (n2 = {}, n2[a] = f2 + "Date", n2[d] = f2 + "Date", n2[c] = f2 + "Month", n2[h] = f2 + "FullYear", n2[u] = f2 + "Hours", n2[s] = f2 + "Minutes", n2[i] = f2 + "Seconds", n2[r] = f2 + "Milliseconds", n2)[o2], $2 = o2 === a ? this.$D + (e2 - this.$W) : e2;
          if (o2 === c || o2 === h) {
            var y2 = this.clone().set(d, 1);
            y2.$d[l2]($2), y2.init(), this.$d = y2.set(d, Math.min(this.$D, y2.daysInMonth())).$d;
          } else l2 && this.$d[l2]($2);
          return this.init(), this;
        }, m15.set = function(t2, e2) {
          return this.clone().$set(t2, e2);
        }, m15.get = function(t2) {
          return this[b.p(t2)]();
        }, m15.add = function(r2, f2) {
          var d2, l2 = this;
          r2 = Number(r2);
          var $2 = b.p(f2), y2 = function(t2) {
            var e2 = O(l2);
            return b.w(e2.date(e2.date() + Math.round(t2 * r2)), l2);
          };
          if ($2 === c) return this.set(c, this.$M + r2);
          if ($2 === h) return this.set(h, this.$y + r2);
          if ($2 === a) return y2(1);
          if ($2 === o) return y2(7);
          var M3 = (d2 = {}, d2[s] = e, d2[u] = n, d2[i] = t, d2)[$2] || 1, m16 = this.$d.getTime() + r2 * M3;
          return b.w(m16, this);
        }, m15.subtract = function(t2, e2) {
          return this.add(-1 * t2, e2);
        }, m15.format = function(t2) {
          var e2 = this, n2 = this.$locale();
          if (!this.isValid()) return n2.invalidDate || l;
          var r2 = t2 || "YYYY-MM-DDTHH:mm:ssZ", i2 = b.z(this), s2 = this.$H, u2 = this.$m, a2 = this.$M, o2 = n2.weekdays, c2 = n2.months, f2 = n2.meridiem, h2 = function(t3, n3, i3, s3) {
            return t3 && (t3[n3] || t3(e2, r2)) || i3[n3].slice(0, s3);
          }, d2 = function(t3) {
            return b.s(s2 % 12 || 12, t3, "0");
          }, $2 = f2 || function(t3, e3, n3) {
            var r3 = t3 < 12 ? "AM" : "PM";
            return n3 ? r3.toLowerCase() : r3;
          };
          return r2.replace(y, (function(t3, r3) {
            return r3 || (function(t4) {
              switch (t4) {
                case "YY":
                  return String(e2.$y).slice(-2);
                case "YYYY":
                  return b.s(e2.$y, 4, "0");
                case "M":
                  return a2 + 1;
                case "MM":
                  return b.s(a2 + 1, 2, "0");
                case "MMM":
                  return h2(n2.monthsShort, a2, c2, 3);
                case "MMMM":
                  return h2(c2, a2);
                case "D":
                  return e2.$D;
                case "DD":
                  return b.s(e2.$D, 2, "0");
                case "d":
                  return String(e2.$W);
                case "dd":
                  return h2(n2.weekdaysMin, e2.$W, o2, 2);
                case "ddd":
                  return h2(n2.weekdaysShort, e2.$W, o2, 3);
                case "dddd":
                  return o2[e2.$W];
                case "H":
                  return String(s2);
                case "HH":
                  return b.s(s2, 2, "0");
                case "h":
                  return d2(1);
                case "hh":
                  return d2(2);
                case "a":
                  return $2(s2, u2, true);
                case "A":
                  return $2(s2, u2, false);
                case "m":
                  return String(u2);
                case "mm":
                  return b.s(u2, 2, "0");
                case "s":
                  return String(e2.$s);
                case "ss":
                  return b.s(e2.$s, 2, "0");
                case "SSS":
                  return b.s(e2.$ms, 3, "0");
                case "Z":
                  return i2;
              }
              return null;
            })(t3) || i2.replace(":", "");
          }));
        }, m15.utcOffset = function() {
          return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
        }, m15.diff = function(r2, d2, l2) {
          var $2, y2 = this, M3 = b.p(d2), m16 = O(r2), v2 = (m16.utcOffset() - this.utcOffset()) * e, g2 = this - m16, D2 = function() {
            return b.m(y2, m16);
          };
          switch (M3) {
            case h:
              $2 = D2() / 12;
              break;
            case c:
              $2 = D2();
              break;
            case f:
              $2 = D2() / 3;
              break;
            case o:
              $2 = (g2 - v2) / 6048e5;
              break;
            case a:
              $2 = (g2 - v2) / 864e5;
              break;
            case u:
              $2 = g2 / n;
              break;
            case s:
              $2 = g2 / e;
              break;
            case i:
              $2 = g2 / t;
              break;
            default:
              $2 = g2;
          }
          return l2 ? $2 : b.a($2);
        }, m15.daysInMonth = function() {
          return this.endOf(c).$D;
        }, m15.$locale = function() {
          return D[this.$L];
        }, m15.locale = function(t2, e2) {
          if (!t2) return this.$L;
          var n2 = this.clone(), r2 = w(t2, e2, true);
          return r2 && (n2.$L = r2), n2;
        }, m15.clone = function() {
          return b.w(this.$d, this);
        }, m15.toDate = function() {
          return new Date(this.valueOf());
        }, m15.toJSON = function() {
          return this.isValid() ? this.toISOString() : null;
        }, m15.toISOString = function() {
          return this.$d.toISOString();
        }, m15.toString = function() {
          return this.$d.toUTCString();
        }, M2;
      })(), k = _.prototype;
      return O.prototype = k, [["$ms", r], ["$s", i], ["$m", s], ["$H", u], ["$W", a], ["$M", c], ["$y", h], ["$D", d]].forEach((function(t2) {
        k[t2[1]] = function(e2) {
          return this.$g(e2, t2[0], t2[1]);
        };
      })), O.extend = function(t2, e2) {
        return t2.$i || (t2(e2, _, O), t2.$i = true), O;
      }, O.locale = w, O.isDayjs = S, O.unix = function(t2) {
        return O(1e3 * t2);
      }, O.en = D[g], O.Ls = D, O.p = {}, O;
    }));
  }
});

// ts/index.ts
var import_mithril13 = __toESM(require_mithril(), 1);

// ts/storage.ts
var KEY_TOKEN = "bkmk:token";
var KEY_AUTH_ERROR = "bkmk:authError";
var KEY_PERMISSIONS = "bkmk:permissions";
function readToken() {
  return localStorage.getItem(KEY_TOKEN);
}
function writeToken(token) {
  localStorage.setItem(KEY_TOKEN, token);
}
function readAuthError() {
  return localStorage.getItem(KEY_AUTH_ERROR) === "true";
}
function writeAuthError(flag) {
  if (flag) {
    localStorage.setItem(KEY_AUTH_ERROR, "true");
  } else {
    localStorage.removeItem(KEY_AUTH_ERROR);
  }
}
function readPermissions() {
  const raw = localStorage.getItem(KEY_PERMISSIONS);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function writePermissions(permissions) {
  localStorage.setItem(KEY_PERMISSIONS, JSON.stringify(permissions));
}

// ts/state.ts
var import_mithril = __toESM(require_mithril(), 1);

// ts/url-state.ts
var QUERY_PARAM = "q";
function readQueryParam() {
  return new URLSearchParams(window.location.search).get(QUERY_PARAM) ?? "";
}
function writeQueryParam(query) {
  const params = new URLSearchParams(window.location.search);
  if (query) {
    params.set(QUERY_PARAM, query);
  } else {
    params.delete(QUERY_PARAM);
  }
  const newUrl = params.toString() ? `?${params}` : window.location.pathname;
  history.replaceState(null, "", newUrl);
}

// ts/state.ts
function initialState() {
  return {
    token: null,
    ready: false,
    writeOnly: false,
    permissions: null,
    bookmarks: /* @__PURE__ */ new Map(),
    urlSet: /* @__PURE__ */ new Set(),
    query: "",
    results: [],
    selectedIdx: 0,
    syncStatus: { kind: "idle" },
    showAuthModal: false,
    showHelpModal: false,
    fatalError: null
  };
}
function applyToken(state, token) {
  state.token = token;
  state.showAuthModal = token === null;
}
function buildUrlSet(bookmarks) {
  return new Set([...bookmarks.values()].map((bookmark) => bookmark.url));
}
function applyReady(state, bookmarks, results) {
  state.bookmarks = bookmarks;
  state.urlSet = buildUrlSet(bookmarks);
  state.results = results;
  state.selectedIdx = 0;
  state.ready = true;
}
function applyQuery(state, query, results) {
  state.query = query;
  state.results = results;
  state.selectedIdx = 0;
}
function applySelection(state, delta) {
  const next = state.selectedIdx + delta;
  const max = state.results.length - 1;
  state.selectedIdx = Math.max(0, Math.min(next, max));
}
function applySelectedIdx(state, idx) {
  const max = state.results.length - 1;
  state.selectedIdx = Math.max(0, Math.min(idx, max));
}
function applySyncStatus(state, status) {
  state.syncStatus = status;
}
function applyAuthModal(state, visible) {
  state.showAuthModal = visible;
}
function applyDiff(state, bookmarks, results) {
  state.bookmarks = bookmarks;
  state.urlSet = buildUrlSet(bookmarks);
  state.results = results;
}
var Store = class {
  #state = initialState();
  get state() {
    return this.#state;
  }
  setToken(token) {
    applyToken(this.#state, token);
    import_mithril.default.redraw();
  }
  setReady(bookmarks, results) {
    applyReady(this.#state, bookmarks, results);
    import_mithril.default.redraw();
  }
  setQuery(query, results) {
    applyQuery(this.#state, query, results);
    writeQueryParam(query);
    import_mithril.default.redraw();
  }
  moveSelection(delta) {
    applySelection(this.#state, delta);
    import_mithril.default.redraw();
  }
  selectIdx(idx) {
    applySelectedIdx(this.#state, idx);
    import_mithril.default.redraw();
  }
  beginSync() {
    applySyncStatus(this.#state, { kind: "syncing", received: 0 });
    import_mithril.default.redraw();
  }
  progressSync(received) {
    applySyncStatus(this.#state, { kind: "syncing", received });
    import_mithril.default.redraw();
  }
  endSync() {
    applySyncStatus(this.#state, { kind: "done" });
    import_mithril.default.redraw();
  }
  beginPoll() {
    applySyncStatus(this.#state, { kind: "polling" });
    import_mithril.default.redraw();
  }
  pollComplete() {
    applySyncStatus(this.#state, { kind: "upToDate" });
    import_mithril.default.redraw();
    setTimeout(() => {
      if (this.#state.syncStatus.kind === "upToDate") {
        applySyncStatus(this.#state, { kind: "idle" });
        import_mithril.default.redraw();
      }
    }, 3e3);
  }
  errorSync(message) {
    applySyncStatus(this.#state, { kind: "error", message });
    import_mithril.default.redraw();
  }
  openAuthModal() {
    applyAuthModal(this.#state, true);
    import_mithril.default.redraw();
  }
  closeAuthModal() {
    applyAuthModal(this.#state, false);
    import_mithril.default.redraw();
  }
  setFatalError(message, stack) {
    this.#state.fatalError = { message, stack };
    import_mithril.default.redraw();
  }
  openHelpModal() {
    this.#state.showHelpModal = true;
    import_mithril.default.redraw();
  }
  closeHelpModal() {
    this.#state.showHelpModal = false;
    import_mithril.default.redraw();
  }
  applyDiff(bookmarks, results) {
    applyDiff(this.#state, bookmarks, results);
    import_mithril.default.redraw();
  }
  setWriteOnly(value) {
    this.#state.writeOnly = value;
    import_mithril.default.redraw();
  }
  setPermissions(permissions) {
    this.#state.permissions = permissions;
    import_mithril.default.redraw();
  }
  urlExists(url) {
    return this.#state.urlSet.has(url);
  }
};
var store = new Store();

// node_modules/idb/build/index.js
var instanceOfAny = (object, constructors) => constructors.some((c) => object instanceof c);
var idbProxyableTypes;
var cursorAdvanceMethods;
function getIdbProxyableTypes() {
  return idbProxyableTypes || (idbProxyableTypes = [
    IDBDatabase,
    IDBObjectStore,
    IDBIndex,
    IDBCursor,
    IDBTransaction
  ]);
}
function getCursorAdvanceMethods() {
  return cursorAdvanceMethods || (cursorAdvanceMethods = [
    IDBCursor.prototype.advance,
    IDBCursor.prototype.continue,
    IDBCursor.prototype.continuePrimaryKey
  ]);
}
var transactionDoneMap = /* @__PURE__ */ new WeakMap();
var transformCache = /* @__PURE__ */ new WeakMap();
var reverseTransformCache = /* @__PURE__ */ new WeakMap();
function promisifyRequest(request) {
  const promise = new Promise((resolve, reject) => {
    const unlisten = () => {
      request.removeEventListener("success", success);
      request.removeEventListener("error", error);
    };
    const success = () => {
      resolve(wrap(request.result));
      unlisten();
    };
    const error = () => {
      reject(request.error);
      unlisten();
    };
    request.addEventListener("success", success);
    request.addEventListener("error", error);
  });
  reverseTransformCache.set(promise, request);
  return promise;
}
function cacheDonePromiseForTransaction(tx) {
  if (transactionDoneMap.has(tx))
    return;
  const done = new Promise((resolve, reject) => {
    const unlisten = () => {
      tx.removeEventListener("complete", complete);
      tx.removeEventListener("error", error);
      tx.removeEventListener("abort", error);
    };
    const complete = () => {
      resolve();
      unlisten();
    };
    const error = () => {
      reject(tx.error || new DOMException("AbortError", "AbortError"));
      unlisten();
    };
    tx.addEventListener("complete", complete);
    tx.addEventListener("error", error);
    tx.addEventListener("abort", error);
  });
  transactionDoneMap.set(tx, done);
}
var idbProxyTraps = {
  get(target, prop, receiver) {
    if (target instanceof IDBTransaction) {
      if (prop === "done")
        return transactionDoneMap.get(target);
      if (prop === "store") {
        return receiver.objectStoreNames[1] ? void 0 : receiver.objectStore(receiver.objectStoreNames[0]);
      }
    }
    return wrap(target[prop]);
  },
  set(target, prop, value) {
    target[prop] = value;
    return true;
  },
  has(target, prop) {
    if (target instanceof IDBTransaction && (prop === "done" || prop === "store")) {
      return true;
    }
    return prop in target;
  }
};
function replaceTraps(callback) {
  idbProxyTraps = callback(idbProxyTraps);
}
function wrapFunction(func) {
  if (getCursorAdvanceMethods().includes(func)) {
    return function(...args) {
      func.apply(unwrap(this), args);
      return wrap(this.request);
    };
  }
  return function(...args) {
    return wrap(func.apply(unwrap(this), args));
  };
}
function transformCachableValue(value) {
  if (typeof value === "function")
    return wrapFunction(value);
  if (value instanceof IDBTransaction)
    cacheDonePromiseForTransaction(value);
  if (instanceOfAny(value, getIdbProxyableTypes()))
    return new Proxy(value, idbProxyTraps);
  return value;
}
function wrap(value) {
  if (value instanceof IDBRequest)
    return promisifyRequest(value);
  if (transformCache.has(value))
    return transformCache.get(value);
  const newValue = transformCachableValue(value);
  if (newValue !== value) {
    transformCache.set(value, newValue);
    reverseTransformCache.set(newValue, value);
  }
  return newValue;
}
var unwrap = (value) => reverseTransformCache.get(value);
function openDB(name, version, { blocked, upgrade, blocking, terminated } = {}) {
  const request = indexedDB.open(name, version);
  const openPromise = wrap(request);
  if (upgrade) {
    request.addEventListener("upgradeneeded", (event) => {
      upgrade(wrap(request.result), event.oldVersion, event.newVersion, wrap(request.transaction), event);
    });
  }
  if (blocked) {
    request.addEventListener("blocked", (event) => blocked(
      // Casting due to https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1405
      event.oldVersion,
      event.newVersion,
      event
    ));
  }
  openPromise.then((db) => {
    if (terminated)
      db.addEventListener("close", () => terminated());
    if (blocking) {
      db.addEventListener("versionchange", (event) => blocking(event.oldVersion, event.newVersion, event));
    }
  }).catch(() => {
  });
  return openPromise;
}
var readMethods = ["get", "getKey", "getAll", "getAllKeys", "count"];
var writeMethods = ["put", "add", "delete", "clear"];
var cachedMethods = /* @__PURE__ */ new Map();
function getMethod(target, prop) {
  if (!(target instanceof IDBDatabase && !(prop in target) && typeof prop === "string")) {
    return;
  }
  if (cachedMethods.get(prop))
    return cachedMethods.get(prop);
  const targetFuncName = prop.replace(/FromIndex$/, "");
  const useIndex = prop !== targetFuncName;
  const isWrite = writeMethods.includes(targetFuncName);
  if (
    // Bail if the target doesn't exist on the target. Eg, getAll isn't in Edge.
    !(targetFuncName in (useIndex ? IDBIndex : IDBObjectStore).prototype) || !(isWrite || readMethods.includes(targetFuncName))
  ) {
    return;
  }
  const method = async function(storeName, ...args) {
    const tx = this.transaction(storeName, isWrite ? "readwrite" : "readonly");
    let target2 = tx.store;
    if (useIndex)
      target2 = target2.index(args.shift());
    return (await Promise.all([
      target2[targetFuncName](...args),
      isWrite && tx.done
    ]))[0];
  };
  cachedMethods.set(prop, method);
  return method;
}
replaceTraps((oldTraps) => ({
  ...oldTraps,
  get: (target, prop, receiver) => getMethod(target, prop) || oldTraps.get(target, prop, receiver),
  has: (target, prop) => !!getMethod(target, prop) || oldTraps.has(target, prop)
}));
var advanceMethodProps = ["continue", "continuePrimaryKey", "advance"];
var methodMap = {};
var advanceResults = /* @__PURE__ */ new WeakMap();
var ittrProxiedCursorToOriginalProxy = /* @__PURE__ */ new WeakMap();
var cursorIteratorTraps = {
  get(target, prop) {
    if (!advanceMethodProps.includes(prop))
      return target[prop];
    let cachedFunc = methodMap[prop];
    if (!cachedFunc) {
      cachedFunc = methodMap[prop] = function(...args) {
        advanceResults.set(this, ittrProxiedCursorToOriginalProxy.get(this)[prop](...args));
      };
    }
    return cachedFunc;
  }
};
async function* iterate(...args) {
  let cursor = this;
  if (!(cursor instanceof IDBCursor)) {
    cursor = await cursor.openCursor(...args);
  }
  if (!cursor)
    return;
  cursor = cursor;
  const proxiedCursor = new Proxy(cursor, cursorIteratorTraps);
  ittrProxiedCursorToOriginalProxy.set(proxiedCursor, cursor);
  reverseTransformCache.set(proxiedCursor, unwrap(cursor));
  while (cursor) {
    yield proxiedCursor;
    cursor = await (advanceResults.get(proxiedCursor) || cursor.continue());
    advanceResults.delete(proxiedCursor);
  }
}
function isIteratorProp(target, prop) {
  return prop === Symbol.asyncIterator && instanceOfAny(target, [IDBIndex, IDBObjectStore, IDBCursor]) || prop === "iterate" && instanceOfAny(target, [IDBIndex, IDBObjectStore]);
}
replaceTraps((oldTraps) => ({
  ...oldTraps,
  get(target, prop, receiver) {
    if (isIteratorProp(target, prop))
      return iterate;
    return oldTraps.get(target, prop, receiver);
  },
  has(target, prop) {
    return isIteratorProp(target, prop) || oldTraps.has(target, prop);
  }
}));

// ../../cmstr/src/storage/idb/events.ts
var IDB_EVENT_STORE = "events";
function toEntry(stored) {
  return { id: stored.id, createdAt: stored.createdAt, updatedAt: stored.updatedAt, payload: stored.payload };
}
var IDBEventStore = class {
  constructor(db) {
    this.db = db;
  }
  readEvent(topic, id) {
    return this.db.get(IDB_EVENT_STORE, this.#key(topic, id)).then((result) => result ? toEntry(result) : null);
  }
  readEvents(topic, opts) {
    if (opts.ids) {
      return this.#readByIds(topic, opts.ids);
    }
    return this.#readRange(topic, opts.start ?? 1, opts.size);
  }
  async updateEvent(topic, id, payload, timestamps) {
    const existing = await this.readEvent(topic, id);
    const now = Date.now();
    const entry = {
      id,
      createdAt: timestamps?.createdAt ?? existing?.createdAt ?? now,
      updatedAt: timestamps?.updatedAt ?? now,
      payload
    };
    await this.#put(topic, entry);
    return { entry: toEntry(entry), created: existing === null };
  }
  async writeEvent(topic, payload) {
    const nextId = await this.#nextId(topic);
    const now = Date.now();
    const entry = { id: nextId, createdAt: now, updatedAt: now, payload };
    await this.#put(topic, entry);
    return toEntry(entry);
  }
  // Returns summaries (id + updatedAt) for events with id in (start, end].
  async readEventSummaries(topic, start, end) {
    const tx = this.db.transaction(IDB_EVENT_STORE, "readonly");
    const store2 = tx.objectStore(IDB_EVENT_STORE);
    const range = IDBKeyRange.bound(this.#key(topic, start + 1), this.#key(topic, end));
    const results = [];
    let cursor = await store2.openCursor(range);
    while (cursor) {
      const stored = cursor.value;
      results.push({ id: stored.id, updatedAt: stored.updatedAt });
      cursor = await cursor.continue();
    }
    return results;
  }
  // Returns true if no event exists with id in (start, end].
  async isEventRangeEmpty(topic, start, end) {
    const tx = this.db.transaction(IDB_EVENT_STORE, "readonly");
    const store2 = tx.objectStore(IDB_EVENT_STORE);
    const range = IDBKeyRange.bound(this.#key(topic, start + 1), this.#key(topic, end));
    const count = await store2.count(range);
    return count === 0;
  }
  #key(topic, id) {
    return [topic, id];
  }
  async #readByIds(topic, ids) {
    const results = await Promise.all(ids.map((id) => this.db.get(IDB_EVENT_STORE, this.#key(topic, id))));
    return results.filter((result) => result !== void 0).map(toEntry).sort((first, second) => first.id - second.id);
  }
  async #readRange(topic, start, size) {
    const tx = this.db.transaction(IDB_EVENT_STORE, "readonly");
    const store2 = tx.objectStore(IDB_EVENT_STORE);
    const range = IDBKeyRange.bound(this.#key(topic, start), this.#key(topic, Infinity));
    const results = [];
    let cursor = await store2.openCursor(range);
    while (cursor) {
      if (size !== void 0 && results.length >= size) break;
      results.push(toEntry(cursor.value));
      cursor = await cursor.continue();
    }
    return results;
  }
  #put(topic, entry) {
    return this.db.put(IDB_EVENT_STORE, entry, this.#key(topic, entry.id)).then(() => void 0);
  }
  async #nextId(topic) {
    const tx = this.db.transaction(IDB_EVENT_STORE, "readonly");
    const store2 = tx.objectStore(IDB_EVENT_STORE);
    const range = IDBKeyRange.bound(this.#key(topic, 0), this.#key(topic, Infinity));
    const cursor = await store2.openCursor(range, "prev");
    return cursor ? cursor.key[1] + 1 : 1;
  }
};

// ../../cmstr/src/storage/idb/objects.ts
var IDB_OBJECT_STORE = "objects";
var IDB_OBJECT_SEQ_INDEX = "by-seq";
function toEntry2(stored) {
  return { id: stored.id, seq: stored.seq, createdAt: stored.createdAt, updatedAt: stored.updatedAt, payload: stored.payload };
}
var IDBObjectStore2 = class {
  constructor(db) {
    this.db = db;
  }
  readObject(topic, id) {
    return this.db.get(IDB_OBJECT_STORE, this.#key(topic, id)).then((result) => result ? toEntry2(result) : null);
  }
  async readObjectsBySeq(topic, opts) {
    const tx = this.db.transaction(IDB_OBJECT_STORE, "readonly");
    const index = tx.objectStore(IDB_OBJECT_STORE).index(IDB_OBJECT_SEQ_INDEX);
    const lower = opts.start ?? 0;
    const upper = [topic, "\uFFFF"];
    const range = IDBKeyRange.bound([topic, lower], upper);
    const results = [];
    let cursor = await index.openCursor(range);
    while (cursor) {
      if (opts.size !== void 0 && results.length >= opts.size) break;
      const stored = cursor.value;
      if (stored.topic !== topic) break;
      results.push(toEntry2(stored));
      cursor = await cursor.continue();
    }
    return results;
  }
  async upsertObject(topic, id, payload, timestamps) {
    const existing = await this.readObject(topic, id);
    const now = Date.now();
    const seq = timestamps?.seq ?? await this.#nextSeq(topic);
    const stored = {
      id,
      topic,
      seq,
      createdAt: timestamps?.createdAt ?? existing?.createdAt ?? now,
      updatedAt: timestamps?.updatedAt ?? now,
      payload
    };
    await this.#put(stored);
    return toEntry2(stored);
  }
  async deleteObject(topic, id, timestamps) {
    const existing = await this.readObject(topic, id);
    const now = Date.now();
    const seq = timestamps?.seq ?? await this.#nextSeq(topic);
    const stored = {
      id,
      topic,
      seq,
      createdAt: timestamps?.createdAt ?? existing?.createdAt ?? now,
      updatedAt: timestamps?.updatedAt ?? now,
      payload: null
    };
    await this.#put(stored);
    return toEntry2(stored);
  }
  // Returns summaries (seq as id + updatedAt) for objects with seq in (start, end].
  async readObjectSummaries(topic, start, end) {
    const tx = this.db.transaction(IDB_OBJECT_STORE, "readonly");
    const index = tx.objectStore(IDB_OBJECT_STORE).index(IDB_OBJECT_SEQ_INDEX);
    const range = IDBKeyRange.bound([topic, start + 1], [topic, end]);
    const results = [];
    let cursor = await index.openCursor(range);
    while (cursor) {
      const stored = cursor.value;
      results.push({ id: stored.seq, updatedAt: stored.updatedAt });
      cursor = await cursor.continue();
    }
    return results;
  }
  // Returns true if no object exists with seq in (start, end].
  async isObjectRangeEmpty(topic, start, end) {
    const tx = this.db.transaction(IDB_OBJECT_STORE, "readonly");
    const index = tx.objectStore(IDB_OBJECT_STORE).index(IDB_OBJECT_SEQ_INDEX);
    const range = IDBKeyRange.bound([topic, start + 1], [topic, end]);
    const count = await index.count(range);
    return count === 0;
  }
  #key(topic, id) {
    return `${topic}:${id}`;
  }
  #put(stored) {
    return this.db.put(IDB_OBJECT_STORE, stored, this.#key(stored.topic, stored.id)).then(() => void 0);
  }
  async #nextSeq(topic) {
    const tx = this.db.transaction(IDB_OBJECT_STORE, "readonly");
    const index = tx.objectStore(IDB_OBJECT_STORE).index(IDB_OBJECT_SEQ_INDEX);
    const range = IDBKeyRange.bound([topic, 0], [topic, Infinity]);
    const cursor = await index.openCursor(range, "prev");
    return cursor ? cursor.key[1] + 1 : 1;
  }
};

// ../../cmstr/src/storage/idb/cursors.ts
var IDB_CURSOR_STORE = "cursors";
var IDBCursorStore = class {
  constructor(db) {
    this.db = db;
  }
  async getEventCursor(topic) {
    return await this.#get(`event:${topic}`);
  }
  setEventCursor(topic, id) {
    return this.#set(`event:${topic}`, id);
  }
  async getObjectCursor(topic) {
    return await this.#get(`object:${topic}`);
  }
  setObjectCursor(topic, seq) {
    return this.#set(`object:${topic}`, seq);
  }
  async #get(key) {
    const val = await this.db.get(IDB_CURSOR_STORE, key);
    return val ?? 0;
  }
  #set(key, value) {
    return this.db.put(IDB_CURSOR_STORE, value, key).then(() => void 0);
  }
};

// ../../cmstr/src/commons/constants.ts
var TAIL_DURATION_MS = 5e3;
var DEFAULT_FETCH_PAGE_SIZE = 500;
var MERKLE_LEAF_SIZE = 100;
var MERKLE_TREE_END = MERKLE_LEAF_SIZE * (1 << 20);
var MERKLE_TREE_DEPTH = 20;
var TOMBSTONE_RETENTION_MS = 24 * 60 * 60 * 1e3;
var METRICS_BUCKET_TTL_MS = 24 * 60 * 60 * 1e3;
var UINT64_BYTES = 8;
var SHA256_BYTES = 32;
var MAX_REQUEST_BODY_BYTES = 128 * 1024;
var IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1e3;

// ../../cmstr/src/core/hashing.ts
function hexToBytes(hex) {
  const buf = new Uint8Array(hex.length / 2);
  for (let idx = 0; idx < buf.length; idx++) {
    buf[idx] = parseInt(hex.slice(idx * 2, idx * 2 + 2), 16);
  }
  return buf;
}
async function sha256Hex(data) {
  const hash = await crypto.subtle.digest("SHA-256", data.buffer);
  return Array.from(new Uint8Array(hash)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
function hashBucket(entries) {
  const buf = new Uint8Array(entries.length * UINT64_BYTES * 2);
  const view = new DataView(buf.buffer);
  for (let idx = 0; idx < entries.length; idx++) {
    view.setBigUint64(idx * UINT64_BYTES * 2, BigInt(entries[idx].id), false);
    view.setBigUint64(idx * UINT64_BYTES * 2 + UINT64_BYTES, BigInt(entries[idx].updatedAt), false);
  }
  return sha256Hex(buf);
}
function hashMerkleInternalNode(leftHash, rightHash) {
  const buf = new Uint8Array(SHA256_BYTES * 2);
  buf.set(hexToBytes(leftHash), 0);
  buf.set(hexToBytes(rightHash), SHA256_BYTES);
  return sha256Hex(buf);
}

// ../../cmstr/src/core/diff.ts
var emptyHashTablePromise = null;
function getEmptyHashTable() {
  if (emptyHashTablePromise === null) {
    emptyHashTablePromise = buildEmptyHashTable();
  }
  return emptyHashTablePromise;
}
function merklePath(id) {
  const path = [];
  let rangeStart = 0, rangeEnd = MERKLE_TREE_END;
  while (rangeEnd - rangeStart > MERKLE_LEAF_SIZE) {
    path.push({ start: rangeStart, end: rangeEnd });
    const mid = Math.floor((rangeStart + rangeEnd) / 2);
    if (id <= mid) {
      rangeEnd = mid;
    } else {
      rangeStart = mid;
    }
  }
  path.push({ start: rangeStart, end: rangeEnd });
  return path;
}
async function buildEmptyHashTable() {
  const hashes = [await hashBucket([])];
  for (let idx = 1; idx <= MERKLE_TREE_DEPTH; idx++) {
    hashes.push(await hashMerkleInternalNode(hashes[idx - 1], hashes[idx - 1]));
  }
  return hashes;
}
function isRangeEmpty(sorted, start, end) {
  let lo = 0, hi = sorted.length;
  while (lo < hi) {
    const mid = lo + hi >>> 1;
    if (sorted[mid].id <= start) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  return lo >= sorted.length || sorted[lo].id > end;
}
function entriesInRange(sorted, start, end) {
  let lo = 0, hi = sorted.length;
  while (lo < hi) {
    const mid = lo + hi >>> 1;
    if (sorted[mid].id <= start) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  const result = [];
  for (let idx = lo; idx < sorted.length && sorted[idx].id <= end; idx++) {
    result.push(sorted[idx]);
  }
  return result;
}
var ClientMerkleTree = class {
  constructor(entries, leafSize) {
    this.entries = entries;
    this.leafSize = leafSize;
  }
  cache = /* @__PURE__ */ new Map();
  hashForRange(start, end) {
    const key = `${start},${end}`;
    const cached = this.cache.get(key);
    if (cached) return cached;
    const computed = this.computeRange(start, end);
    this.cache.set(key, computed);
    return computed;
  }
  async computeRange(start, end) {
    const nodeSize = end - start;
    if (nodeSize <= this.leafSize) {
      return hashBucket(entriesInRange(this.entries, start, end));
    }
    if (isRangeEmpty(this.entries, start, end)) {
      const emptyTable = await getEmptyHashTable();
      const depth = Math.round(Math.log2(nodeSize / this.leafSize));
      return emptyTable[Math.min(MERKLE_TREE_DEPTH, Math.max(0, depth))];
    }
    const mid = Math.floor((start + end) / 2);
    const [leftHash, rightHash] = await Promise.all([
      this.hashForRange(start, mid),
      this.hashForRange(mid, end)
    ]);
    return hashMerkleInternalNode(leftHash, rightHash);
  }
};
function buildEventMerkleTree(entries) {
  const sorted = entries.map((entry) => ({ id: entry.id, updatedAt: entry.updatedAt })).sort((first, second) => first.id - second.id);
  return new ClientMerkleTree(sorted, MERKLE_LEAF_SIZE);
}
function buildObjectMerkleTree(entries) {
  const sorted = entries.map((entry) => ({ id: entry.seq, updatedAt: entry.updatedAt })).sort((first, second) => first.id - second.id);
  return new ClientMerkleTree(sorted, MERKLE_LEAF_SIZE);
}

// ../../cmstr/src/storage/idb/merkle.ts
var BoundMerkleTree = class {
  constructor(store2, topic) {
    this.store = store2;
    this.topic = topic;
  }
  hashForRange(start, end) {
    return this.store.hashForRange(this.topic, start, end);
  }
};
var IDBMerkleStore = class {
  constructor(db, storeName, readSummaries, isRangeEmpty2) {
    this.db = db;
    this.storeName = storeName;
    this.readSummaries = readSummaries;
    this.isRangeEmpty = isRangeEmpty2;
  }
  // Returns a topic-bound view compatible with IMerkleTree for use in merkleDiff.
  forTopic(topic) {
    return new BoundMerkleTree(this, topic);
  }
  async hashForRange(topic, start, end) {
    const cached = await this.db.get(this.storeName, [topic, start, end]);
    if (cached !== void 0) return cached;
    const hash = await this.#computeRange(topic, start, end);
    await this.db.put(this.storeName, hash, [topic, start, end]);
    return hash;
  }
  // Removes all cached hashes on the path from the leaf containing id to the root.
  async invalidatePath(topic, id) {
    const tx = this.db.transaction(this.storeName, "readwrite");
    const store2 = tx.objectStore(this.storeName);
    for (const node of merklePath(id)) {
      store2.delete([topic, node.start, node.end]);
    }
    await tx.done;
  }
  // Invalidates both old and new seq paths in a single transaction — handles objects where seq changes on update.
  async invalidatePaths(topic, newId, oldId) {
    if (oldId === void 0 || oldId === newId) {
      return this.invalidatePath(topic, newId);
    }
    const tx = this.db.transaction(this.storeName, "readwrite");
    const store2 = tx.objectStore(this.storeName);
    for (const node of merklePath(newId)) {
      store2.delete([topic, node.start, node.end]);
    }
    for (const node of merklePath(oldId)) {
      store2.delete([topic, node.start, node.end]);
    }
    await tx.done;
  }
  async #computeRange(topic, start, end) {
    const nodeSize = end - start;
    if (nodeSize <= MERKLE_LEAF_SIZE) {
      const entries = await this.readSummaries(topic, start, end);
      return hashBucket(entries);
    }
    if (await this.isRangeEmpty(topic, start, end)) {
      const emptyTable = await getEmptyHashTable();
      const depth = Math.round(Math.log2(nodeSize / MERKLE_LEAF_SIZE));
      return emptyTable[Math.min(MERKLE_TREE_DEPTH, Math.max(0, depth))];
    }
    const mid = Math.floor((start + end) / 2);
    const leftHash = await this.hashForRange(topic, start, mid);
    const rightHash = await this.hashForRange(topic, mid, end);
    return hashMerkleInternalNode(leftHash, rightHash);
  }
};

// ../../cmstr/src/storage/idb/index.ts
var IDB_VERSION = 3;
var IDB_MERKLE_EVENT_STORE = "merkle-events";
var IDB_MERKLE_OBJECT_STORE = "merkle-objects";
var IDBBackend = class _IDBBackend {
  events;
  objects;
  cursors;
  merkleEvents;
  merkleObjects;
  constructor(db) {
    this.events = new IDBEventStore(db);
    this.objects = new IDBObjectStore2(db);
    this.cursors = new IDBCursorStore(db);
    this.merkleEvents = new IDBMerkleStore(
      db,
      IDB_MERKLE_EVENT_STORE,
      (topic, start, end) => this.events.readEventSummaries(topic, start, end),
      (topic, start, end) => this.events.isEventRangeEmpty(topic, start, end)
    );
    this.merkleObjects = new IDBMerkleStore(
      db,
      IDB_MERKLE_OBJECT_STORE,
      (topic, start, end) => this.objects.readObjectSummaries(topic, start, end),
      (topic, start, end) => this.objects.isObjectRangeEmpty(topic, start, end)
    );
  }
  // Opens (or creates) the named IndexedDB database and returns a ready backend.
  static async open(name) {
    const db = await openDB(name, IDB_VERSION, {
      upgrade(db2, oldVersion, _newVersion, transaction) {
        if (oldVersion === 0) {
          db2.createObjectStore(IDB_EVENT_STORE);
          const objStore = db2.createObjectStore(IDB_OBJECT_STORE);
          objStore.createIndex("by-seq", ["topic", "seq"], { unique: false });
          db2.createObjectStore(IDB_CURSOR_STORE);
          db2.createObjectStore(IDB_MERKLE_EVENT_STORE);
          db2.createObjectStore(IDB_MERKLE_OBJECT_STORE);
          return;
        }
        if (oldVersion < 2) {
          const store2 = transaction.objectStore(IDB_OBJECT_STORE);
          store2.deleteIndex("by-seq");
          store2.createIndex("by-seq", ["topic", "seq"], { unique: false });
        }
        if (oldVersion < 3) {
          db2.deleteObjectStore(IDB_EVENT_STORE);
          db2.createObjectStore(IDB_EVENT_STORE);
          db2.deleteObjectStore(IDB_CURSOR_STORE);
          db2.createObjectStore(IDB_CURSOR_STORE);
          db2.createObjectStore(IDB_MERKLE_EVENT_STORE);
          db2.createObjectStore(IDB_MERKLE_OBJECT_STORE);
        }
      }
    });
    return new _IDBBackend(db);
  }
};

// ../../cmstr/src/storage/idb/scheduler.ts
var SetIntervalScheduler = class {
  handles = /* @__PURE__ */ new Map();
  schedule(id, intervalMs, fn) {
    if (this.handles.has(id)) return;
    const handle = setInterval(() => {
      fn().catch((err) => console.error("[cmstr] unhandled scheduler error", err));
    }, intervalMs);
    this.handles.set(id, handle);
  }
  cancelAll() {
    for (const handle of this.handles.values()) clearInterval(handle);
    this.handles.clear();
  }
};

// ../../cmstr/src/api/commons/statuses.ts
var STATUS_NO_CONTENT = 204;

// ../../cmstr/src/core/sync.ts
function authHeaders(token) {
  return { "Authorization": `Bearer ${token}` };
}
async function postDiffRound(baseUrl, topic, token, nodes) {
  const res = await fetch(`${baseUrl}/diff/${topic}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ nodes })
  });
  if (res.status === STATUS_NO_CONTENT) return { kind: "match" };
  if (!res.ok) throw new Error(`POST /diff/${topic} failed: ${res.status}`);
  const json = await res.json();
  return { kind: "diff", mismatches: json.mismatches };
}
async function merkleDiff(baseUrl, topic, token, tree) {
  const rootHash = await tree.hashForRange(0, MERKLE_TREE_END);
  let frontier = [{ start: 0, end: MERKLE_TREE_END, hash: rootHash }];
  const leafRanges = [];
  while (frontier.length > 0) {
    const response = await postDiffRound(baseUrl, topic, token, frontier);
    if (response.kind === "match") break;
    const nextFrontier = [];
    for (const mismatch of response.mismatches) {
      if (mismatch.isLeaf) {
        leafRanges.push({ start: mismatch.start, end: mismatch.end });
      } else {
        const mid = Math.floor((mismatch.start + mismatch.end) / 2);
        const [leftHash, rightHash] = await Promise.all([
          tree.hashForRange(mismatch.start, mid),
          tree.hashForRange(mid, mismatch.end)
        ]);
        nextFrontier.push({ start: mismatch.start, end: mid, hash: leftHash });
        nextFrontier.push({ start: mid, end: mismatch.end, hash: rightHash });
      }
    }
    frontier = nextFrontier;
  }
  return leafRanges;
}
async function fetchEventRange(baseUrl, topic, token, start, size) {
  const res = await fetch(`${baseUrl}/events/${topic}?start=${start}&size=${size}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(`GET /events/${topic} failed: ${res.status}`);
  const body = await res.json();
  return body.entries ?? [];
}
async function fetchObjectRange(baseUrl, topic, token, start, size) {
  const res = await fetch(`${baseUrl}/objects/${topic}?start=${start}&size=${size}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(`GET /objects/${topic} failed: ${res.status}`);
  const body = await res.json();
  return body.entries ?? [];
}
async function tailEventStream(baseUrl, topic, token, startId, durationMs = TAIL_DURATION_MS) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), durationMs);
  const collected = [];
  try {
    const res = await fetch(`${baseUrl}/events/${topic}?start=${startId}`, {
      headers: { ...authHeaders(token), "Accept": "application/x-ndjson" },
      signal: controller.signal
    });
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (line.trim()) collected.push(JSON.parse(line));
      }
    }
  } catch (err) {
    if (!(err instanceof DOMException && err.name === "AbortError")) throw err;
  } finally {
    clearTimeout(timeout);
  }
  return collected;
}
async function applyEventEntry(backend, topic, entry, skipMerkle = false) {
  await backend.events.updateEvent(topic, entry.id, entry.payload, { createdAt: entry.createdAt, updatedAt: entry.updatedAt });
  if (!skipMerkle) await backend.merkleEvents?.invalidatePath(topic, entry.id);
  return { type: "upsert", topic, entry };
}
async function applyObjectEntry(backend, topic, entry, skipMerkle = false) {
  const existing = !skipMerkle && backend.merkleObjects ? await backend.objects.readObject(topic, entry.id) : void 0;
  const oldSeq = existing?.seq;
  const timestamps = { seq: entry.seq, createdAt: entry.createdAt, updatedAt: entry.updatedAt };
  if (entry.payload === null) {
    await backend.objects.deleteObject(topic, entry.id, timestamps);
  } else {
    await backend.objects.upsertObject(topic, entry.id, entry.payload, timestamps);
  }
  if (!skipMerkle) await backend.merkleObjects?.invalidatePaths(topic, entry.seq, oldSeq);
  if (entry.payload === null) return { type: "delete", topic, id: entry.id };
  return { type: "upsert", topic, entry };
}
async function syncEventTopic(backend, baseUrl, token, topic, tailDurationMs) {
  const cursor = await backend.cursors.getEventCursor(topic);
  const changes = [];
  if (cursor === 0) {
    let start = 1;
    let maxId2 = 0;
    while (true) {
      const entries = await fetchEventRange(baseUrl, topic, token, start, DEFAULT_FETCH_PAGE_SIZE);
      for (const entry of entries) {
        changes.push(await applyEventEntry(backend, topic, entry, true));
        maxId2 = Math.max(maxId2, entry.id);
      }
      if (entries.length < DEFAULT_FETCH_PAGE_SIZE) break;
      start = entries[entries.length - 1].id + 1;
    }
    const tailed2 = await tailEventStream(baseUrl, topic, token, maxId2 + 1, tailDurationMs);
    for (const entry of tailed2) {
      changes.push(await applyEventEntry(backend, topic, entry, true));
      maxId2 = Math.max(maxId2, entry.id);
    }
    if (maxId2 > 0) await backend.cursors.setEventCursor(topic, maxId2);
    return changes;
  }
  const tree = backend.merkleEvents ? backend.merkleEvents.forTopic(topic) : buildEventMerkleTree(await backend.events.readEvents(topic, {}) ?? []);
  const leafRanges = await merkleDiff(baseUrl, topic, token, tree);
  if (leafRanges.length === 0) return changes;
  let maxId = cursor;
  for (const range of leafRanges) {
    const entries = await fetchEventRange(baseUrl, topic, token, range.start + 1, MERKLE_LEAF_SIZE);
    for (const entry of entries) {
      changes.push(await applyEventEntry(backend, topic, entry));
      maxId = Math.max(maxId, entry.id);
    }
  }
  const tailed = await tailEventStream(baseUrl, topic, token, maxId + 1, tailDurationMs);
  for (const entry of tailed) {
    changes.push(await applyEventEntry(backend, topic, entry));
    maxId = Math.max(maxId, entry.id);
  }
  if (maxId > 0) await backend.cursors.setEventCursor(topic, maxId);
  return changes;
}
async function syncObjectTopic(backend, baseUrl, token, topic) {
  const cursor = await backend.cursors.getObjectCursor(topic);
  const changes = [];
  if (cursor === 0) {
    let start = 1;
    let maxSeq2 = 0;
    while (true) {
      const entries = await fetchObjectRange(baseUrl, topic, token, start, DEFAULT_FETCH_PAGE_SIZE);
      for (const entry of entries) {
        changes.push(await applyObjectEntry(backend, topic, entry, true));
        maxSeq2 = Math.max(maxSeq2, entry.seq);
      }
      if (entries.length < DEFAULT_FETCH_PAGE_SIZE) break;
      start = entries[entries.length - 1].seq + 1;
    }
    if (maxSeq2 > 0) await backend.cursors.setObjectCursor(topic, maxSeq2);
    return changes;
  }
  const tree = backend.merkleObjects ? backend.merkleObjects.forTopic(topic) : buildObjectMerkleTree(await backend.objects.readObjectsBySeq(topic, {}) ?? []);
  const leafRanges = await merkleDiff(baseUrl, topic, token, tree);
  if (leafRanges.length === 0) return changes;
  let maxSeq = cursor;
  for (const range of leafRanges) {
    const entries = await fetchObjectRange(baseUrl, topic, token, range.start + 1, MERKLE_LEAF_SIZE);
    for (const entry of entries) {
      changes.push(await applyObjectEntry(backend, topic, entry));
      maxSeq = Math.max(maxSeq, entry.seq);
    }
  }
  if (maxSeq > 0) await backend.cursors.setObjectCursor(topic, maxSeq);
  return changes;
}

// ../../cmstr/src/commons/logger.ts
var NoopLogger = class {
  info(_message, _request, _data) {
  }
  error(_message, _request, _data) {
  }
};

// ../../cmstr/src/core/node.ts
var CommonStorageNode = class {
  backend;
  scheduler;
  logger;
  subscriptions;
  watchers = /* @__PURE__ */ new Map();
  constructor(services, subscriptions = {}) {
    this.backend = services.backend;
    this.scheduler = services.scheduler;
    this.logger = services.logger ?? new NoopLogger();
    const events = (subscriptions.events ?? []).map((sub) => ({ topicType: "event", ...sub }));
    const objects = (subscriptions.objects ?? []).map((sub) => ({ topicType: "object", ...sub }));
    this.subscriptions = [...events, ...objects];
  }
  // -- Lifecycle --
  start() {
    for (const sub of this.subscriptions) {
      this.scheduler.schedule(`cmstr-sync-${sub.topic}`, sub.intervalMs, () => this.sync(sub.topic));
    }
  }
  stop() {
    this.scheduler.cancelAll();
  }
  // -- Sync (also callable manually) --
  async sync(topic) {
    const sub = this.subscriptions.find((declared) => declared.topic === topic);
    if (!sub) return;
    if (!sub.token) return;
    try {
      const changes = sub.topicType === "event" ? await syncEventTopic(this.backend, sub.remoteUrl, sub.token, topic, sub.tailDurationMs) : await syncObjectTopic(this.backend, sub.remoteUrl, sub.token, topic);
      for (const change of changes) this.#emit(change);
    } catch (err) {
      this.logger.error("sync failed", void 0, { topic, error: String(err) });
    }
  }
  // -- Event topic reads --
  getEvent(topic, id) {
    return this.backend.events.readEvent(topic, id);
  }
  getEvents(topic, opts = {}) {
    return this.backend.events.readEvents(topic, opts);
  }
  // -- Event topic writes (optimistic: local first, then push to remote) --
  async postEvent(topic, payload) {
    const entry = await this.backend.events.writeEvent(topic, payload);
    if (entry) {
      this.#emit({ type: "upsert", topic, entry });
      await this.#pushEvent(topic, "POST", payload);
    }
    return entry;
  }
  async putEvent(topic, id, payload) {
    const result = await this.backend.events.updateEvent(topic, id, payload);
    if (result) {
      this.#emit({ type: "upsert", topic, entry: result.entry });
      await this.#pushEvent(topic, "PUT", payload, id);
    }
    return result?.entry ?? null;
  }
  // -- Object topic reads --
  getObject(topic, id) {
    return this.backend.objects.readObject(topic, id);
  }
  getObjects(topic, opts = {}) {
    return this.backend.objects.readObjectsBySeq(topic, opts);
  }
  // -- Object topic writes (optimistic: local first, then push to remote) --
  async putObject(topic, id, payload) {
    const entry = await this.backend.objects.upsertObject(topic, id, payload);
    if (entry) {
      this.#emit({ type: "upsert", topic, entry });
      await this.#pushObject(topic, id, "PUT", payload);
    }
    return entry;
  }
  async deleteObject(topic, id) {
    const entry = await this.backend.objects.deleteObject(topic, id);
    if (entry) {
      this.#emit({ type: "delete", topic, id });
      await this.#pushObject(topic, id, "DELETE");
    }
    return entry;
  }
  // -- Change observation --
  // Async generator that yields ChangeEvents as they are emitted by writes and incoming sync.
  async *watch(topic) {
    const queue = [];
    let resolve = null;
    const handler = (event) => {
      queue.push(event);
      resolve?.();
      resolve = null;
    };
    if (!this.watchers.has(topic)) this.watchers.set(topic, []);
    this.watchers.get(topic).push(handler);
    try {
      while (true) {
        while (queue.length > 0) yield queue.shift();
        await new Promise((res) => {
          resolve = res;
        });
      }
    } finally {
      const handlers = this.watchers.get(topic);
      if (handlers) {
        const idx = handlers.indexOf(handler);
        if (idx !== -1) handlers.splice(idx, 1);
      }
    }
  }
  // -- Internal --
  #emit(event) {
    const handlers = this.watchers.get(event.topic) ?? [];
    for (const handler of handlers) handler(event);
  }
  async #pushEvent(topic, method, payload, id) {
    const sub = this.subscriptions.find((declared) => declared.topic === topic);
    if (!sub) return;
    const url = method === "POST" ? `${sub.remoteUrl}/events/${topic}` : `${sub.remoteUrl}/events/${topic}/${id}`;
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${sub.token}` },
      body: JSON.stringify({ payload })
    }).catch((err) => {
      this.logger.error("event push failed", void 0, { topic, method, error: String(err) });
    });
  }
  async #pushObject(topic, id, method, payload) {
    const sub = this.subscriptions.find((declared) => declared.topic === topic);
    if (!sub) return;
    const url = `${sub.remoteUrl}/objects/${topic}/${id}`;
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${sub.token}` },
      body: method === "PUT" ? JSON.stringify({ payload }) : void 0
    }).catch((err) => {
      this.logger.error("object push failed", void 0, { topic, id, method, error: String(err) });
    });
  }
};

// ts/replay.ts
function toBookmark(event) {
  const payload = event.payload;
  if (!payload?.url) return null;
  return {
    id: String(event.id),
    url: payload.url,
    created_at: payload.createdAt ?? new Date(event.createdAt).toISOString(),
    title: payload.title,
    tags: payload.tags,
    description: payload.description
  };
}
function replayEvents(events) {
  const bookmarks = /* @__PURE__ */ new Map();
  const sorted = [...events].sort((first, second) => first.id - second.id);
  for (const event of sorted) {
    const bookmark = toBookmark(event);
    if (bookmark) bookmarks.set(bookmark.id, bookmark);
  }
  return bookmarks;
}

// node_modules/minisearch/dist/es/index.js
var ENTRIES = "ENTRIES";
var KEYS = "KEYS";
var VALUES = "VALUES";
var LEAF = "";
var TreeIterator = class {
  constructor(set, type) {
    const node = set._tree;
    const keys = Array.from(node.keys());
    this.set = set;
    this._type = type;
    this._path = keys.length > 0 ? [{ node, keys }] : [];
  }
  next() {
    const value = this.dive();
    this.backtrack();
    return value;
  }
  dive() {
    if (this._path.length === 0) {
      return { done: true, value: void 0 };
    }
    const { node, keys } = last$1(this._path);
    if (last$1(keys) === LEAF) {
      return { done: false, value: this.result() };
    }
    const child = node.get(last$1(keys));
    this._path.push({ node: child, keys: Array.from(child.keys()) });
    return this.dive();
  }
  backtrack() {
    if (this._path.length === 0) {
      return;
    }
    const keys = last$1(this._path).keys;
    keys.pop();
    if (keys.length > 0) {
      return;
    }
    this._path.pop();
    this.backtrack();
  }
  key() {
    return this.set._prefix + this._path.map(({ keys }) => last$1(keys)).filter((key) => key !== LEAF).join("");
  }
  value() {
    return last$1(this._path).node.get(LEAF);
  }
  result() {
    switch (this._type) {
      case VALUES:
        return this.value();
      case KEYS:
        return this.key();
      default:
        return [this.key(), this.value()];
    }
  }
  [Symbol.iterator]() {
    return this;
  }
};
var last$1 = (array) => {
  return array[array.length - 1];
};
var fuzzySearch = (node, query, maxDistance) => {
  const results = /* @__PURE__ */ new Map();
  if (query === void 0)
    return results;
  const n = query.length + 1;
  const m14 = n + maxDistance;
  const matrix = new Uint8Array(m14 * n).fill(maxDistance + 1);
  for (let j = 0; j < n; ++j)
    matrix[j] = j;
  for (let i = 1; i < m14; ++i)
    matrix[i * n] = i;
  recurse(node, query, maxDistance, results, matrix, 1, n, "");
  return results;
};
var recurse = (node, query, maxDistance, results, matrix, m14, n, prefix) => {
  const offset = m14 * n;
  key: for (const key of node.keys()) {
    if (key === LEAF) {
      const distance = matrix[offset - 1];
      if (distance <= maxDistance) {
        results.set(prefix, [node.get(key), distance]);
      }
    } else {
      let i = m14;
      for (let pos = 0; pos < key.length; ++pos, ++i) {
        const char = key[pos];
        const thisRowOffset = n * i;
        const prevRowOffset = thisRowOffset - n;
        let minDistance = matrix[thisRowOffset];
        const jmin = Math.max(0, i - maxDistance - 1);
        const jmax = Math.min(n - 1, i + maxDistance);
        for (let j = jmin; j < jmax; ++j) {
          const different = char !== query[j];
          const rpl = matrix[prevRowOffset + j] + +different;
          const del = matrix[prevRowOffset + j + 1] + 1;
          const ins = matrix[thisRowOffset + j] + 1;
          const dist = matrix[thisRowOffset + j + 1] = Math.min(rpl, del, ins);
          if (dist < minDistance)
            minDistance = dist;
        }
        if (minDistance > maxDistance) {
          continue key;
        }
      }
      recurse(node.get(key), query, maxDistance, results, matrix, i, n, prefix + key);
    }
  }
};
var SearchableMap = class _SearchableMap {
  /**
   * The constructor is normally called without arguments, creating an empty
   * map. In order to create a {@link SearchableMap} from an iterable or from an
   * object, check {@link SearchableMap.from} and {@link
   * SearchableMap.fromObject}.
   *
   * The constructor arguments are for internal use, when creating derived
   * mutable views of a map at a prefix.
   */
  constructor(tree = /* @__PURE__ */ new Map(), prefix = "") {
    this._size = void 0;
    this._tree = tree;
    this._prefix = prefix;
  }
  /**
   * Creates and returns a mutable view of this {@link SearchableMap},
   * containing only entries that share the given prefix.
   *
   * ### Usage:
   *
   * ```javascript
   * let map = new SearchableMap()
   * map.set("unicorn", 1)
   * map.set("universe", 2)
   * map.set("university", 3)
   * map.set("unique", 4)
   * map.set("hello", 5)
   *
   * let uni = map.atPrefix("uni")
   * uni.get("unique") // => 4
   * uni.get("unicorn") // => 1
   * uni.get("hello") // => undefined
   *
   * let univer = map.atPrefix("univer")
   * univer.get("unique") // => undefined
   * univer.get("universe") // => 2
   * univer.get("university") // => 3
   * ```
   *
   * @param prefix  The prefix
   * @return A {@link SearchableMap} representing a mutable view of the original
   * Map at the given prefix
   */
  atPrefix(prefix) {
    if (!prefix.startsWith(this._prefix)) {
      throw new Error("Mismatched prefix");
    }
    const [node, path] = trackDown(this._tree, prefix.slice(this._prefix.length));
    if (node === void 0) {
      const [parentNode, key] = last(path);
      for (const k of parentNode.keys()) {
        if (k !== LEAF && k.startsWith(key)) {
          const node2 = /* @__PURE__ */ new Map();
          node2.set(k.slice(key.length), parentNode.get(k));
          return new _SearchableMap(node2, prefix);
        }
      }
    }
    return new _SearchableMap(node, prefix);
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/clear
   */
  clear() {
    this._size = void 0;
    this._tree.clear();
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/delete
   * @param key  Key to delete
   */
  delete(key) {
    this._size = void 0;
    return remove(this._tree, key);
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/entries
   * @return An iterator iterating through `[key, value]` entries.
   */
  entries() {
    return new TreeIterator(this, ENTRIES);
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/forEach
   * @param fn  Iteration function
   */
  forEach(fn) {
    for (const [key, value] of this) {
      fn(key, value, this);
    }
  }
  /**
   * Returns a Map of all the entries that have a key within the given edit
   * distance from the search key. The keys of the returned Map are the matching
   * keys, while the values are two-element arrays where the first element is
   * the value associated to the key, and the second is the edit distance of the
   * key to the search key.
   *
   * ### Usage:
   *
   * ```javascript
   * let map = new SearchableMap()
   * map.set('hello', 'world')
   * map.set('hell', 'yeah')
   * map.set('ciao', 'mondo')
   *
   * // Get all entries that match the key 'hallo' with a maximum edit distance of 2
   * map.fuzzyGet('hallo', 2)
   * // => Map(2) { 'hello' => ['world', 1], 'hell' => ['yeah', 2] }
   *
   * // In the example, the "hello" key has value "world" and edit distance of 1
   * // (change "e" to "a"), the key "hell" has value "yeah" and edit distance of 2
   * // (change "e" to "a", delete "o")
   * ```
   *
   * @param key  The search key
   * @param maxEditDistance  The maximum edit distance (Levenshtein)
   * @return A Map of the matching keys to their value and edit distance
   */
  fuzzyGet(key, maxEditDistance) {
    return fuzzySearch(this._tree, key, maxEditDistance);
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/get
   * @param key  Key to get
   * @return Value associated to the key, or `undefined` if the key is not
   * found.
   */
  get(key) {
    const node = lookup(this._tree, key);
    return node !== void 0 ? node.get(LEAF) : void 0;
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/has
   * @param key  Key
   * @return True if the key is in the map, false otherwise
   */
  has(key) {
    const node = lookup(this._tree, key);
    return node !== void 0 && node.has(LEAF);
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/keys
   * @return An `Iterable` iterating through keys
   */
  keys() {
    return new TreeIterator(this, KEYS);
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/set
   * @param key  Key to set
   * @param value  Value to associate to the key
   * @return The {@link SearchableMap} itself, to allow chaining
   */
  set(key, value) {
    if (typeof key !== "string") {
      throw new Error("key must be a string");
    }
    this._size = void 0;
    const node = createPath(this._tree, key);
    node.set(LEAF, value);
    return this;
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/size
   */
  get size() {
    if (this._size) {
      return this._size;
    }
    this._size = 0;
    const iter = this.entries();
    while (!iter.next().done)
      this._size += 1;
    return this._size;
  }
  /**
   * Updates the value at the given key using the provided function. The function
   * is called with the current value at the key, and its return value is used as
   * the new value to be set.
   *
   * ### Example:
   *
   * ```javascript
   * // Increment the current value by one
   * searchableMap.update('somekey', (currentValue) => currentValue == null ? 0 : currentValue + 1)
   * ```
   *
   * If the value at the given key is or will be an object, it might not require
   * re-assignment. In that case it is better to use `fetch()`, because it is
   * faster.
   *
   * @param key  The key to update
   * @param fn  The function used to compute the new value from the current one
   * @return The {@link SearchableMap} itself, to allow chaining
   */
  update(key, fn) {
    if (typeof key !== "string") {
      throw new Error("key must be a string");
    }
    this._size = void 0;
    const node = createPath(this._tree, key);
    node.set(LEAF, fn(node.get(LEAF)));
    return this;
  }
  /**
   * Fetches the value of the given key. If the value does not exist, calls the
   * given function to create a new value, which is inserted at the given key
   * and subsequently returned.
   *
   * ### Example:
   *
   * ```javascript
   * const map = searchableMap.fetch('somekey', () => new Map())
   * map.set('foo', 'bar')
   * ```
   *
   * @param key  The key to update
   * @param initial  A function that creates a new value if the key does not exist
   * @return The existing or new value at the given key
   */
  fetch(key, initial) {
    if (typeof key !== "string") {
      throw new Error("key must be a string");
    }
    this._size = void 0;
    const node = createPath(this._tree, key);
    let value = node.get(LEAF);
    if (value === void 0) {
      node.set(LEAF, value = initial());
    }
    return value;
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/values
   * @return An `Iterable` iterating through values.
   */
  values() {
    return new TreeIterator(this, VALUES);
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/@@iterator
   */
  [Symbol.iterator]() {
    return this.entries();
  }
  /**
   * Creates a {@link SearchableMap} from an `Iterable` of entries
   *
   * @param entries  Entries to be inserted in the {@link SearchableMap}
   * @return A new {@link SearchableMap} with the given entries
   */
  static from(entries) {
    const tree = new _SearchableMap();
    for (const [key, value] of entries) {
      tree.set(key, value);
    }
    return tree;
  }
  /**
   * Creates a {@link SearchableMap} from the iterable properties of a JavaScript object
   *
   * @param object  Object of entries for the {@link SearchableMap}
   * @return A new {@link SearchableMap} with the given entries
   */
  static fromObject(object) {
    return _SearchableMap.from(Object.entries(object));
  }
};
var trackDown = (tree, key, path = []) => {
  if (key.length === 0 || tree == null) {
    return [tree, path];
  }
  for (const k of tree.keys()) {
    if (k !== LEAF && key.startsWith(k)) {
      path.push([tree, k]);
      return trackDown(tree.get(k), key.slice(k.length), path);
    }
  }
  path.push([tree, key]);
  return trackDown(void 0, "", path);
};
var lookup = (tree, key) => {
  if (key.length === 0 || tree == null) {
    return tree;
  }
  for (const k of tree.keys()) {
    if (k !== LEAF && key.startsWith(k)) {
      return lookup(tree.get(k), key.slice(k.length));
    }
  }
};
var createPath = (node, key) => {
  const keyLength = key.length;
  outer: for (let pos = 0; node && pos < keyLength; ) {
    for (const k of node.keys()) {
      if (k !== LEAF && key[pos] === k[0]) {
        const len = Math.min(keyLength - pos, k.length);
        let offset = 1;
        while (offset < len && key[pos + offset] === k[offset])
          ++offset;
        const child2 = node.get(k);
        if (offset === k.length) {
          node = child2;
        } else {
          const intermediate = /* @__PURE__ */ new Map();
          intermediate.set(k.slice(offset), child2);
          node.set(key.slice(pos, pos + offset), intermediate);
          node.delete(k);
          node = intermediate;
        }
        pos += offset;
        continue outer;
      }
    }
    const child = /* @__PURE__ */ new Map();
    node.set(key.slice(pos), child);
    return child;
  }
  return node;
};
var remove = (tree, key) => {
  const [node, path] = trackDown(tree, key);
  if (node === void 0) {
    return;
  }
  node.delete(LEAF);
  if (node.size === 0) {
    cleanup(path);
  } else if (node.size === 1) {
    const [key2, value] = node.entries().next().value;
    merge(path, key2, value);
  }
};
var cleanup = (path) => {
  if (path.length === 0) {
    return;
  }
  const [node, key] = last(path);
  node.delete(key);
  if (node.size === 0) {
    cleanup(path.slice(0, -1));
  } else if (node.size === 1) {
    const [key2, value] = node.entries().next().value;
    if (key2 !== LEAF) {
      merge(path.slice(0, -1), key2, value);
    }
  }
};
var merge = (path, key, value) => {
  if (path.length === 0) {
    return;
  }
  const [node, nodeKey] = last(path);
  node.set(nodeKey + key, value);
  node.delete(nodeKey);
};
var last = (array) => {
  return array[array.length - 1];
};
var OR = "or";
var AND = "and";
var AND_NOT = "and_not";
var MiniSearch = class _MiniSearch {
  /**
   * @param options  Configuration options
   *
   * ### Examples:
   *
   * ```javascript
   * // Create a search engine that indexes the 'title' and 'text' fields of your
   * // documents:
   * const miniSearch = new MiniSearch({ fields: ['title', 'text'] })
   * ```
   *
   * ### ID Field:
   *
   * ```javascript
   * // Your documents are assumed to include a unique 'id' field, but if you want
   * // to use a different field for document identification, you can set the
   * // 'idField' option:
   * const miniSearch = new MiniSearch({ idField: 'key', fields: ['title', 'text'] })
   * ```
   *
   * ### Options and defaults:
   *
   * ```javascript
   * // The full set of options (here with their default value) is:
   * const miniSearch = new MiniSearch({
   *   // idField: field that uniquely identifies a document
   *   idField: 'id',
   *
   *   // extractField: function used to get the value of a field in a document.
   *   // By default, it assumes the document is a flat object with field names as
   *   // property keys and field values as string property values, but custom logic
   *   // can be implemented by setting this option to a custom extractor function.
   *   extractField: (document, fieldName) => document[fieldName],
   *
   *   // tokenize: function used to split fields into individual terms. By
   *   // default, it is also used to tokenize search queries, unless a specific
   *   // `tokenize` search option is supplied. When tokenizing an indexed field,
   *   // the field name is passed as the second argument.
   *   tokenize: (string, _fieldName) => string.split(SPACE_OR_PUNCTUATION),
   *
   *   // processTerm: function used to process each tokenized term before
   *   // indexing. It can be used for stemming and normalization. Return a falsy
   *   // value in order to discard a term. By default, it is also used to process
   *   // search queries, unless a specific `processTerm` option is supplied as a
   *   // search option. When processing a term from a indexed field, the field
   *   // name is passed as the second argument.
   *   processTerm: (term, _fieldName) => term.toLowerCase(),
   *
   *   // searchOptions: default search options, see the `search` method for
   *   // details
   *   searchOptions: undefined,
   *
   *   // fields: document fields to be indexed. Mandatory, but not set by default
   *   fields: undefined
   *
   *   // storeFields: document fields to be stored and returned as part of the
   *   // search results.
   *   storeFields: []
   * })
   * ```
   */
  constructor(options) {
    if ((options === null || options === void 0 ? void 0 : options.fields) == null) {
      throw new Error('MiniSearch: option "fields" must be provided');
    }
    const autoVacuum = options.autoVacuum == null || options.autoVacuum === true ? defaultAutoVacuumOptions : options.autoVacuum;
    this._options = {
      ...defaultOptions,
      ...options,
      autoVacuum,
      searchOptions: { ...defaultSearchOptions, ...options.searchOptions || {} },
      autoSuggestOptions: { ...defaultAutoSuggestOptions, ...options.autoSuggestOptions || {} }
    };
    this._index = new SearchableMap();
    this._documentCount = 0;
    this._documentIds = /* @__PURE__ */ new Map();
    this._idToShortId = /* @__PURE__ */ new Map();
    this._fieldIds = {};
    this._fieldLength = /* @__PURE__ */ new Map();
    this._avgFieldLength = [];
    this._nextId = 0;
    this._storedFields = /* @__PURE__ */ new Map();
    this._dirtCount = 0;
    this._currentVacuum = null;
    this._enqueuedVacuum = null;
    this._enqueuedVacuumConditions = defaultVacuumConditions;
    this.addFields(this._options.fields);
  }
  /**
   * Adds a document to the index
   *
   * @param document  The document to be indexed
   */
  add(document2) {
    const { extractField, stringifyField, tokenize, processTerm, fields, idField } = this._options;
    const id = extractField(document2, idField);
    if (id == null) {
      throw new Error(`MiniSearch: document does not have ID field "${idField}"`);
    }
    if (this._idToShortId.has(id)) {
      throw new Error(`MiniSearch: duplicate ID ${id}`);
    }
    const shortDocumentId = this.addDocumentId(id);
    this.saveStoredFields(shortDocumentId, document2);
    for (const field of fields) {
      const fieldValue = extractField(document2, field);
      if (fieldValue == null)
        continue;
      const tokens = tokenize(stringifyField(fieldValue, field), field);
      const fieldId = this._fieldIds[field];
      const uniqueTerms = new Set(tokens).size;
      this.addFieldLength(shortDocumentId, fieldId, this._documentCount - 1, uniqueTerms);
      for (const term of tokens) {
        const processedTerm = processTerm(term, field);
        if (Array.isArray(processedTerm)) {
          for (const t of processedTerm) {
            this.addTerm(fieldId, shortDocumentId, t);
          }
        } else if (processedTerm) {
          this.addTerm(fieldId, shortDocumentId, processedTerm);
        }
      }
    }
  }
  /**
   * Adds all the given documents to the index
   *
   * @param documents  An array of documents to be indexed
   */
  addAll(documents) {
    for (const document2 of documents)
      this.add(document2);
  }
  /**
   * Adds all the given documents to the index asynchronously.
   *
   * Returns a promise that resolves (to `undefined`) when the indexing is done.
   * This method is useful when index many documents, to avoid blocking the main
   * thread. The indexing is performed asynchronously and in chunks.
   *
   * @param documents  An array of documents to be indexed
   * @param options  Configuration options
   * @return A promise resolving to `undefined` when the indexing is done
   */
  addAllAsync(documents, options = {}) {
    const { chunkSize = 10 } = options;
    const acc = { chunk: [], promise: Promise.resolve() };
    const { chunk, promise } = documents.reduce(({ chunk: chunk2, promise: promise2 }, document2, i) => {
      chunk2.push(document2);
      if ((i + 1) % chunkSize === 0) {
        return {
          chunk: [],
          promise: promise2.then(() => new Promise((resolve) => setTimeout(resolve, 0))).then(() => this.addAll(chunk2))
        };
      } else {
        return { chunk: chunk2, promise: promise2 };
      }
    }, acc);
    return promise.then(() => this.addAll(chunk));
  }
  /**
   * Removes the given document from the index.
   *
   * The document to remove must NOT have changed between indexing and removal,
   * otherwise the index will be corrupted.
   *
   * This method requires passing the full document to be removed (not just the
   * ID), and immediately removes the document from the inverted index, allowing
   * memory to be released. A convenient alternative is {@link
   * MiniSearch#discard}, which needs only the document ID, and has the same
   * visible effect, but delays cleaning up the index until the next vacuuming.
   *
   * @param document  The document to be removed
   */
  remove(document2) {
    const { tokenize, processTerm, extractField, stringifyField, fields, idField } = this._options;
    const id = extractField(document2, idField);
    if (id == null) {
      throw new Error(`MiniSearch: document does not have ID field "${idField}"`);
    }
    const shortId = this._idToShortId.get(id);
    if (shortId == null) {
      throw new Error(`MiniSearch: cannot remove document with ID ${id}: it is not in the index`);
    }
    for (const field of fields) {
      const fieldValue = extractField(document2, field);
      if (fieldValue == null)
        continue;
      const tokens = tokenize(stringifyField(fieldValue, field), field);
      const fieldId = this._fieldIds[field];
      const uniqueTerms = new Set(tokens).size;
      this.removeFieldLength(shortId, fieldId, this._documentCount, uniqueTerms);
      for (const term of tokens) {
        const processedTerm = processTerm(term, field);
        if (Array.isArray(processedTerm)) {
          for (const t of processedTerm) {
            this.removeTerm(fieldId, shortId, t);
          }
        } else if (processedTerm) {
          this.removeTerm(fieldId, shortId, processedTerm);
        }
      }
    }
    this._storedFields.delete(shortId);
    this._documentIds.delete(shortId);
    this._idToShortId.delete(id);
    this._fieldLength.delete(shortId);
    this._documentCount -= 1;
  }
  /**
   * Removes all the given documents from the index. If called with no arguments,
   * it removes _all_ documents from the index.
   *
   * @param documents  The documents to be removed. If this argument is omitted,
   * all documents are removed. Note that, for removing all documents, it is
   * more efficient to call this method with no arguments than to pass all
   * documents.
   */
  removeAll(documents) {
    if (documents) {
      for (const document2 of documents)
        this.remove(document2);
    } else if (arguments.length > 0) {
      throw new Error("Expected documents to be present. Omit the argument to remove all documents.");
    } else {
      this._index = new SearchableMap();
      this._documentCount = 0;
      this._documentIds = /* @__PURE__ */ new Map();
      this._idToShortId = /* @__PURE__ */ new Map();
      this._fieldLength = /* @__PURE__ */ new Map();
      this._avgFieldLength = [];
      this._storedFields = /* @__PURE__ */ new Map();
      this._nextId = 0;
    }
  }
  /**
   * Discards the document with the given ID, so it won't appear in search results
   *
   * It has the same visible effect of {@link MiniSearch.remove} (both cause the
   * document to stop appearing in searches), but a different effect on the
   * internal data structures:
   *
   *   - {@link MiniSearch#remove} requires passing the full document to be
   *   removed as argument, and removes it from the inverted index immediately.
   *
   *   - {@link MiniSearch#discard} instead only needs the document ID, and
   *   works by marking the current version of the document as discarded, so it
   *   is immediately ignored by searches. This is faster and more convenient
   *   than {@link MiniSearch#remove}, but the index is not immediately
   *   modified. To take care of that, vacuuming is performed after a certain
   *   number of documents are discarded, cleaning up the index and allowing
   *   memory to be released.
   *
   * After discarding a document, it is possible to re-add a new version, and
   * only the new version will appear in searches. In other words, discarding
   * and re-adding a document works exactly like removing and re-adding it. The
   * {@link MiniSearch.replace} method can also be used to replace a document
   * with a new version.
   *
   * #### Details about vacuuming
   *
   * Repetite calls to this method would leave obsolete document references in
   * the index, invisible to searches. Two mechanisms take care of cleaning up:
   * clean up during search, and vacuuming.
   *
   *   - Upon search, whenever a discarded ID is found (and ignored for the
   *   results), references to the discarded document are removed from the
   *   inverted index entries for the search terms. This ensures that subsequent
   *   searches for the same terms do not need to skip these obsolete references
   *   again.
   *
   *   - In addition, vacuuming is performed automatically by default (see the
   *   `autoVacuum` field in {@link Options}) after a certain number of
   *   documents are discarded. Vacuuming traverses all terms in the index,
   *   cleaning up all references to discarded documents. Vacuuming can also be
   *   triggered manually by calling {@link MiniSearch#vacuum}.
   *
   * @param id  The ID of the document to be discarded
   */
  discard(id) {
    const shortId = this._idToShortId.get(id);
    if (shortId == null) {
      throw new Error(`MiniSearch: cannot discard document with ID ${id}: it is not in the index`);
    }
    this._idToShortId.delete(id);
    this._documentIds.delete(shortId);
    this._storedFields.delete(shortId);
    (this._fieldLength.get(shortId) || []).forEach((fieldLength, fieldId) => {
      this.removeFieldLength(shortId, fieldId, this._documentCount, fieldLength);
    });
    this._fieldLength.delete(shortId);
    this._documentCount -= 1;
    this._dirtCount += 1;
    this.maybeAutoVacuum();
  }
  maybeAutoVacuum() {
    if (this._options.autoVacuum === false) {
      return;
    }
    const { minDirtFactor, minDirtCount, batchSize, batchWait } = this._options.autoVacuum;
    this.conditionalVacuum({ batchSize, batchWait }, { minDirtCount, minDirtFactor });
  }
  /**
   * Discards the documents with the given IDs, so they won't appear in search
   * results
   *
   * It is equivalent to calling {@link MiniSearch#discard} for all the given
   * IDs, but with the optimization of triggering at most one automatic
   * vacuuming at the end.
   *
   * Note: to remove all documents from the index, it is faster and more
   * convenient to call {@link MiniSearch.removeAll} with no argument, instead
   * of passing all IDs to this method.
   */
  discardAll(ids) {
    const autoVacuum = this._options.autoVacuum;
    try {
      this._options.autoVacuum = false;
      for (const id of ids) {
        this.discard(id);
      }
    } finally {
      this._options.autoVacuum = autoVacuum;
    }
    this.maybeAutoVacuum();
  }
  /**
   * It replaces an existing document with the given updated version
   *
   * It works by discarding the current version and adding the updated one, so
   * it is functionally equivalent to calling {@link MiniSearch#discard}
   * followed by {@link MiniSearch#add}. The ID of the updated document should
   * be the same as the original one.
   *
   * Since it uses {@link MiniSearch#discard} internally, this method relies on
   * vacuuming to clean up obsolete document references from the index, allowing
   * memory to be released (see {@link MiniSearch#discard}).
   *
   * @param updatedDocument  The updated document to replace the old version
   * with
   */
  replace(updatedDocument) {
    const { idField, extractField } = this._options;
    const id = extractField(updatedDocument, idField);
    this.discard(id);
    this.add(updatedDocument);
  }
  /**
   * Triggers a manual vacuuming, cleaning up references to discarded documents
   * from the inverted index
   *
   * Vacuuming is only useful for applications that use the {@link
   * MiniSearch#discard} or {@link MiniSearch#replace} methods.
   *
   * By default, vacuuming is performed automatically when needed (controlled by
   * the `autoVacuum` field in {@link Options}), so there is usually no need to
   * call this method, unless one wants to make sure to perform vacuuming at a
   * specific moment.
   *
   * Vacuuming traverses all terms in the inverted index in batches, and cleans
   * up references to discarded documents from the posting list, allowing memory
   * to be released.
   *
   * The method takes an optional object as argument with the following keys:
   *
   *   - `batchSize`: the size of each batch (1000 by default)
   *
   *   - `batchWait`: the number of milliseconds to wait between batches (10 by
   *   default)
   *
   * On large indexes, vacuuming could have a non-negligible cost: batching
   * avoids blocking the thread for long, diluting this cost so that it is not
   * negatively affecting the application. Nonetheless, this method should only
   * be called when necessary, and relying on automatic vacuuming is usually
   * better.
   *
   * It returns a promise that resolves (to undefined) when the clean up is
   * completed. If vacuuming is already ongoing at the time this method is
   * called, a new one is enqueued immediately after the ongoing one, and a
   * corresponding promise is returned. However, no more than one vacuuming is
   * enqueued on top of the ongoing one, even if this method is called more
   * times (enqueuing multiple ones would be useless).
   *
   * @param options  Configuration options for the batch size and delay. See
   * {@link VacuumOptions}.
   */
  vacuum(options = {}) {
    return this.conditionalVacuum(options);
  }
  conditionalVacuum(options, conditions) {
    if (this._currentVacuum) {
      this._enqueuedVacuumConditions = this._enqueuedVacuumConditions && conditions;
      if (this._enqueuedVacuum != null) {
        return this._enqueuedVacuum;
      }
      this._enqueuedVacuum = this._currentVacuum.then(() => {
        const conditions2 = this._enqueuedVacuumConditions;
        this._enqueuedVacuumConditions = defaultVacuumConditions;
        return this.performVacuuming(options, conditions2);
      });
      return this._enqueuedVacuum;
    }
    if (this.vacuumConditionsMet(conditions) === false) {
      return Promise.resolve();
    }
    this._currentVacuum = this.performVacuuming(options);
    return this._currentVacuum;
  }
  async performVacuuming(options, conditions) {
    const initialDirtCount = this._dirtCount;
    if (this.vacuumConditionsMet(conditions)) {
      const batchSize = options.batchSize || defaultVacuumOptions.batchSize;
      const batchWait = options.batchWait || defaultVacuumOptions.batchWait;
      let i = 1;
      for (const [term, fieldsData] of this._index) {
        for (const [fieldId, fieldIndex] of fieldsData) {
          for (const [shortId] of fieldIndex) {
            if (this._documentIds.has(shortId)) {
              continue;
            }
            if (fieldIndex.size <= 1) {
              fieldsData.delete(fieldId);
            } else {
              fieldIndex.delete(shortId);
            }
          }
        }
        if (this._index.get(term).size === 0) {
          this._index.delete(term);
        }
        if (i % batchSize === 0) {
          await new Promise((resolve) => setTimeout(resolve, batchWait));
        }
        i += 1;
      }
      this._dirtCount -= initialDirtCount;
    }
    await null;
    this._currentVacuum = this._enqueuedVacuum;
    this._enqueuedVacuum = null;
  }
  vacuumConditionsMet(conditions) {
    if (conditions == null) {
      return true;
    }
    let { minDirtCount, minDirtFactor } = conditions;
    minDirtCount = minDirtCount || defaultAutoVacuumOptions.minDirtCount;
    minDirtFactor = minDirtFactor || defaultAutoVacuumOptions.minDirtFactor;
    return this.dirtCount >= minDirtCount && this.dirtFactor >= minDirtFactor;
  }
  /**
   * Is `true` if a vacuuming operation is ongoing, `false` otherwise
   */
  get isVacuuming() {
    return this._currentVacuum != null;
  }
  /**
   * The number of documents discarded since the most recent vacuuming
   */
  get dirtCount() {
    return this._dirtCount;
  }
  /**
   * A number between 0 and 1 giving an indication about the proportion of
   * documents that are discarded, and can therefore be cleaned up by vacuuming.
   * A value close to 0 means that the index is relatively clean, while a higher
   * value means that the index is relatively dirty, and vacuuming could release
   * memory.
   */
  get dirtFactor() {
    return this._dirtCount / (1 + this._documentCount + this._dirtCount);
  }
  /**
   * Returns `true` if a document with the given ID is present in the index and
   * available for search, `false` otherwise
   *
   * @param id  The document ID
   */
  has(id) {
    return this._idToShortId.has(id);
  }
  /**
   * Returns the stored fields (as configured in the `storeFields` constructor
   * option) for the given document ID. Returns `undefined` if the document is
   * not present in the index.
   *
   * @param id  The document ID
   */
  getStoredFields(id) {
    const shortId = this._idToShortId.get(id);
    if (shortId == null) {
      return void 0;
    }
    return this._storedFields.get(shortId);
  }
  /**
   * Search for documents matching the given search query.
   *
   * The result is a list of scored document IDs matching the query, sorted by
   * descending score, and each including data about which terms were matched and
   * in which fields.
   *
   * ### Basic usage:
   *
   * ```javascript
   * // Search for "zen art motorcycle" with default options: terms have to match
   * // exactly, and individual terms are joined with OR
   * miniSearch.search('zen art motorcycle')
   * // => [ { id: 2, score: 2.77258, match: { ... } }, { id: 4, score: 1.38629, match: { ... } } ]
   * ```
   *
   * ### Restrict search to specific fields:
   *
   * ```javascript
   * // Search only in the 'title' field
   * miniSearch.search('zen', { fields: ['title'] })
   * ```
   *
   * ### Field boosting:
   *
   * ```javascript
   * // Boost a field
   * miniSearch.search('zen', { boost: { title: 2 } })
   * ```
   *
   * ### Prefix search:
   *
   * ```javascript
   * // Search for "moto" with prefix search (it will match documents
   * // containing terms that start with "moto" or "neuro")
   * miniSearch.search('moto neuro', { prefix: true })
   * ```
   *
   * ### Fuzzy search:
   *
   * ```javascript
   * // Search for "ismael" with fuzzy search (it will match documents containing
   * // terms similar to "ismael", with a maximum edit distance of 0.2 term.length
   * // (rounded to nearest integer)
   * miniSearch.search('ismael', { fuzzy: 0.2 })
   * ```
   *
   * ### Combining strategies:
   *
   * ```javascript
   * // Mix of exact match, prefix search, and fuzzy search
   * miniSearch.search('ismael mob', {
   *  prefix: true,
   *  fuzzy: 0.2
   * })
   * ```
   *
   * ### Advanced prefix and fuzzy search:
   *
   * ```javascript
   * // Perform fuzzy and prefix search depending on the search term. Here
   * // performing prefix and fuzzy search only on terms longer than 3 characters
   * miniSearch.search('ismael mob', {
   *  prefix: term => term.length > 3
   *  fuzzy: term => term.length > 3 ? 0.2 : null
   * })
   * ```
   *
   * ### Combine with AND:
   *
   * ```javascript
   * // Combine search terms with AND (to match only documents that contain both
   * // "motorcycle" and "art")
   * miniSearch.search('motorcycle art', { combineWith: 'AND' })
   * ```
   *
   * ### Combine with AND_NOT:
   *
   * There is also an AND_NOT combinator, that finds documents that match the
   * first term, but do not match any of the other terms. This combinator is
   * rarely useful with simple queries, and is meant to be used with advanced
   * query combinations (see later for more details).
   *
   * ### Filtering results:
   *
   * ```javascript
   * // Filter only results in the 'fiction' category (assuming that 'category'
   * // is a stored field)
   * miniSearch.search('motorcycle art', {
   *   filter: (result) => result.category === 'fiction'
   * })
   * ```
   *
   * ### Wildcard query
   *
   * Searching for an empty string (assuming the default tokenizer) returns no
   * results. Sometimes though, one needs to match all documents, like in a
   * "wildcard" search. This is possible by passing the special value
   * {@link MiniSearch.wildcard} as the query:
   *
   * ```javascript
   * // Return search results for all documents
   * miniSearch.search(MiniSearch.wildcard)
   * ```
   *
   * Note that search options such as `filter` and `boostDocument` are still
   * applied, influencing which results are returned, and their order:
   *
   * ```javascript
   * // Return search results for all documents in the 'fiction' category
   * miniSearch.search(MiniSearch.wildcard, {
   *   filter: (result) => result.category === 'fiction'
   * })
   * ```
   *
   * ### Advanced combination of queries:
   *
   * It is possible to combine different subqueries with OR, AND, and AND_NOT,
   * and even with different search options, by passing a query expression
   * tree object as the first argument, instead of a string.
   *
   * ```javascript
   * // Search for documents that contain "zen" and ("motorcycle" or "archery")
   * miniSearch.search({
   *   combineWith: 'AND',
   *   queries: [
   *     'zen',
   *     {
   *       combineWith: 'OR',
   *       queries: ['motorcycle', 'archery']
   *     }
   *   ]
   * })
   *
   * // Search for documents that contain ("apple" or "pear") but not "juice" and
   * // not "tree"
   * miniSearch.search({
   *   combineWith: 'AND_NOT',
   *   queries: [
   *     {
   *       combineWith: 'OR',
   *       queries: ['apple', 'pear']
   *     },
   *     'juice',
   *     'tree'
   *   ]
   * })
   * ```
   *
   * Each node in the expression tree can be either a string, or an object that
   * supports all {@link SearchOptions} fields, plus a `queries` array field for
   * subqueries.
   *
   * Note that, while this can become complicated to do by hand for complex or
   * deeply nested queries, it provides a formalized expression tree API for
   * external libraries that implement a parser for custom query languages.
   *
   * @param query  Search query
   * @param searchOptions  Search options. Each option, if not given, defaults to the corresponding value of `searchOptions` given to the constructor, or to the library default.
   */
  search(query, searchOptions = {}) {
    const { searchOptions: globalSearchOptions } = this._options;
    const searchOptionsWithDefaults = { ...globalSearchOptions, ...searchOptions };
    const rawResults = this.executeQuery(query, searchOptions);
    const results = [];
    for (const [docId, { score, terms, match }] of rawResults) {
      const quality = terms.length || 1;
      const result = {
        id: this._documentIds.get(docId),
        score: score * quality,
        terms: Object.keys(match),
        queryTerms: terms,
        match
      };
      Object.assign(result, this._storedFields.get(docId));
      if (searchOptionsWithDefaults.filter == null || searchOptionsWithDefaults.filter(result)) {
        results.push(result);
      }
    }
    if (query === _MiniSearch.wildcard && searchOptionsWithDefaults.boostDocument == null) {
      return results;
    }
    results.sort(byScore);
    return results;
  }
  /**
   * Provide suggestions for the given search query
   *
   * The result is a list of suggested modified search queries, derived from the
   * given search query, each with a relevance score, sorted by descending score.
   *
   * By default, it uses the same options used for search, except that by
   * default it performs prefix search on the last term of the query, and
   * combine terms with `'AND'` (requiring all query terms to match). Custom
   * options can be passed as a second argument. Defaults can be changed upon
   * calling the {@link MiniSearch} constructor, by passing a
   * `autoSuggestOptions` option.
   *
   * ### Basic usage:
   *
   * ```javascript
   * // Get suggestions for 'neuro':
   * miniSearch.autoSuggest('neuro')
   * // => [ { suggestion: 'neuromancer', terms: [ 'neuromancer' ], score: 0.46240 } ]
   * ```
   *
   * ### Multiple words:
   *
   * ```javascript
   * // Get suggestions for 'zen ar':
   * miniSearch.autoSuggest('zen ar')
   * // => [
   * //  { suggestion: 'zen archery art', terms: [ 'zen', 'archery', 'art' ], score: 1.73332 },
   * //  { suggestion: 'zen art', terms: [ 'zen', 'art' ], score: 1.21313 }
   * // ]
   * ```
   *
   * ### Fuzzy suggestions:
   *
   * ```javascript
   * // Correct spelling mistakes using fuzzy search:
   * miniSearch.autoSuggest('neromancer', { fuzzy: 0.2 })
   * // => [ { suggestion: 'neuromancer', terms: [ 'neuromancer' ], score: 1.03998 } ]
   * ```
   *
   * ### Filtering:
   *
   * ```javascript
   * // Get suggestions for 'zen ar', but only within the 'fiction' category
   * // (assuming that 'category' is a stored field):
   * miniSearch.autoSuggest('zen ar', {
   *   filter: (result) => result.category === 'fiction'
   * })
   * // => [
   * //  { suggestion: 'zen archery art', terms: [ 'zen', 'archery', 'art' ], score: 1.73332 },
   * //  { suggestion: 'zen art', terms: [ 'zen', 'art' ], score: 1.21313 }
   * // ]
   * ```
   *
   * @param queryString  Query string to be expanded into suggestions
   * @param options  Search options. The supported options and default values
   * are the same as for the {@link MiniSearch#search} method, except that by
   * default prefix search is performed on the last term in the query, and terms
   * are combined with `'AND'`.
   * @return  A sorted array of suggestions sorted by relevance score.
   */
  autoSuggest(queryString, options = {}) {
    options = { ...this._options.autoSuggestOptions, ...options };
    const suggestions = /* @__PURE__ */ new Map();
    for (const { score, terms } of this.search(queryString, options)) {
      const phrase = terms.join(" ");
      const suggestion = suggestions.get(phrase);
      if (suggestion != null) {
        suggestion.score += score;
        suggestion.count += 1;
      } else {
        suggestions.set(phrase, { score, terms, count: 1 });
      }
    }
    const results = [];
    for (const [suggestion, { score, terms, count }] of suggestions) {
      results.push({ suggestion, terms, score: score / count });
    }
    results.sort(byScore);
    return results;
  }
  /**
   * Total number of documents available to search
   */
  get documentCount() {
    return this._documentCount;
  }
  /**
   * Number of terms in the index
   */
  get termCount() {
    return this._index.size;
  }
  /**
   * Deserializes a JSON index (serialized with `JSON.stringify(miniSearch)`)
   * and instantiates a MiniSearch instance. It should be given the same options
   * originally used when serializing the index.
   *
   * ### Usage:
   *
   * ```javascript
   * // If the index was serialized with:
   * let miniSearch = new MiniSearch({ fields: ['title', 'text'] })
   * miniSearch.addAll(documents)
   *
   * const json = JSON.stringify(miniSearch)
   * // It can later be deserialized like this:
   * miniSearch = MiniSearch.loadJSON(json, { fields: ['title', 'text'] })
   * ```
   *
   * @param json  JSON-serialized index
   * @param options  configuration options, same as the constructor
   * @return An instance of MiniSearch deserialized from the given JSON.
   */
  static loadJSON(json, options) {
    if (options == null) {
      throw new Error("MiniSearch: loadJSON should be given the same options used when serializing the index");
    }
    return this.loadJS(JSON.parse(json), options);
  }
  /**
   * Async equivalent of {@link MiniSearch.loadJSON}
   *
   * This function is an alternative to {@link MiniSearch.loadJSON} that returns
   * a promise, and loads the index in batches, leaving pauses between them to avoid
   * blocking the main thread. It tends to be slower than the synchronous
   * version, but does not block the main thread, so it can be a better choice
   * when deserializing very large indexes.
   *
   * @param json  JSON-serialized index
   * @param options  configuration options, same as the constructor
   * @return A Promise that will resolve to an instance of MiniSearch deserialized from the given JSON.
   */
  static async loadJSONAsync(json, options) {
    if (options == null) {
      throw new Error("MiniSearch: loadJSON should be given the same options used when serializing the index");
    }
    return this.loadJSAsync(JSON.parse(json), options);
  }
  /**
   * Returns the default value of an option. It will throw an error if no option
   * with the given name exists.
   *
   * @param optionName  Name of the option
   * @return The default value of the given option
   *
   * ### Usage:
   *
   * ```javascript
   * // Get default tokenizer
   * MiniSearch.getDefault('tokenize')
   *
   * // Get default term processor
   * MiniSearch.getDefault('processTerm')
   *
   * // Unknown options will throw an error
   * MiniSearch.getDefault('notExisting')
   * // => throws 'MiniSearch: unknown option "notExisting"'
   * ```
   */
  static getDefault(optionName) {
    if (defaultOptions.hasOwnProperty(optionName)) {
      return getOwnProperty(defaultOptions, optionName);
    } else {
      throw new Error(`MiniSearch: unknown option "${optionName}"`);
    }
  }
  /**
   * @ignore
   */
  static loadJS(js, options) {
    const { index, documentIds, fieldLength, storedFields, serializationVersion } = js;
    const miniSearch = this.instantiateMiniSearch(js, options);
    miniSearch._documentIds = objectToNumericMap(documentIds);
    miniSearch._fieldLength = objectToNumericMap(fieldLength);
    miniSearch._storedFields = objectToNumericMap(storedFields);
    for (const [shortId, id] of miniSearch._documentIds) {
      miniSearch._idToShortId.set(id, shortId);
    }
    for (const [term, data] of index) {
      const dataMap = /* @__PURE__ */ new Map();
      for (const fieldId of Object.keys(data)) {
        let indexEntry = data[fieldId];
        if (serializationVersion === 1) {
          indexEntry = indexEntry.ds;
        }
        dataMap.set(parseInt(fieldId, 10), objectToNumericMap(indexEntry));
      }
      miniSearch._index.set(term, dataMap);
    }
    return miniSearch;
  }
  /**
   * @ignore
   */
  static async loadJSAsync(js, options) {
    const { index, documentIds, fieldLength, storedFields, serializationVersion } = js;
    const miniSearch = this.instantiateMiniSearch(js, options);
    miniSearch._documentIds = await objectToNumericMapAsync(documentIds);
    miniSearch._fieldLength = await objectToNumericMapAsync(fieldLength);
    miniSearch._storedFields = await objectToNumericMapAsync(storedFields);
    for (const [shortId, id] of miniSearch._documentIds) {
      miniSearch._idToShortId.set(id, shortId);
    }
    let count = 0;
    for (const [term, data] of index) {
      const dataMap = /* @__PURE__ */ new Map();
      for (const fieldId of Object.keys(data)) {
        let indexEntry = data[fieldId];
        if (serializationVersion === 1) {
          indexEntry = indexEntry.ds;
        }
        dataMap.set(parseInt(fieldId, 10), await objectToNumericMapAsync(indexEntry));
      }
      if (++count % 1e3 === 0)
        await wait(0);
      miniSearch._index.set(term, dataMap);
    }
    return miniSearch;
  }
  /**
   * @ignore
   */
  static instantiateMiniSearch(js, options) {
    const { documentCount, nextId, fieldIds, averageFieldLength, dirtCount, serializationVersion } = js;
    if (serializationVersion !== 1 && serializationVersion !== 2) {
      throw new Error("MiniSearch: cannot deserialize an index created with an incompatible version");
    }
    const miniSearch = new _MiniSearch(options);
    miniSearch._documentCount = documentCount;
    miniSearch._nextId = nextId;
    miniSearch._idToShortId = /* @__PURE__ */ new Map();
    miniSearch._fieldIds = fieldIds;
    miniSearch._avgFieldLength = averageFieldLength;
    miniSearch._dirtCount = dirtCount || 0;
    miniSearch._index = new SearchableMap();
    return miniSearch;
  }
  /**
   * @ignore
   */
  executeQuery(query, searchOptions = {}) {
    if (query === _MiniSearch.wildcard) {
      return this.executeWildcardQuery(searchOptions);
    }
    if (typeof query !== "string") {
      const options2 = { ...searchOptions, ...query, queries: void 0 };
      const results2 = query.queries.map((subquery) => this.executeQuery(subquery, options2));
      return this.combineResults(results2, options2.combineWith);
    }
    const { tokenize, processTerm, searchOptions: globalSearchOptions } = this._options;
    const options = { tokenize, processTerm, ...globalSearchOptions, ...searchOptions };
    const { tokenize: searchTokenize, processTerm: searchProcessTerm } = options;
    const terms = searchTokenize(query).flatMap((term) => searchProcessTerm(term)).filter((term) => !!term);
    const queries = terms.map(termToQuerySpec(options));
    const results = queries.map((query2) => this.executeQuerySpec(query2, options));
    return this.combineResults(results, options.combineWith);
  }
  /**
   * @ignore
   */
  executeQuerySpec(query, searchOptions) {
    const options = { ...this._options.searchOptions, ...searchOptions };
    const boosts = (options.fields || this._options.fields).reduce((boosts2, field) => ({ ...boosts2, [field]: getOwnProperty(options.boost, field) || 1 }), {});
    const { boostDocument, weights, maxFuzzy, bm25: bm25params } = options;
    const { fuzzy: fuzzyWeight, prefix: prefixWeight } = { ...defaultSearchOptions.weights, ...weights };
    const data = this._index.get(query.term);
    const results = this.termResults(query.term, query.term, 1, query.termBoost, data, boosts, boostDocument, bm25params);
    let prefixMatches;
    let fuzzyMatches;
    if (query.prefix) {
      prefixMatches = this._index.atPrefix(query.term);
    }
    if (query.fuzzy) {
      const fuzzy = query.fuzzy === true ? 0.2 : query.fuzzy;
      const maxDistance = fuzzy < 1 ? Math.min(maxFuzzy, Math.round(query.term.length * fuzzy)) : fuzzy;
      if (maxDistance)
        fuzzyMatches = this._index.fuzzyGet(query.term, maxDistance);
    }
    if (prefixMatches) {
      for (const [term, data2] of prefixMatches) {
        const distance = term.length - query.term.length;
        if (!distance) {
          continue;
        }
        fuzzyMatches === null || fuzzyMatches === void 0 ? void 0 : fuzzyMatches.delete(term);
        const weight = prefixWeight * term.length / (term.length + 0.3 * distance);
        this.termResults(query.term, term, weight, query.termBoost, data2, boosts, boostDocument, bm25params, results);
      }
    }
    if (fuzzyMatches) {
      for (const term of fuzzyMatches.keys()) {
        const [data2, distance] = fuzzyMatches.get(term);
        if (!distance) {
          continue;
        }
        const weight = fuzzyWeight * term.length / (term.length + distance);
        this.termResults(query.term, term, weight, query.termBoost, data2, boosts, boostDocument, bm25params, results);
      }
    }
    return results;
  }
  /**
   * @ignore
   */
  executeWildcardQuery(searchOptions) {
    const results = /* @__PURE__ */ new Map();
    const options = { ...this._options.searchOptions, ...searchOptions };
    for (const [shortId, id] of this._documentIds) {
      const score = options.boostDocument ? options.boostDocument(id, "", this._storedFields.get(shortId)) : 1;
      results.set(shortId, {
        score,
        terms: [],
        match: {}
      });
    }
    return results;
  }
  /**
   * @ignore
   */
  combineResults(results, combineWith = OR) {
    if (results.length === 0) {
      return /* @__PURE__ */ new Map();
    }
    const operator = combineWith.toLowerCase();
    const combinator = combinators[operator];
    if (!combinator) {
      throw new Error(`Invalid combination operator: ${combineWith}`);
    }
    return results.reduce(combinator) || /* @__PURE__ */ new Map();
  }
  /**
   * Allows serialization of the index to JSON, to possibly store it and later
   * deserialize it with {@link MiniSearch.loadJSON}.
   *
   * Normally one does not directly call this method, but rather call the
   * standard JavaScript `JSON.stringify()` passing the {@link MiniSearch}
   * instance, and JavaScript will internally call this method. Upon
   * deserialization, one must pass to {@link MiniSearch.loadJSON} the same
   * options used to create the original instance that was serialized.
   *
   * ### Usage:
   *
   * ```javascript
   * // Serialize the index:
   * let miniSearch = new MiniSearch({ fields: ['title', 'text'] })
   * miniSearch.addAll(documents)
   * const json = JSON.stringify(miniSearch)
   *
   * // Later, to deserialize it:
   * miniSearch = MiniSearch.loadJSON(json, { fields: ['title', 'text'] })
   * ```
   *
   * @return A plain-object serializable representation of the search index.
   */
  toJSON() {
    const index = [];
    for (const [term, fieldIndex] of this._index) {
      const data = {};
      for (const [fieldId, freqs] of fieldIndex) {
        data[fieldId] = Object.fromEntries(freqs);
      }
      index.push([term, data]);
    }
    return {
      documentCount: this._documentCount,
      nextId: this._nextId,
      documentIds: Object.fromEntries(this._documentIds),
      fieldIds: this._fieldIds,
      fieldLength: Object.fromEntries(this._fieldLength),
      averageFieldLength: this._avgFieldLength,
      storedFields: Object.fromEntries(this._storedFields),
      dirtCount: this._dirtCount,
      index,
      serializationVersion: 2
    };
  }
  /**
   * @ignore
   */
  termResults(sourceTerm, derivedTerm, termWeight, termBoost, fieldTermData, fieldBoosts, boostDocumentFn, bm25params, results = /* @__PURE__ */ new Map()) {
    if (fieldTermData == null)
      return results;
    for (const field of Object.keys(fieldBoosts)) {
      const fieldBoost = fieldBoosts[field];
      const fieldId = this._fieldIds[field];
      const fieldTermFreqs = fieldTermData.get(fieldId);
      if (fieldTermFreqs == null)
        continue;
      let matchingFields = fieldTermFreqs.size;
      const avgFieldLength = this._avgFieldLength[fieldId];
      for (const docId of fieldTermFreqs.keys()) {
        if (!this._documentIds.has(docId)) {
          this.removeTerm(fieldId, docId, derivedTerm);
          matchingFields -= 1;
          continue;
        }
        const docBoost = boostDocumentFn ? boostDocumentFn(this._documentIds.get(docId), derivedTerm, this._storedFields.get(docId)) : 1;
        if (!docBoost)
          continue;
        const termFreq = fieldTermFreqs.get(docId);
        const fieldLength = this._fieldLength.get(docId)[fieldId];
        const rawScore = calcBM25Score(termFreq, matchingFields, this._documentCount, fieldLength, avgFieldLength, bm25params);
        const weightedScore = termWeight * termBoost * fieldBoost * docBoost * rawScore;
        const result = results.get(docId);
        if (result) {
          result.score += weightedScore;
          assignUniqueTerm(result.terms, sourceTerm);
          const match = getOwnProperty(result.match, derivedTerm);
          if (match) {
            match.push(field);
          } else {
            result.match[derivedTerm] = [field];
          }
        } else {
          results.set(docId, {
            score: weightedScore,
            terms: [sourceTerm],
            match: { [derivedTerm]: [field] }
          });
        }
      }
    }
    return results;
  }
  /**
   * @ignore
   */
  addTerm(fieldId, documentId, term) {
    const indexData = this._index.fetch(term, createMap);
    let fieldIndex = indexData.get(fieldId);
    if (fieldIndex == null) {
      fieldIndex = /* @__PURE__ */ new Map();
      fieldIndex.set(documentId, 1);
      indexData.set(fieldId, fieldIndex);
    } else {
      const docs = fieldIndex.get(documentId);
      fieldIndex.set(documentId, (docs || 0) + 1);
    }
  }
  /**
   * @ignore
   */
  removeTerm(fieldId, documentId, term) {
    if (!this._index.has(term)) {
      this.warnDocumentChanged(documentId, fieldId, term);
      return;
    }
    const indexData = this._index.fetch(term, createMap);
    const fieldIndex = indexData.get(fieldId);
    if (fieldIndex == null || fieldIndex.get(documentId) == null) {
      this.warnDocumentChanged(documentId, fieldId, term);
    } else if (fieldIndex.get(documentId) <= 1) {
      if (fieldIndex.size <= 1) {
        indexData.delete(fieldId);
      } else {
        fieldIndex.delete(documentId);
      }
    } else {
      fieldIndex.set(documentId, fieldIndex.get(documentId) - 1);
    }
    if (this._index.get(term).size === 0) {
      this._index.delete(term);
    }
  }
  /**
   * @ignore
   */
  warnDocumentChanged(shortDocumentId, fieldId, term) {
    for (const fieldName of Object.keys(this._fieldIds)) {
      if (this._fieldIds[fieldName] === fieldId) {
        this._options.logger("warn", `MiniSearch: document with ID ${this._documentIds.get(shortDocumentId)} has changed before removal: term "${term}" was not present in field "${fieldName}". Removing a document after it has changed can corrupt the index!`, "version_conflict");
        return;
      }
    }
  }
  /**
   * @ignore
   */
  addDocumentId(documentId) {
    const shortDocumentId = this._nextId;
    this._idToShortId.set(documentId, shortDocumentId);
    this._documentIds.set(shortDocumentId, documentId);
    this._documentCount += 1;
    this._nextId += 1;
    return shortDocumentId;
  }
  /**
   * @ignore
   */
  addFields(fields) {
    for (let i = 0; i < fields.length; i++) {
      this._fieldIds[fields[i]] = i;
    }
  }
  /**
   * @ignore
   */
  addFieldLength(documentId, fieldId, count, length) {
    let fieldLengths = this._fieldLength.get(documentId);
    if (fieldLengths == null)
      this._fieldLength.set(documentId, fieldLengths = []);
    fieldLengths[fieldId] = length;
    const averageFieldLength = this._avgFieldLength[fieldId] || 0;
    const totalFieldLength = averageFieldLength * count + length;
    this._avgFieldLength[fieldId] = totalFieldLength / (count + 1);
  }
  /**
   * @ignore
   */
  removeFieldLength(documentId, fieldId, count, length) {
    if (count === 1) {
      this._avgFieldLength[fieldId] = 0;
      return;
    }
    const totalFieldLength = this._avgFieldLength[fieldId] * count - length;
    this._avgFieldLength[fieldId] = totalFieldLength / (count - 1);
  }
  /**
   * @ignore
   */
  saveStoredFields(documentId, doc) {
    const { storeFields, extractField } = this._options;
    if (storeFields == null || storeFields.length === 0) {
      return;
    }
    let documentFields = this._storedFields.get(documentId);
    if (documentFields == null)
      this._storedFields.set(documentId, documentFields = {});
    for (const fieldName of storeFields) {
      const fieldValue = extractField(doc, fieldName);
      if (fieldValue !== void 0)
        documentFields[fieldName] = fieldValue;
    }
  }
};
MiniSearch.wildcard = Symbol("*");
var getOwnProperty = (object, property) => Object.prototype.hasOwnProperty.call(object, property) ? object[property] : void 0;
var combinators = {
  [OR]: (a, b) => {
    for (const docId of b.keys()) {
      const existing = a.get(docId);
      if (existing == null) {
        a.set(docId, b.get(docId));
      } else {
        const { score, terms, match } = b.get(docId);
        existing.score = existing.score + score;
        existing.match = Object.assign(existing.match, match);
        assignUniqueTerms(existing.terms, terms);
      }
    }
    return a;
  },
  [AND]: (a, b) => {
    const combined = /* @__PURE__ */ new Map();
    for (const docId of b.keys()) {
      const existing = a.get(docId);
      if (existing == null)
        continue;
      const { score, terms, match } = b.get(docId);
      assignUniqueTerms(existing.terms, terms);
      combined.set(docId, {
        score: existing.score + score,
        terms: existing.terms,
        match: Object.assign(existing.match, match)
      });
    }
    return combined;
  },
  [AND_NOT]: (a, b) => {
    for (const docId of b.keys())
      a.delete(docId);
    return a;
  }
};
var defaultBM25params = { k: 1.2, b: 0.7, d: 0.5 };
var calcBM25Score = (termFreq, matchingCount, totalCount, fieldLength, avgFieldLength, bm25params) => {
  const { k, b, d } = bm25params;
  const invDocFreq = Math.log(1 + (totalCount - matchingCount + 0.5) / (matchingCount + 0.5));
  return invDocFreq * (d + termFreq * (k + 1) / (termFreq + k * (1 - b + b * fieldLength / avgFieldLength)));
};
var termToQuerySpec = (options) => (term, i, terms) => {
  const fuzzy = typeof options.fuzzy === "function" ? options.fuzzy(term, i, terms) : options.fuzzy || false;
  const prefix = typeof options.prefix === "function" ? options.prefix(term, i, terms) : options.prefix === true;
  const termBoost = typeof options.boostTerm === "function" ? options.boostTerm(term, i, terms) : 1;
  return { term, fuzzy, prefix, termBoost };
};
var defaultOptions = {
  idField: "id",
  extractField: (document2, fieldName) => document2[fieldName],
  stringifyField: (fieldValue, fieldName) => fieldValue.toString(),
  tokenize: (text) => text.split(SPACE_OR_PUNCTUATION),
  processTerm: (term) => term.toLowerCase(),
  fields: void 0,
  searchOptions: void 0,
  storeFields: [],
  logger: (level, message) => {
    if (typeof (console === null || console === void 0 ? void 0 : console[level]) === "function")
      console[level](message);
  },
  autoVacuum: true
};
var defaultSearchOptions = {
  combineWith: OR,
  prefix: false,
  fuzzy: false,
  maxFuzzy: 6,
  boost: {},
  weights: { fuzzy: 0.45, prefix: 0.375 },
  bm25: defaultBM25params
};
var defaultAutoSuggestOptions = {
  combineWith: AND,
  prefix: (term, i, terms) => i === terms.length - 1
};
var defaultVacuumOptions = { batchSize: 1e3, batchWait: 10 };
var defaultVacuumConditions = { minDirtFactor: 0.1, minDirtCount: 20 };
var defaultAutoVacuumOptions = { ...defaultVacuumOptions, ...defaultVacuumConditions };
var assignUniqueTerm = (target, term) => {
  if (!target.includes(term))
    target.push(term);
};
var assignUniqueTerms = (target, source) => {
  for (const term of source) {
    if (!target.includes(term))
      target.push(term);
  }
};
var byScore = ({ score: a }, { score: b }) => b - a;
var createMap = () => /* @__PURE__ */ new Map();
var objectToNumericMap = (object) => {
  const map = /* @__PURE__ */ new Map();
  for (const key of Object.keys(object)) {
    map.set(parseInt(key, 10), object[key]);
  }
  return map;
};
var objectToNumericMapAsync = async (object) => {
  const map = /* @__PURE__ */ new Map();
  let count = 0;
  for (const key of Object.keys(object)) {
    map.set(parseInt(key, 10), object[key]);
    if (++count % 1e3 === 0) {
      await wait(0);
    }
  }
  return map;
};
var wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
var SPACE_OR_PUNCTUATION = /[\n\r\p{Z}\p{P}]+/u;

// ts/search.ts
var import_dayjs = __toESM(require_dayjs_min(), 1);
function emptyIndex() {
  return new MiniSearch({
    fields: ["url", "title", "description", "tags"],
    storeFields: ["id"]
  });
}
var currentIndex = emptyIndex();
function toDocument(bookmark) {
  return {
    id: bookmark.id,
    url: bookmark.url,
    title: bookmark.title ?? "",
    description: bookmark.description ?? "",
    tags: (bookmark.tags ?? []).join(" ")
  };
}
function buildIndex(bookmarks) {
  const idx = emptyIndex();
  idx.addAll([...bookmarks.values()].map(toDocument));
  return idx;
}
function rebuildIndex(bookmarks) {
  currentIndex = buildIndex(bookmarks);
}
function tokenise(query) {
  return query.match(/"[^"]*"|\S+/g) ?? [];
}
function classifyToken(token) {
  if (token.startsWith("tag:")) return { kind: "tag", value: token.slice(4) };
  if (token.startsWith("date:")) return { kind: "date", value: token.slice(5) };
  if (token.startsWith("host:")) return { kind: "host", value: token.slice(5) };
  return { kind: "text", value: token.replace(/^"|"$/g, "") };
}
function parseDatePoint(expr, boundary) {
  const yearOnly = /^\d{4}$/.test(expr);
  const monthOnly = /^\d{4}-\d{2}$/.test(expr);
  const dayOnly = /^\d{4}-\d{2}-\d{2}$/.test(expr);
  if (!yearOnly && !monthOnly && !dayOnly) return null;
  let unit;
  if (yearOnly) unit = "year";
  else if (monthOnly) unit = "month";
  else unit = "day";
  const parsed = (0, import_dayjs.default)(expr);
  if (!parsed.isValid()) return null;
  return boundary === "start" ? parsed.startOf(unit).valueOf() : parsed.endOf(unit).valueOf();
}
function parseDateRange(expr) {
  const rangeMatch = expr.match(/^(.+?) to (.+)$/);
  if (rangeMatch) {
    const start2 = parseDatePoint(rangeMatch[1], "start");
    const end2 = parseDatePoint(rangeMatch[2], "end");
    if (start2 === null || end2 === null) return null;
    return { start: start2, end: end2 };
  }
  const start = parseDatePoint(expr, "start");
  const end = parseDatePoint(expr, "end");
  if (start === null || end === null) return null;
  return { start, end };
}
function buildParsedQuery(tokens) {
  const tags = tokens.filter((tok) => tok.kind === "tag").map((tok) => tok.value);
  const dateTokens = tokens.filter((tok) => tok.kind === "date");
  const hosts = tokens.filter((tok) => tok.kind === "host").map((tok) => tok.value);
  const textParts = tokens.filter((tok) => tok.kind === "text").map((tok) => tok.value);
  const dateRange = dateTokens.length > 0 ? parseDateRange(dateTokens[0].value) : null;
  const text = textParts.join(" ");
  return { tags, dateRange, hosts, text };
}
function parseQuery(query) {
  const tokens = tokenise(query).map(classifyToken);
  return buildParsedQuery(tokens);
}
function matchesTag(bookmark, tags) {
  const bookmarkTags = bookmark.tags ?? [];
  return tags.every((tag) => bookmarkTags.includes(tag));
}
function bookmarkHostname(bookmark) {
  try {
    return new URL(bookmark.url).hostname;
  } catch {
    return "";
  }
}
function matchesHost(bookmark, hosts) {
  const hostname = bookmarkHostname(bookmark);
  return hosts.every((fragment) => hostname.includes(fragment));
}
function matchesDate(bookmark, range) {
  const ts = new Date(bookmark.created_at).getTime();
  return ts >= range.start && ts <= range.end;
}
function applyFilters(candidates, parsed) {
  let filtered = candidates;
  if (parsed.tags.length > 0) filtered = filtered.filter((bk) => matchesTag(bk, parsed.tags));
  if (parsed.hosts.length > 0) filtered = filtered.filter((bk) => matchesHost(bk, parsed.hosts));
  if (parsed.dateRange !== null) filtered = filtered.filter((bk) => matchesDate(bk, parsed.dateRange));
  return filtered;
}
function sortResults(candidates, scoredIds) {
  if (scoredIds !== null) {
    const order = new Map(scoredIds.map((id, idx) => [id, idx]));
    return [...candidates].sort((bookmarkA, bookmarkB) => (order.get(bookmarkA.id) ?? 0) - (order.get(bookmarkB.id) ?? 0));
  }
  return [...candidates].sort(
    (bookmarkA, bookmarkB) => new Date(bookmarkB.created_at).getTime() - new Date(bookmarkA.created_at).getTime()
  );
}
function runSearch(query, bookmarks) {
  const parsed = parseQuery(query);
  const allBookmarks = [...bookmarks.values()];
  let candidates;
  let scoredIds = null;
  if (parsed.text) {
    const hits = currentIndex.search(parsed.text, { fuzzy: 0.2, prefix: true });
    scoredIds = hits.map((result) => result.id);
    const hitSet = new Set(scoredIds);
    candidates = allBookmarks.filter((bk) => hitSet.has(bk.id));
  } else {
    candidates = allBookmarks;
  }
  const filtered = applyFilters(candidates, parsed);
  return sortResults(filtered, scoredIds);
}

// ts/constants.ts
var CMSTR_URL = "https://cs.rho.ie";
var BOOKMARKS_TOPIC = "bookmark";
var CMSTR_IDB_NAME = "cmstr-bkmk";
var POLL_INTERVAL_MS = 6e4;

// ts/sync.ts
var _node = null;
function setNode(node) {
  _node = node;
}
async function postBookmark(url) {
  if (!_node) throw new Error("node not initialised");
  await _node.postEvent(BOOKMARKS_TOPIC, { url });
}

// ts/boot.ts
function isAuthError(err) {
  const message = err instanceof Error ? err.message : String(err);
  return message.includes("403") || message.includes("401");
}
async function migrateOldIDB(backend) {
  const databases = await indexedDB.databases();
  if (!databases.some((db) => db.name === "bkmk")) return;
  const oldDb = await openDB("bkmk", 1);
  const events = await oldDb.getAll("events");
  oldDb.close();
  if (events.length === 0) {
    indexedDB.deleteDatabase("bkmk");
    return;
  }
  let maxId = 0;
  for (const event of events) {
    await backend.events.updateEvent(BOOKMARKS_TOPIC, event.id, event.payload, {
      createdAt: event.createdAt,
      updatedAt: event.updatedAt
    });
    maxId = Math.max(maxId, event.id);
  }
  if (maxId > 0) await backend.cursors.setEventCursor(BOOKMARKS_TOPIC, maxId);
  indexedDB.deleteDatabase("bkmk");
}
async function replayAndReady(backend) {
  const events = await backend.events.readEvents(BOOKMARKS_TOPIC, {}) ?? [];
  const bookmarks = replayEvents(events);
  rebuildIndex(bookmarks);
  const query = readQueryParam();
  const results = runSearch(query, bookmarks);
  store.setReady(bookmarks, results);
  if (query) store.setQuery(query, results);
}
function startWatchLoop(node, backend) {
  let replayTimer = null;
  (async () => {
    for await (const _change of node.watch(BOOKMARKS_TOPIC)) {
      if (replayTimer !== null) clearTimeout(replayTimer);
      replayTimer = setTimeout(async () => {
        replayTimer = null;
        store.beginPoll();
        const events = await backend.events.readEvents(BOOKMARKS_TOPIC, {}) ?? [];
        const bookmarks = replayEvents(events);
        rebuildIndex(bookmarks);
        const results = runSearch(store.state.query, bookmarks);
        store.applyDiff(bookmarks, results);
        store.pollComplete();
      }, 100);
    }
  })().catch(console.error);
}
async function startSync(token) {
  const backend = await IDBBackend.open(CMSTR_IDB_NAME);
  await migrateOldIDB(backend);
  const scheduler = new SetIntervalScheduler();
  const node = new CommonStorageNode(
    { backend, scheduler },
    {
      events: [{
        topic: BOOKMARKS_TOPIC,
        remoteUrl: CMSTR_URL,
        token,
        intervalMs: POLL_INTERVAL_MS
      }]
    }
  );
  setNode(node);
  store.beginSync();
  try {
    await syncEventTopic(
      backend,
      CMSTR_URL,
      token,
      BOOKMARKS_TOPIC,
      void 0,
      (count) => store.progressSync(count)
    );
  } catch (err) {
    if (isAuthError(err)) {
      writeAuthError(true);
      store.setWriteOnly(true);
      store.endSync();
      return;
    }
    store.errorSync("SYNC ERROR");
    throw err;
  }
  await replayAndReady(backend);
  store.endSync();
  writeAuthError(false);
  startWatchLoop(node, backend);
  node.start();
}

// ts/components/app.ts
var import_mithril12 = __toESM(require_mithril(), 1);

// ts/components/auth-modal.ts
var import_mithril2 = __toESM(require_mithril(), 1);

// ts/auth.ts
var TOPIC_PREFIX = "topic = ";
var METHODS_PREFIX = "methods = ";
function decodeBase64(input) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  return atob(normalized);
}
function extractCaveats(token) {
  let binary;
  try {
    binary = decodeBase64(token);
  } catch {
    return [];
  }
  const caveats = [];
  let pos = 0;
  while (pos + 4 <= binary.length) {
    const lengthHex = binary.slice(pos, pos + 4);
    const length = parseInt(lengthHex, 16);
    if (isNaN(length) || length < 4) break;
    const content = binary.slice(pos + 4, pos + length - 1);
    if (content.startsWith("cid ")) {
      caveats.push(content.slice(4));
    }
    pos += length;
  }
  return caveats;
}
function parsePermissions(token) {
  const caveats = extractCaveats(token);
  const topicCaveat = caveats.find((caveat) => caveat.startsWith(TOPIC_PREFIX));
  const methodsCaveat = caveats.find((caveat) => caveat.startsWith(METHODS_PREFIX));
  if (topicCaveat !== void 0) {
    const allowedTopic = topicCaveat.slice(TOPIC_PREFIX.length);
    if (allowedTopic !== BOOKMARKS_TOPIC) return null;
  }
  const methods = methodsCaveat ? methodsCaveat.slice(METHODS_PREFIX.length).split(",") : null;
  const canRead = methods === null || methods.includes("GET");
  const canWrite = methods === null || methods.includes("POST") || methods.includes("PUT");
  if (!canRead && !canWrite) return null;
  return { canRead, canWrite };
}

// ts/components/auth-modal.ts
var tokenDraft = "";
var permissionError = "";
function onTokenInput(event) {
  tokenDraft = event.target.value;
}
async function submitToken(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const input = form.querySelector("input");
  const token = (input?.value ?? tokenDraft).trim();
  if (!token) return;
  const permissions = parsePermissions(token);
  if (permissions === null) {
    permissionError = "token does not cover the bookmark topic";
    import_mithril2.default.redraw();
    return;
  }
  permissionError = "";
  writePermissions(permissions);
  store.setPermissions(permissions);
  await writeToken(token);
  store.setToken(token);
  tokenDraft = "";
  startSync(token).catch((err) => {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack ?? "(no stack)" : "(no stack)";
    store.setFatalError(message, stack);
  });
}
function closeIfAuthed() {
  if (store.state.token) store.closeAuthModal();
}
function onEscKey(event) {
  if (event.key === "Escape") closeIfAuthed();
}
function onPanelClick(event) {
  event.stopPropagation();
}
function AuthModal() {
  return {
    view() {
      if (!store.state.showAuthModal) return null;
      const canClose = Boolean(store.state.token);
      return (0, import_mithril2.default)("div.modal-backdrop", {
        onclick: closeIfAuthed,
        oncreate: () => document.addEventListener("keydown", onEscKey),
        onremove: () => document.removeEventListener("keydown", onEscKey)
      }, [
        (0, import_mithril2.default)("div.modal-panel", { onclick: onPanelClick }, [
          canClose ? (0, import_mithril2.default)("button.modal-close[type=button]", { onclick: () => store.closeAuthModal() }, "\xD7") : null,
          (0, import_mithril2.default)("p.modal-title", "AUTHENTICATE"),
          (0, import_mithril2.default)("p.modal-subtitle", "bearer token \u2014 cs.rho.ie"),
          (0, import_mithril2.default)("form.modal-form", { onsubmit: submitToken }, [
            (0, import_mithril2.default)("input.modal-input", {
              type: "password",
              placeholder: "token\u2026",
              oninput: onTokenInput,
              autocomplete: "off",
              oncreate(vnode) {
                vnode.dom.focus();
              }
            }),
            permissionError ? (0, import_mithril2.default)("p.modal-error", permissionError) : null,
            (0, import_mithril2.default)("button.modal-submit[type=submit]", "CONNECT")
          ])
        ])
      ]);
    }
  };
}

// ts/components/sync-progress.ts
var import_mithril3 = __toESM(require_mithril(), 1);
function progressLabel(received) {
  return received === 0 ? "connecting\u2026" : `syncing\u2026 ${received.toLocaleString()} events`;
}
function SyncProgress() {
  return {
    view() {
      const status = store.state.syncStatus;
      if (status.kind === "error") {
        return (0, import_mithril3.default)("div.sync-progress", (0, import_mithril3.default)("span.sync-progress-error", status.message));
      }
      if (status.kind === "syncing") {
        return (0, import_mithril3.default)("div.sync-progress", [
          (0, import_mithril3.default)("div.sync-progress-track", (0, import_mithril3.default)("div.sync-progress-bar")),
          (0, import_mithril3.default)("span.sync-progress-label", progressLabel(status.received))
        ]);
      }
      if (status.kind === "polling") {
        return (0, import_mithril3.default)("div.sync-progress", [
          (0, import_mithril3.default)("div.sync-progress-track", (0, import_mithril3.default)("div.sync-progress-bar")),
          (0, import_mithril3.default)("span.sync-progress-label", "syncing\u2026")
        ]);
      }
      if (status.kind === "upToDate") {
        return (0, import_mithril3.default)("div.sync-progress", (0, import_mithril3.default)("span.sync-progress-ok", "up to date"));
      }
      return (0, import_mithril3.default)("div.sync-progress");
    }
  };
}

// ts/components/prompt.ts
var import_mithril4 = __toESM(require_mithril(), 1);
var activeHandler = null;
function clearSearch(inputEl) {
  inputEl.value = "";
  store.setQuery("", runSearch("", store.state.bookmarks));
  inputEl.blur();
}
function openSelected() {
  const selected = store.state.results[store.state.selectedIdx];
  if (selected) window.open(selected.url, "_blank", "noopener,noreferrer");
}
function handleFocusedKey(inputEl, event) {
  if (event.key === "Escape") clearSearch(inputEl);
  if (event.key === "Enter") openSelected();
}
function handleGlobalKey(inputEl, event) {
  if (store.state.showHelpModal) {
    if (event.key === "Escape") store.closeHelpModal();
    return;
  }
  if (store.state.showAuthModal) {
    if (event.key === "Escape" && store.state.token) store.closeAuthModal();
    return;
  }
  if (event.key === "/") {
    event.preventDefault();
    inputEl.focus();
    return;
  }
  if (event.key === "ArrowDown") {
    store.moveSelection(1);
    return;
  }
  if (event.key === "ArrowUp") {
    store.moveSelection(-1);
    return;
  }
  if (event.key === "Enter") openSelected();
  if (event.key === "a") store.openAuthModal();
  if (event.key === "?") store.openHelpModal();
}
function handleKeydown(inputEl, event) {
  const focused = document.activeElement === inputEl;
  if (focused) handleFocusedKey(inputEl, event);
  else handleGlobalKey(inputEl, event);
}
function registerKeyHandler(inputEl) {
  activeHandler = handleKeydown.bind(null, inputEl);
  document.addEventListener("keydown", activeHandler);
}
function unregisterKeyHandler() {
  if (activeHandler) document.removeEventListener("keydown", activeHandler);
  activeHandler = null;
}
function onInput(event) {
  const value = event.target.value;
  store.setQuery(value, runSearch(value, store.state.bookmarks));
}
var PREFIX_RE = /^(tag|host|date):/;
function mirrorContent(query) {
  const parts = query.split(/(\s+)/);
  return parts.map((part) => {
    if (!part) return null;
    if (/^\s+$/.test(part)) return part;
    if (PREFIX_RE.test(part)) {
      const colonIdx = part.indexOf(":");
      return (0, import_mithril4.default)("span.token-special", [
        (0, import_mithril4.default)("span.token-prefix", part.slice(0, colonIdx + 1)),
        (0, import_mithril4.default)("span.token-value", part.slice(colonIdx + 1))
      ]);
    }
    return (0, import_mithril4.default)("span.token-text", part);
  });
}
function Prompt() {
  return {
    oncreate(vnode) {
      const inputEl = vnode.dom.querySelector("input");
      registerKeyHandler(inputEl);
    },
    onremove() {
      unregisterKeyHandler();
    },
    view() {
      const query = store.state.query;
      return (0, import_mithril4.default)("div.prompt-line", [
        (0, import_mithril4.default)("span.prompt-sigil", "/"),
        (0, import_mithril4.default)("div.prompt-wrapper", [
          (0, import_mithril4.default)("div.prompt-mirror", mirrorContent(query)),
          (0, import_mithril4.default)("input.prompt-input", {
            type: "text",
            placeholder: "search\u2026",
            value: query,
            oninput: onInput,
            autocomplete: "off",
            spellcheck: false
          })
        ])
      ]);
    }
  };
}

// ts/components/bookmark-list.ts
var import_mithril7 = __toESM(require_mithril(), 1);

// ts/components/bookmark-card.ts
var import_mithril5 = __toESM(require_mithril(), 1);
function cardClass(idx, selected) {
  const base = idx % 2 === 0 ? "bookmark-card" : "bookmark-card bookmark-card--alt";
  return selected ? base + " bookmark-card--selected" : base;
}
function displayUrl(url) {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname === "/" ? "" : parsed.pathname;
    return parsed.hostname + path;
  } catch {
    return url;
  }
}
function openUrl(url) {
  window.open(url, "_blank", "noopener,noreferrer");
}
function onTagClick(tag, event) {
  event.stopPropagation();
  const query = store.state.query === `tag:${tag}` ? "" : `tag:${tag}`;
  store.setQuery(query, runSearch(query, store.state.bookmarks));
}
function tagChips(tags) {
  if (!tags?.length) return null;
  return (0, import_mithril5.default)("span.card-tags", tags.map(
    (tag) => (0, import_mithril5.default)("span.card-tag", { onclick: onTagClick.bind(null, tag) }, tag)
  ));
}
function BookmarkCard() {
  return {
    view(vnode) {
      const { bookmark, idx } = vnode.attrs;
      const selected = store.state.selectedIdx === idx;
      return (0, import_mithril5.default)("div", {
        class: cardClass(idx, selected),
        onclick: openUrl.bind(null, bookmark.url)
      }, [
        (0, import_mithril5.default)("span.card-cursor", selected ? ">" : " "),
        (0, import_mithril5.default)("span.card-url", bookmark.title ?? displayUrl(bookmark.url)),
        tagChips(bookmark.tags)
      ]);
    }
  };
}

// ts/components/date-divider.ts
var import_mithril6 = __toESM(require_mithril(), 1);
var import_dayjs2 = __toESM(require_dayjs_min(), 1);
function formatDate(dateStr) {
  return (0, import_dayjs2.default)(dateStr).format("DD MMM YYYY");
}
function DateDivider() {
  return {
    view(vnode) {
      return (0, import_mithril6.default)(
        "div.date-divider",
        (0, import_mithril6.default)("span.date-divider-text", formatDate(vnode.attrs.date))
      );
    }
  };
}

// ts/components/bookmark-list.ts
var CARD_HEIGHT = 36;
var DIVIDER_HEIGHT = 30;
var BUFFER = 15;
var scrollTop = 0;
var viewportHeight = 800;
var listEl = null;
var prevSelectedIdx = -1;
var lastRenderList = [];
var lastOffsets = [];
function bookmarkDate(bookmark) {
  return bookmark.created_at.slice(0, 10);
}
function buildRenderList(results) {
  const items = [];
  let lastDate = "";
  for (let idx = 0; idx < results.length; idx++) {
    const bookmark = results[idx];
    const date = bookmarkDate(bookmark);
    if (date !== lastDate) {
      items.push({ kind: "divider", date });
      lastDate = date;
    }
    items.push({ kind: "card", bookmark, resultIdx: idx });
  }
  return items;
}
function itemHeight(item) {
  return item.kind === "card" ? CARD_HEIGHT : DIVIDER_HEIGHT;
}
function computeOffsets(items) {
  const offsets = [0];
  for (const item of items) {
    offsets.push(offsets[offsets.length - 1] + itemHeight(item));
  }
  return offsets;
}
function findStart(offsets, top) {
  let lo = 0;
  let hi = offsets.length - 1;
  while (lo < hi) {
    const mid = lo + hi >> 1;
    if (offsets[mid] < top) lo = mid + 1;
    else hi = mid;
  }
  return Math.max(0, lo - 1);
}
function findEnd(offsets, top, height) {
  const bottom = top + height;
  let lo = 0;
  let hi = offsets.length - 1;
  while (lo < hi) {
    const mid = lo + hi + 1 >> 1;
    if (offsets[mid] <= bottom) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}
var bookmarkCard = BookmarkCard();
var dateDivider = DateDivider();
function renderCard(item) {
  return (0, import_mithril7.default)(bookmarkCard, {
    key: item.bookmark.id,
    bookmark: item.bookmark,
    idx: item.resultIdx
  });
}
function renderDivider(item) {
  return (0, import_mithril7.default)(dateDivider, {
    key: `divider-${item.date}`,
    date: item.date
  });
}
function renderItem(item) {
  if (item.kind === "divider") return renderDivider(item);
  return renderCard(item);
}
function onScroll(event) {
  const el = event.target;
  scrollTop = el.scrollTop;
  viewportHeight = el.clientHeight;
  import_mithril7.default.redraw();
}
function onCreateList(vnode) {
  listEl = vnode.dom;
  viewportHeight = listEl.clientHeight || viewportHeight;
}
function scrollToSelected() {
  if (!listEl) return;
  const selectedIdx = store.state.selectedIdx;
  if (selectedIdx === prevSelectedIdx) return;
  prevSelectedIdx = selectedIdx;
  let renderIdx = -1;
  for (let idx = 0; idx < lastRenderList.length; idx++) {
    const item = lastRenderList[idx];
    if (item.kind === "card" && item.resultIdx === selectedIdx) {
      renderIdx = idx;
      break;
    }
  }
  if (renderIdx === -1) return;
  const itemTop = lastOffsets[renderIdx] ?? 0;
  const itemBottom = itemTop + CARD_HEIGHT;
  const viewBottom = scrollTop + listEl.clientHeight;
  if (itemTop < scrollTop) {
    scrollTop = itemTop;
    listEl.scrollTop = scrollTop;
  } else if (itemBottom > viewBottom) {
    scrollTop = itemBottom - listEl.clientHeight;
    listEl.scrollTop = scrollTop;
  }
}
function BookmarkList() {
  return {
    oncreate: onCreateList,
    onupdate: scrollToSelected,
    view() {
      const results = store.state.results;
      const renderList = buildRenderList(results);
      const offsets = computeOffsets(renderList);
      const totalHeight = offsets[offsets.length - 1] ?? 0;
      lastRenderList = renderList;
      lastOffsets = offsets;
      const firstVisible = findStart(offsets, scrollTop);
      const lastVisible = findEnd(offsets, scrollTop, viewportHeight);
      const startIdx = Math.max(0, firstVisible - BUFFER);
      const endIdx = Math.min(renderList.length - 1, lastVisible + BUFFER);
      const paddingTop = offsets[startIdx] ?? 0;
      const paddingBottom = totalHeight - (offsets[endIdx + 1] ?? totalHeight);
      const visibleItems = renderList.slice(startIdx, endIdx + 1);
      return (0, import_mithril7.default)("div.bookmark-list", { onscroll: onScroll }, [
        (0, import_mithril7.default)("div.bookmark-list-spacer", { style: `height: ${paddingTop}px` }),
        visibleItems.map(renderItem),
        (0, import_mithril7.default)("div.bookmark-list-spacer", { style: `height: ${paddingBottom}px` })
      ]);
    }
  };
}

// ts/components/helpbar.ts
var import_mithril8 = __toESM(require_mithril(), 1);
function Chip() {
  return {
    view(vnode) {
      const { binding, label } = vnode.attrs;
      return (0, import_mithril8.default)("span.helpbar-chip", [
        (0, import_mithril8.default)("kbd", binding),
        (0, import_mithril8.default)("span.helpbar-label", label)
      ]);
    }
  };
}
var BINDINGS = [
  { binding: "/", label: "search" },
  { binding: "\u2191/\u2193", label: "navigate" },
  { binding: "\u21B5", label: "open" },
  { binding: "Esc", label: "clear" },
  { binding: "a", label: "reauth" },
  { binding: "?", label: "help" }
];
function Helpbar() {
  return {
    view() {
      return (0, import_mithril8.default)(
        "footer.helpbar",
        BINDINGS.map(
          (chip) => (0, import_mithril8.default)(Chip(), { binding: chip.binding, label: chip.label })
        )
      );
    }
  };
}

// ts/components/save-bar.ts
var import_mithril9 = __toESM(require_mithril(), 1);
var STATUS_LABEL = {
  idle: "",
  saving: "SAVING\u2026",
  saved: "SAVED",
  duplicate: "ALREADY SAVED",
  error: "ERROR"
};
var urlDraft = "";
var saveStatus = "idle";
async function onSubmit(event) {
  event.preventDefault();
  const url = urlDraft.trim();
  if (!url || saveStatus === "saving") return;
  if (store.urlExists(url)) {
    saveStatus = "duplicate";
    import_mithril9.default.redraw();
    return;
  }
  saveStatus = "saving";
  import_mithril9.default.redraw();
  try {
    await postBookmark(url);
    saveStatus = "saved";
    urlDraft = "";
  } catch {
    saveStatus = "error";
  }
  import_mithril9.default.redraw();
}
function onInput2(event) {
  urlDraft = event.target.value;
  if (saveStatus !== "idle") {
    saveStatus = "idle";
    import_mithril9.default.redraw();
  }
}
function SaveBar() {
  return {
    view() {
      const aboveHelpbar = !store.state.writeOnly;
      return (0, import_mithril9.default)("div.save-bar", { class: aboveHelpbar ? "save-bar--raised" : "" }, [
        (0, import_mithril9.default)("form.save-form", { onsubmit: onSubmit }, [
          (0, import_mithril9.default)("span.save-sigil", "+"),
          (0, import_mithril9.default)("input.save-input", {
            type: "text",
            placeholder: "url\u2026",
            oninput: onInput2,
            oncreate(vnode) {
              vnode.dom.focus();
            }
          }),
          saveStatus !== "idle" ? (0, import_mithril9.default)("span.save-status", { class: `save-status--${saveStatus}` }, STATUS_LABEL[saveStatus]) : null
        ])
      ]);
    }
  };
}

// ts/components/help-modal.ts
var import_mithril10 = __toESM(require_mithril(), 1);
var ROWS = [
  { token: "tag:rust", description: "bookmarks tagged 'rust'" },
  { token: "host:github.com", description: "bookmarks from a host" },
  { token: "date:2024", description: "bookmarks from a year" },
  { token: "date:2024-03", description: "bookmarks from a month" },
  { token: "date:2024-03-01", description: "bookmarks from a day" },
  { token: "date:2023 to 2024", description: "bookmarks within a date range" },
  { token: "async", description: "fuzzy match on title, URL, notes" }
];
function closeOnBackdropClick(event) {
  if (event.target.classList.contains("modal-backdrop")) {
    store.closeHelpModal();
  }
}
function HelpModal() {
  return {
    view() {
      if (!store.state.showHelpModal) return null;
      return (0, import_mithril10.default)("div.modal-backdrop", { onclick: closeOnBackdropClick }, [
        (0, import_mithril10.default)("div.modal-panel", [
          (0, import_mithril10.default)("button.modal-close", { onclick: store.closeHelpModal.bind(store) }, "\xD7"),
          (0, import_mithril10.default)("div.modal-title", "SEARCH"),
          (0, import_mithril10.default)(
            "table.help-table",
            ROWS.map(
              (row) => (0, import_mithril10.default)("tr", [
                (0, import_mithril10.default)("td.help-token", row.token),
                (0, import_mithril10.default)("td.help-desc", row.description)
              ])
            )
          ),
          (0, import_mithril10.default)("div.modal-subtitle", "tokens are ANDed \u2014 combine freely")
        ])
      ]);
    }
  };
}

// ts/components/error-modal.ts
var import_mithril11 = __toESM(require_mithril(), 1);
function copyError() {
  const err = store.state.fatalError;
  if (!err) return;
  const text = `${err.message}

${err.stack}`;
  navigator.clipboard.writeText(text).catch(() => {
  });
}
function ErrorModal() {
  return {
    view() {
      const err = store.state.fatalError;
      if (!err) return null;
      return (0, import_mithril11.default)("div.modal-backdrop", [
        (0, import_mithril11.default)("div.modal-panel.error-panel", [
          (0, import_mithril11.default)("p.modal-title", "ERROR"),
          (0, import_mithril11.default)("p.error-message", err.message),
          (0, import_mithril11.default)("pre.error-stack", err.stack),
          (0, import_mithril11.default)("button.modal-submit", { onclick: copyError }, "COPY")
        ])
      ]);
    }
  };
}

// ts/components/app.ts
var BUILD_HASH = document.getElementById("app").dataset.build ?? "";
var authModal = AuthModal();
var helpModal = HelpModal();
var errorModal = ErrorModal();
var syncProgress = SyncProgress();
var prompt = Prompt();
var bookmarkList = BookmarkList();
var helpbar = Helpbar();
var saveBar = SaveBar();
function App() {
  return {
    view() {
      const { writeOnly, permissions } = store.state;
      const canRead = !writeOnly && (permissions?.canRead ?? true);
      const canWrite = permissions?.canWrite ?? true;
      return (0, import_mithril12.default)("div.app-inner", [
        (0, import_mithril12.default)("div.brand", { onclick: () => store.setQuery("", runSearch("", store.state.bookmarks)) }, [
          "bkmk",
          (0, import_mithril12.default)("span.brand-hash", BUILD_HASH)
        ]),
        (0, import_mithril12.default)(authModal),
        (0, import_mithril12.default)(helpModal),
        (0, import_mithril12.default)(errorModal),
        canRead ? (0, import_mithril12.default)(syncProgress) : null,
        canRead ? (0, import_mithril12.default)(prompt) : null,
        canRead ? (0, import_mithril12.default)(bookmarkList) : null,
        canWrite ? (0, import_mithril12.default)(saveBar) : null,
        canRead ? (0, import_mithril12.default)(helpbar) : null
      ]);
    }
  };
}

// ts/index.ts
window.addEventListener("error", (event) => {
  store.setFatalError(event.message, event.error?.stack ?? "(no stack)");
});
window.addEventListener("unhandledrejection", (event) => {
  const err = event.reason;
  const message = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack ?? "(no stack)" : "(no stack)";
  store.setFatalError(message, stack);
});
function registerTokenFromUrl() {
  const params = new URLSearchParams(location.search);
  const urlToken = params.get("token");
  if (!urlToken) return false;
  params.delete("token");
  const cleanSearch = params.size > 0 ? `?${params}` : "";
  history.replaceState(null, "", `${location.pathname}${cleanSearch}${location.hash}`);
  const permissions = parsePermissions(urlToken);
  if (!permissions) return false;
  writeToken(urlToken);
  writePermissions(permissions);
  store.setToken(urlToken);
  store.setPermissions(permissions);
  return true;
}
async function main() {
  const hadUrlToken = registerTokenFromUrl();
  const token = readToken();
  const hadAuthError = hadUrlToken ? false : readAuthError();
  const permissions = readPermissions();
  if (token) {
    store.setToken(token);
  } else {
    store.openAuthModal();
  }
  if (permissions) store.setPermissions(permissions);
  if (token && hadAuthError) store.openAuthModal();
  import_mithril13.default.mount(document.getElementById("app"), App());
  if (token && !hadAuthError) {
    startSync(token).catch((err) => {
      const message = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? err.stack ?? "(no stack)" : "(no stack)";
      store.setFatalError(message, stack);
    });
  }
}
main().catch((err) => {
  const message = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack ?? "(no stack)" : "(no stack)";
  store.setFatalError(message, stack);
});
//# sourceMappingURL=app.js.map
