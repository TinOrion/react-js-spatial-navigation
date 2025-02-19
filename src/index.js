import React, { Component } from 'react';
import PropTypes from 'prop-types';

import JsSpatialNavigation from './lib/spatial_navigation.js';

const defaultConfig = {
  activeClassName: 'active',
  focusableClassName: 'focusable',
  selector: '.focusable',
};
let config = {},
  canClickEvent = true,
  canEnterEvent = true

/**
* This component initialize the Spatial Navigation library.
* It should be used only one time and in the root node of the application.
* The spatial navigation only work within the Focusable components.
*/
class SpatialNavigation extends Component {

  getConfigFromProps() {
    let propsConfig = {};

    // React Custom: Set activeClassName
    if (typeof this.props.activeClassName === 'string') {
      propsConfig.activeClassName = this.props.activeClassName;
    }

    // React Custom: Set focusableClassName
    if (typeof this.props.focusableClassName === 'string') {
      propsConfig.focusableClassName = this.props.focusableClassName;
    }

    // React Custom: Set customInit
    if (typeof this.props.customInit === 'function') {
      propsConfig.customInit = this.props.customInit;
    }

    // Set defaultElement
    if (typeof this.props.defaultElement === 'string') {
      propsConfig.defaultElement = this.props.defaultElement;
    }

    // Set disabled
    if (typeof this.props.disabled === 'boolean') {
      propsConfig.disabled = this.props.disabled;
    }

    // Set enterTo
    if (typeof this.props.enterTo === 'string') {
      propsConfig.enterTo = this.props.enterTo;
    }

    // Set leaveFor
    if (typeof this.props.leaveFor === 'object') {
      propsConfig.leaveFor = this.props.leaveFor;
    }

    // Set navigableFilter
    if (typeof this.props.navigableFilter === 'function') {
      propsConfig.navigableFilter = this.props.navigableFilter;
    }

    // Set rememberSource
    if (typeof this.props.rememberSource === 'string') {
      propsConfig.rememberSource = this.props.rememberSource;
    }

    // Set restrict
    if (typeof this.props.restrict === 'string') {
      propsConfig.restrict = this.props.restrict;
    }

    // Set selector
    if (typeof this.props.selector === 'string') {
      propsConfig.selector = this.props.selector;
    }

    // Set straightOnly
    if (typeof this.props.straightOnly === 'boolean') {
      propsConfig.straightOnly = this.props.straightOnly;
    }

    // Set straightOverlapThreshold
    if (typeof this.props.straightOverlapThreshold === 'number') {
      propsConfig.straightOverlapThreshold = this.props.straightOverlapThreshold;
    }

    // Set tabIndexIgnoreList
    if (typeof this.props.tabIndexIgnoreList === 'string') {
      propsConfig.tabIndexIgnoreList = this.props.tabIndexIgnoreList;
    }

    // Set canClickEvent
    if (typeof this.props.canClickEvent === 'boolean') {
      canClickEvent = this.props.canClickEvent
    }

    // Set canEnterEvent
    if (typeof this.props.canEnterEvent === 'boolean') {
      canEnterEvent = this.props.canEnterEvent
    }

    return propsConfig;
  }

  resetEnterClickEvent = () => {
    canClickEvent = true
    canEnterEvent = true
  }

  componentWillMount() {
    config = Object.assign(defaultConfig, this.getConfigFromProps.call(this));
  }

  componentDidMount() {
    if (!this.props.customInit) {
      JsSpatialNavigation.init();
      JsSpatialNavigation.add(config);
      JsSpatialNavigation.focus();
    } else {
      this.props.customInit.call(this, config);
    }
    // console.log('SpatialNavigation componentDidMount')
    // JsSpatialNavigation.getSections()
    // this.props.onDidMount(JsSpatialNavigation);
  }

  componentWillUnmount() {
    this.resetEnterClickEvent()
    JsSpatialNavigation.uninit();
  }

  render() {
    return (
      <div>{this.props.children}</div>
    );
  }
}

function getSelector(id) {
  return `.${id}`;
}

/**
* A Focusable component that handle the onFocus, onUnfocus, onClickEnter events.
*
* Props:
*   onFocus: (optional)
*     A function that will be fired when the component is focused.
*
*   onUnfocus: (optional)
*     A function that will be fired when the component is unfocused.
*
*   onClickEnter: (optional)
*     A function that will be fired when the component is focused and enter key is pressed.
*/
class Focusable extends Component {
  componentFocused(e) {
    if (this.props.onFocus) {
      this.props.onFocus(e);
    }
    
    if (this.props.scrollToItem) {
      if (typeof e.detail != 'undefined' && typeof e.detail.currentElement != 'undefined' && e.detail.currentElement) {
        if (e.detail.direction == 'left' || e.detail.direction == 'right')
          return

        let offsetTop = e.detail.currentElement.getBoundingClientRect().top + this._getBodyScrollTop(),
          scrollElem = (typeof this.props.scrollElem != 'undefined' && this.props.scrollElem) ? this.props.scrollElem : null

        if (scrollElem && document.querySelector(scrollElem))
          offsetTop -= document.querySelector(scrollElem).getBoundingClientRect().top

        this._scrollToItem((offsetTop > 0) ? offsetTop : 0, (this.props.scrollOffset) ? this.props.scrollOffset : 0, scrollElem)
      }
    }
  }

  componentUnfocused(e) {
    if (this.props.onUnfocus) {
      this.props.onUnfocus(e);
    }

    if (e && e.detail && !e.detail.direction && !e.detail.nextSectionId && !e.detail.isClickTouch) {
      this._makeFocusDefaultSection()
    }
  }

  componentClickEnter(e) {
    if (!canEnterEvent)
      return

    if (this.props.onClickEnter) {
      this.props.onClickEnter(e);
    }
  }

  handleOnClick = (e) => {
    if (!canClickEvent)
      return

    if (this.props.onClick) {
      this.props.onClick(e)
    }
  }

  _componentFocused = (event) => this.componentFocused(event);
  _componentUnfocused = (event) => this.componentUnfocused(event);
  _componentClickEnter = (event) => this.componentClickEnter(event);

  _getBodyScrollTop() {
    return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
  }

  _scrollToItem(top, offset, scrollElem) {
    JsSpatialNavigation.scrollToSection(top, offset, scrollElem)
  }

  _pause() {
    JsSpatialNavigation.pause()
  }

  _resume() {
    JsSpatialNavigation.resume()
  }

  _makeFocusDefaultSection() {
    JsSpatialNavigation.focus()
  }

  _makeFocus(selector) {
    if (typeof selector == 'undefined' || !selector) {
        JsSpatialNavigation.focus(`@${this.sectionId}`)
    } else {
        JsSpatialNavigation.focus(selector)
    }
  }

  componentDidMount() {
    if (!this.el)
      return;

    this.el.addEventListener("sn:focused", this._componentFocused);
    this.el.addEventListener("sn:unfocused", this._componentUnfocused);
    this.el.addEventListener("sn:enter-up", this._componentClickEnter);
  }

  componentWillUnmount() {
    this.el.removeEventListener("sn:focused", this._componentFocused);
    this.el.removeEventListener("sn:unfocused", this._componentUnfocused);
    this.el.removeEventListener("sn:enter-up", this._componentClickEnter);
  }

  render() {
    let classNames = [this.context.focusableSectionId ? this.context.focusableSectionId : config.focusableClassName];

    if (this.props.active) {
      classNames.push(config.activeClassName);
    }

    if (this.props.className) {
      classNames.push(this.props.className);
    }

    return (
      <div 
        className={classNames.join(" ")} 
        ref={ (e) => { this.el = e; this.props.ref } }
        tabIndex="-1"
        style={this.props.style}
        onClick={ (e) => this.handleOnClick(e) }
        >
        {this.props.children}
      </div>
    );
  }
}

Focusable.contextTypes = {
  focusableSectionId: PropTypes.string
};

/*
* A Focusable Section can specify a behaviour before focusing an element.
* I.e. selecting a default element, the first element or an active one.
*
* Props:
*   defaultElement: (default: '')
*     The default element that will be focused when entering this section.
*     This can be:
*       * a valid selector string for "querySelectorAll".
*       * a NodeList or an array containing DOM elements.
*       * a single DOM element.
*       * an empty string.
*
*   enterTo: (default: 'default-element')
*     If the focus comes from another section, you can define which element in this section should be focused first.
*     This can be:
*       * 'last-focused' indicates the last focused element before we left this section last time. If this section has never been focused yet, the default element (if any) will be chosen next.
*       * 'default-element' indicates the element defined in defaultElement.
*       * an empty string.
*/
class FocusableSection extends Component {
  constructor(props) {
    super(props)

    this.state = {
      defaultSectionLoaded: false
    }
  }

  getChildContext() {
    return {focusableSectionId: this.sectionId};
  }

  componentWillMount() {
    const { id } = this.props

    let JsSConfig = ''

    if (typeof id != 'undefined' && id)
      JsSConfig = id

    this.sectionId = JsSpatialNavigation.add(JsSConfig, {});
  }

  componentWillUnmount() {
    if (this.el) {
      this.el.removeEventListener("sn:change-current-section", this._componentChangeCurrentSection);
      this.el.removeEventListener("sn:change-next-section", this._componentChangeNextSection);
      this.el.removeEventListener("sn:focused-section", this._componentFocusedSection);
    }

    JsSpatialNavigation.remove(this.sectionId);
  }

  componentChangeCurrentSection(e) {
    if (this.props.onChangeCurrentSection) {
      if (this.props.scrollToSection) {
        if (!this._getSectionElem())
          return

        if (typeof e.detail.direction == 'undefined')
          return

        if (e.detail.direction == 'left' || e.detail.direction == 'right')
          return

        let offsetTop = this._getSectionElemOffet().top + this._getBodyScrollTop(),
          scrollElem = (typeof this.props.scrollElem != 'undefined' && this.props.scrollElem) ? this.props.scrollElem : null

        if (scrollElem && document.querySelector(scrollElem))
          offsetTop -= document.querySelector(scrollElem).getBoundingClientRect().top

        this._scrollToSection((offsetTop > 0) ? offsetTop : 0, (this.props.scrollOffset) ? this.props.scrollOffset : 0, scrollElem)
      }

      this.props.onChangeCurrentSection(e);
    }
  }

  componentChangeNextSection(e) {
    if (this.props.onChangeNextSection) {
      if (this.props.scrollToSection) {
        if (!this._getSectionElem())
          return

        if (typeof e.detail.direction == 'undefined')
          return

        if (e.detail.direction == 'left' || e.detail.direction == 'right')
          return

        let offsetTop = this._getSectionElemOffet().top + this._getBodyScrollTop(),
          scrollElem = (typeof this.props.scrollElem != 'undefined' && this.props.scrollElem) ? this.props.scrollElem : null

        if (scrollElem && document.querySelector(scrollElem))
          offsetTop -= document.querySelector(scrollElem).getBoundingClientRect().top

        this._scrollToSection((offsetTop > 0) ? offsetTop : 0, (this.props.scrollOffset) ? this.props.scrollOffset : 0, scrollElem)
      }

      this.props.onChangeNextSection(e);
    }
  }

  componentFocusedSection(e) {
    if (this.props.scrollToSection) {
      if (!this._getSectionElem())
        return

      if (typeof e.detail.direction == 'undefined')
        return

      if (e.detail.direction == 'left' || e.detail.direction == 'right')
        return

      let offsetTop = this._getSectionElemOffet().top + this._getBodyScrollTop(),
        scrollElem = (typeof this.props.scrollElem != 'undefined' && this.props.scrollElem) ? this.props.scrollElem : null

      if (scrollElem && document.querySelector(scrollElem)) {
        offsetTop = 0
      }

      this._scrollToSection((offsetTop > 0) ? offsetTop : 0, (this.props.scrollOffset) ? this.props.scrollOffset : 0, scrollElem)
    }
  }

  _getBodyScrollTop() {
    return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
  }

  _getSelector() {
    return getSelector(this.sectionId);
  }

  _getSectionId() {
    return this.sectionId
  }

  _getSectionElem() {
    return this.el
  }

  _getSectionElemOffet() {
    return this.el.getBoundingClientRect()
  }

  _getWrapperSelector() {
    return getSelector(this.sectionId + '-wrapper')
  }

  _getAllSections() {
    return JsSpatialNavigation.getSections()
  }

  _getCurrentFocusSection() {
    return JsSpatialNavigation.getCurrentFocusSection()
  }

  _isCurrentSection() {
    let currentFocusSection = this._getCurrentFocusSection()

    if (!currentFocusSection)
      return false

    return currentFocusSection == this.sectionId
  }

  _disableSection() {
    JsSpatialNavigation.disable(this.sectionId)
  }

  _activeSection() {
    JsSpatialNavigation.enable(this.sectionId)
  }7
  
  _makeFocus(selector) {
    if (typeof selector == 'undefined' || !selector) {
      setTimeout(() => {
        JsSpatialNavigation.focus(`@${this.sectionId}`)
      }, 10)
    } else {
      setTimeout(() => {
        JsSpatialNavigation.focus(selector)
      }, 10)
    }
  }

  _setDefaultSection() {
    JsSpatialNavigation.setDefaultSection(this.sectionId)

    if (!this.state.defaultSectionLoaded) {
      this.setState({
        defaultSectionLoaded: true
      })
      this._makeFocus()
    }
  }

  _scrollToSection(top, offset, scrollElem) {
    JsSpatialNavigation.scrollToSection(top, offset, scrollElem)
  }

  _pause() {
    JsSpatialNavigation.pause()
  }

  _resume() {
    JsSpatialNavigation.resume()
  }

  _hasDefaultSetting() {
    return (typeof this.props.defaultSection != 'undefined' && this.props.defaultSection)
  }

  _hasChildrenItems() {
    return (typeof this.props.children != 'undefined' && this.props.children)
  }

  _componentChangeCurrentSection = (event) => this.componentChangeCurrentSection(event);
  _componentChangeNextSection = (event) => this.componentChangeNextSection(event);
  _componentFocusedSection = (event) => this.componentFocusedSection(event);

  componentDidMount() {
    if (this.el) {
      this.el.addEventListener("sn:change-current-section", this._componentChangeCurrentSection);
      this.el.addEventListener("sn:change-next-section", this._componentChangeNextSection);
      this.el.addEventListener("sn:focused-section", this._componentFocusedSection);
    }

    let defaultElement = this.props.defaultElement;
    const enterTo = this.props.enterTo === undefined ? 'default-element' : this.props.enterTo;

    if (defaultElement && defaultElement === 'first') {
      defaultElement = this._getSelector() + ':first-child';
    }

    if (defaultElement && defaultElement === 'active') {
      defaultElement = this._getSelector() + `.${config.activeClassName}`;
    }

    let straightOnly = this.props.straightOnly,
        leaveFor = this.props.leaveFor,
        restrict = this.props.restrict,
        navigableFilter = this.props.navigableFilter,
        straightOverlapThreshold = this.props.straightOverlapThreshold

    JsSpatialNavigation.set(this.sectionId, {
      selector: this._getSelector(),
      enterTo: enterTo,
      defaultElement: defaultElement,
      straightOnly: straightOnly,
      leaveFor: leaveFor,
      restrict: restrict,
      navigableFilter: navigableFilter
    });

    // if (this._hasDefaultSetting() && this._hasChildrenItems() && this.props.isLoaded)
    if (this._hasDefaultSetting() && this._hasChildrenItems() && !this.state.defaultSectionLoaded) {
      this._setDefaultSection()
    }

    if (typeof this.props.disabledSection != 'undefined' && this.props.disabledSection)
      this._disableSection()
  }

  componentDidUpdate(prevProps) {
    if (this._hasDefaultSetting() && this._hasChildrenItems() && !this.state.defaultSectionLoaded) {
      this._makeFocus()
      this.setState({
        defaultSectionLoaded: true
      })
    }

    // if (typeof this.props.disabledSection != 'undefined' && typeof prevProps.disabledSection != 'undefined' && this.props.disabledSection != prevProps.disabledSection) {
    //   if (prevProps.disabledSection)
    //     this._disableSection()
    //   else
    //     this._activeSection()
    // }
  }

  render() {
    if (typeof this.props.children == 'undefined' && !this.props.children)
      return null

    return (
      <div className={`${this.sectionId + '-wrapper'} ${(this.state.defaultSectionLoaded ? this.sectionId + '-default' : '')} ${this.props.className ? this.props.className : ''}`} id={this.props.id} ref={ (e) => { this.el = e; } }>
        {this.props.children}
      </div>
    );
  }
}

FocusableSection.childContextTypes = {
  focusableSectionId: PropTypes.string
};


export { SpatialNavigation as default, FocusableSection, Focusable, JsSpatialNavigation };
