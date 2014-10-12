/** @jsx React.DOM */
var React = require("react/addons");
var {update} = React.addons;

function noop () {}

var AlertMessage = React.createClass({
  displayName: "AlertMessage",

  getDefaultProps () {
    var iconClassNames = {
      error: "toast-error",
      info: "toast-info",
      success: "toast-success",
      warning: "toast-warning"
    };

    return {
      className: "toast",
      iconClassNames: iconClassNames,
      titleClassName: "toast-title",
      messageClassName: "toast-message",
      closeButton: false
    };
  },

  _render_close_button (props) {
    return props.closeButton ? (
      <button className="toast-close-button" role="button">&times;</button>
    ) : false;
  },

  _render_title_element (props) {
    return props.title ? (
      <div className={props.titleClassName}>
        {props.title}
      </div>
    ) : false;
  },

  _render_message_element (props) {
    return props.message ? (
      <div className={props.messageClassName}>
        {props.message}
      </div>
    ) : false;
  },

  render () {
    var cx = React.addons.classSet;
    var props = this.props;
    var iconClassName = props.iconClassName || props.iconClassNames[props.type];

    var toastClass = {};
    toastClass[props.className] = true;
    toastClass[iconClassName] = true;

    return (
      <div className={cx(toastClass)} onClick={props.onClick}>
        {this._render_close_button(props)}
        {this._render_title_element(props)}
        {this._render_message_element(props)}
      </div>
    );
  }
});

module.exports = React.createClass({
  displayName: "Container",

  error (message, title, optionsOverride) {
    this._notify(this.props.toastType.error, message, title, optionsOverride);
  },

  info (message, title, optionsOverride) {
    this._notify(this.props.toastType.info, message, title, optionsOverride);
  },

  success (message, title, optionsOverride) {
    this._notify(this.props.toastType.success, message, title, optionsOverride);
  },

  warning (message, title, optionsOverride) {
    this._notify(this.props.toastType.warning, message, title, optionsOverride);
  },

  getDefaultProps () {
    return {
      toastType: {
        error: "error",
        info: "info",
        success: "success",
        warning: "warning"
      },
      id: "toast-container",
      preventDuplicates: false,
      newestOnTop: true,
      onClick: noop
    };
  },

  getInitialState () {
    return {
      toasts: [],
      previousMessage: null
    };
  },

  _notify (type, message, title, optionsOverride) {
    var {props, state} = this;
    if (props.preventDuplicates) {
      if (state.previousMessage === message) {
        return;
      }
    }
    var newToast = update(optionsOverride || {}, {
      $merge: {
        type,
        title,
        message,
        onClick: this._handleToastOnClick
      }
    });
    var toastOperation = {};
    toastOperation[(props.newestOnTop ? "$unshift" : "$push")] = [newToast];

    var newState = update(state, {
      previousMessage: { $set: message },
      toasts: toastOperation
    });
    this.setState(newState);
  },

  _handleToastOnClick (event) {
    this.props.onClick(event);
    if (event.defaultPrevented) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this._hideToast();
  },

  _hideToast: noop,//tapToDismiss

  render () {
    return this.transferPropsTo(
      <div aria-live="polite" role="alert">
        {this.state.toasts.map((toast) => {
          return AlertMessage(toast);
        })}
      </div>
    );
  }
});
