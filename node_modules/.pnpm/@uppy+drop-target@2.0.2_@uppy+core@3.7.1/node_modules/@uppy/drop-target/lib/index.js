import BasePlugin from '@uppy/core/lib/BasePlugin.js';
import getDroppedFiles from '@uppy/utils/lib/getDroppedFiles';
import toArray from '@uppy/utils/lib/toArray';
const packageJson = {
  "version": "2.0.2"
};
function isFileTransfer(event) {
  var _event$dataTransfer$t, _event$dataTransfer$t2;
  return (_event$dataTransfer$t = (_event$dataTransfer$t2 = event.dataTransfer.types) == null ? void 0 : _event$dataTransfer$t2.some(type => type === 'Files')) != null ? _event$dataTransfer$t : false;
}

/**
 * Drop Target plugin
 *
 */
export default class DropTarget extends BasePlugin {
  constructor(uppy, opts) {
    super(uppy, opts);
    this.addFiles = files => {
      const descriptors = files.map(file => ({
        source: this.id,
        name: file.name,
        type: file.type,
        data: file,
        meta: {
          // path of the file relative to the ancestor directory the user selected.
          // e.g. 'docs/Old Prague/airbnb.pdf'
          relativePath: file.relativePath || null
        }
      }));
      try {
        this.uppy.addFiles(descriptors);
      } catch (err) {
        this.uppy.log(err);
      }
    };
    this.handleDrop = async event => {
      var _this$opts$onDrop, _this$opts;
      if (!isFileTransfer(event)) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      clearTimeout(this.removeDragOverClassTimeout);

      // Remove dragover class
      event.currentTarget.classList.remove('uppy-is-drag-over');
      this.setPluginState({
        isDraggingOver: false
      });

      // Let any acquirer plugin (Url/Webcam/etc.) handle drops to the root
      this.uppy.iteratePlugins(plugin => {
        if (plugin.type === 'acquirer') {
          // Every Plugin with .type acquirer can define handleRootDrop(event)
          plugin.handleRootDrop == null ? void 0 : plugin.handleRootDrop(event);
        }
      });

      // Add all dropped files, handle errors
      let executedDropErrorOnce = false;
      const logDropError = error => {
        this.uppy.log(error, 'error');

        // In practice all drop errors are most likely the same,
        // so let's just show one to avoid overwhelming the user
        if (!executedDropErrorOnce) {
          this.uppy.info(error.message, 'error');
          executedDropErrorOnce = true;
        }
      };
      const files = await getDroppedFiles(event.dataTransfer, {
        logDropError
      });
      if (files.length > 0) {
        this.uppy.log('[DropTarget] Files were dropped');
        this.addFiles(files);
      }
      (_this$opts$onDrop = (_this$opts = this.opts).onDrop) == null ? void 0 : _this$opts$onDrop.call(_this$opts, event);
    };
    this.handleDragOver = event => {
      var _this$opts$onDragOver, _this$opts2;
      if (!isFileTransfer(event)) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();

      // Add a small (+) icon on drop
      // (and prevent browsers from interpreting this as files being _moved_ into the browser,
      // https://github.com/transloadit/uppy/issues/1978)
      event.dataTransfer.dropEffect = 'copy'; // eslint-disable-line no-param-reassign

      clearTimeout(this.removeDragOverClassTimeout);
      event.currentTarget.classList.add('uppy-is-drag-over');
      this.setPluginState({
        isDraggingOver: true
      });
      (_this$opts$onDragOver = (_this$opts2 = this.opts).onDragOver) == null ? void 0 : _this$opts$onDragOver.call(_this$opts2, event);
    };
    this.handleDragLeave = event => {
      var _this$opts$onDragLeav, _this$opts3;
      if (!isFileTransfer(event)) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      const {
        currentTarget
      } = event;
      clearTimeout(this.removeDragOverClassTimeout);
      // Timeout against flickering, this solution is taken from drag-drop library.
      // Solution with 'pointer-events: none' didn't work across browsers.
      this.removeDragOverClassTimeout = setTimeout(() => {
        currentTarget.classList.remove('uppy-is-drag-over');
        this.setPluginState({
          isDraggingOver: false
        });
      }, 50);
      (_this$opts$onDragLeav = (_this$opts3 = this.opts).onDragLeave) == null ? void 0 : _this$opts$onDragLeav.call(_this$opts3, event);
    };
    this.addListeners = () => {
      const {
        target
      } = this.opts;
      if (target instanceof Element) {
        this.nodes = [target];
      } else if (typeof target === 'string') {
        this.nodes = toArray(document.querySelectorAll(target));
      }
      if (!this.nodes && !this.nodes.length > 0) {
        throw new Error(`"${target}" does not match any HTML elements`);
      }
      this.nodes.forEach(node => {
        node.addEventListener('dragover', this.handleDragOver, false);
        node.addEventListener('dragleave', this.handleDragLeave, false);
        node.addEventListener('drop', this.handleDrop, false);
      });
    };
    this.removeListeners = () => {
      if (this.nodes) {
        this.nodes.forEach(node => {
          node.removeEventListener('dragover', this.handleDragOver, false);
          node.removeEventListener('dragleave', this.handleDragLeave, false);
          node.removeEventListener('drop', this.handleDrop, false);
        });
      }
    };
    this.type = 'acquirer';
    this.id = this.opts.id || 'DropTarget';
    this.title = 'Drop Target';

    // Default options
    const defaultOpts = {
      target: null
    };

    // Merge default options with the ones set by user
    this.opts = {
      ...defaultOpts,
      ...opts
    };
    this.removeDragOverClassTimeout = null;
  }
  install() {
    this.setPluginState({
      isDraggingOver: false
    });
    this.addListeners();
  }
  uninstall() {
    this.removeListeners();
  }
}
DropTarget.VERSION = packageJson.version;