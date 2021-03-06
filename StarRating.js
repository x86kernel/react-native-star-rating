'use strict';

import React, { Component } from 'react'
import {
  View,
  StyleSheet,
  Image,
  Platform,
} from 'react-native'

import PropTypes from 'prop-types'
import ReactNativeHapticFeedback from 'react-native-haptic-feedback'

const hapticOptions = {
  ignoreAndroidSystemSettings: true,
}

export default class StarRating extends Component {
  static defaultProps = {
    maxStars: 5,
    rating: 0,
    starSize: -1,
    interitemSpacing: 0,
    valueChanged: (index) => {},
    onResponderGrant: () => null,
    onResponderRelease: () => null,
    onResponderTerminate: () => null,
    imageProps: {},
  };

  static propTypes = {
    maxStars: PropTypes.number,
    rating: PropTypes.number,
    unSelectStar: PropTypes.number.isRequired,
    selectStar: PropTypes.number.isRequired,
    valueChanged: PropTypes.func,
    starSize: PropTypes.number,
    interitemSpacing: PropTypes.number,
    maxLocationY: PropTypes.number.isRequired,
    imageProps: PropTypes.object,
  };

  constructor(props) {
    super(props);

    this.state = {
      maxStars: this.props.maxStars,
      rating: this.props.rating,
      firstImageLayout: null,
      starSize: this.props.starSize,
    };

    this._onLayout = this._onLayout.bind(this);
    this._onResponderMove = this._onResponderMove.bind(this);
    this._onResponderGrant = this._onResponderGrant.bind(this);
    this._onResponderRelease = this._onResponderRelease.bind(this);

    this._grantedLocationY = null
  }

  render() {
    var starArray = [];
    var imageSource = null;
    for(var i = 0; i < this.state.maxStars; i++) {
      if(i < this.state.rating) {
        imageSource = this.props.selectStar;
      }
      else {
        imageSource = this.props.unSelectStar;
      }

      var onLayoutFunc = null;
      if(i === 0) {
        onLayoutFunc = this._onLayout;
      }

      var styleArray = [];
      if(i !== this.state.maxStars - 1) {
        styleArray.push({ marginRight: this.props.interitemSpacing });
      }
      if(this.state.starSize > 0) {
        styleArray.push({width: this.state.starSize, height: this.state.starSize});
      }

      //push Image
      starArray.push(
        <Image
          key={i}
          source={imageSource}
          style={styleArray}
          onLayout={onLayoutFunc}
          { ... this.props.imageProps }
        />
      );
    }
    return (
      <View
        style={styles.container}
        onStartShouldSetResponderCapture={this._onStartShouldSetResponder}
        onMoveShouldSetResponderCapture={this._onMoveShouldSetResponder}
        onResponderTerminationRequest={ this._onResponderTerminationRequest }
        onResponderGrant={this._onResponderGrant}
        onResponderMove={this._onResponderMove}
        onResponderRelease={ this._onResponderRelease }
        onResponderTerminate={ this.props.onResponderTerminate }
      >
        {starArray}
      </View>
    )
  }

  _onLayout(layoutInfo) {
    var starSize = layoutInfo.nativeEvent.layout.width;
    //已经设置过starSize，不需要再设置
    if(this.state.starSize > 0) {
      this.setState({
        containerLayout: layoutInfo.nativeEvent.layout,
      });
    }
    else {
      this.setState({
        containerLayout: layoutInfo.nativeEvent.layout,
        starSize: starSize,
      });
    }
  }

  //是否应该成为响应者
  _onStartShouldSetResponder(evt) {
    return true
  }

  //移动的时候是否成为响应者
  _onMoveShouldSetResponder(evt) {
    return true
  }

  _onResponderTerminationRequest = () => {
    return true
  }

  _onResponderGrant(evt) {
    this._grantedLocationY = Platform.OS === 'ios' ? evt.nativeEvent.locationY : evt.nativeEvent.pageY

    this.props.onResponderGrant()
    this._updateChangeValue(evt);
  }

  //正在移动
  _onResponderMove(evt) {
    const { maxLocationY } = this.props
    const { locationY, pageY, } = evt.nativeEvent

    if(Platform.OS === 'ios') {
      if(locationY < this._grantedLocationY + maxLocationY && locationY > this._grantedLocationY - maxLocationY) {
        this._updateChangeValue(evt);
      }
    } else {
      if(pageY < this._grantedLocationY + maxLocationY && pageY > this._grantedLocationY - maxLocationY) {
        this._updateChangeValue(evt);
      }
    }
  }

  _onResponderRelease(evt) {
    const { maxLocationY, } = this.props
    const { locationY, pageY, } = evt.nativeEvent

    this.props.onResponderRelease()

    if(Platform.OS === 'ios') {
      if(locationY < this._grantedLocationY + maxLocationY && locationY > this._grantedLocationY - maxLocationY) {
        this.props.valueChanged(this.state.rating);
      }
    } else {
      if(pageY < this._grantedLocationY + maxLocationY && pageY > this._grantedLocationY - maxLocationY) {
        this.props.valueChanged(this.state.rating);
      }
    }

    this._gratedLocationY = null
  }

  _updateChangeValue(evt) {
    var starWidth = this.state.starSize + this.props.interitemSpacing;
    var rating = Math.ceil((evt.nativeEvent.pageX-this.state.containerLayout.x)/starWidth);

    if(rating < 0) {
      rating = 0;
    }

    else if(rating > this.state.maxStars) {
      rating = this.state.maxStars;
    }

    if(rating !== this.state.rating) {
      ReactNativeHapticFeedback.trigger('impactHeavy', hapticOptions)
    }

    this.setState({
      rating: rating,
    });
  }
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
