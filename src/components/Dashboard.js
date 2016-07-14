import React, { Component } from 'react';
import Registry from '../utils/Registry';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import BaseComponent from './BaseComponent';
import Card from './Card';
import * as actions from '../actions';
import {push} from 'react-router-redux';


//  Pass the entire redux store to the Dashboard application / component
function mapStateToProps(state, ownProps) {
  console.log('MAP', state, ownProps);
  // pass the whole state to the Dashboard
  return {
    reduxState: state,
  }
}

//  For now we are making all actions available to all components
function mapDispatchToProps(dispatch) {
  console.log('DISPATCH',dispatch, actions)
  return {
    reduxActions: bindActionCreators(actions, dispatch),
  };
}

// poorMansMapStateToProps - parse store by cid and pass to children in render
function getOwnProps(settings, reduxState, reduxActions) {
  console.log('giqo0', arguments);
  let newProps = Object.assign({}, settings, {reduxState: reduxState, reduxActions: reduxActions});
  console.log('gOWp', newProps);
  return newProps;
}

class Dashboard extends BaseComponent {
  
  /**
   * @@TODO
   * @@ Recursively parse settings tree, rendering components
   * and children 
   * @@ This should also parse the store and pass
   * the proper piece of store/state to children
   **/
  walkSettingsTree() {
    // recurse tree
    // render children
    // poorMansMapToProps(); // parse from the store the piece that we need and add to props
  }
 
  render() {
    let reduxState = this.props.reduxState;
    let reduxActions = this.props.reduxActions;

    console.log('Render DASH', this, reduxState, reduxActions);
    let markup;
    let props = Object.assign({globalData: this.state.data || [], q: this.state.q}, this.props.route || this.props);
    if (props.layout) {
      let layout = (typeof this.props.layout === 'String') ? Registry.get(this.props.layout) : this.props.layout;
      return (
        <div className="container">
          <h1 className="dashboard-title">{this.props.title}</h1>
          {React.createElement(layout, props)}
        </div>
      );
    } 
    
    return (
        <div className="container">
          <h1 className="dashboard-title">{this.props.title}</h1>
          {props.components.map((element, key) => { 
            return (
              <Card key={key} {...element}>
                {React.createElement(Registry.get(element.type),  getOwnProps(props.components[key], reduxState, reduxActions))}
              </Card>
            )
          })}
        </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
