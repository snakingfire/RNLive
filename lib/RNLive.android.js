import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    NativeModules,
    Dimensions,
    Image,
    TouchableOpacity
} from 'react-native';
import PropTypes from 'prop-types';

import RTMPStreamingView from './RTMPStreamingView'

const RTMPModule = NativeModules.RTMPModule;

export default class RNLive extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount = () => {
        const { audioEnabled, url, cameraFronted, onReady } = this.props;

        if (audioEnabled) {
            RTMPModule.enableAudio();
        } else {
            RTMPModule.disableAudio();
        }
        if (!cameraFronted) {
            RTMPModule.switchCamera();
        }

        if (onReady) {
          RTMPModule.onCameraReady().then(() => {
            onReady();
          });
        }
    }

    componentDidUpdate = (prevProps, prevState) => {
        const { started, videoEnabled, audioEnabled, url, cameraFronted, showPreview } = this.props;

        if (cameraFronted !== prevProps.cameraFronted) {
            RTMPModule.switchCamera();
        }

        if (audioEnabled) {
            RTMPModule.enableAudio();
        } else {
            RTMPModule.disableAudio();
        }
    }

    startPublish = async (rtmpUrl) => {
        return await RTMPModule.startStream(rtmpUrl, this.props.videoWidth, this.props.videoHeight);
    }

    stopPublish = async () => {
        return await RTMPModule.stopStream();
    }

    switchCamera = async () => {
        return await RTMPModule.switchCamera();
    }

    startPreview = () => {
        return RTMPModule.startPreviewRatio(this.props.cameraFronted ? 1 : 0, this.props.videoWidth, this.props.videoHeight)
    }

    captureFrame = async (width, height) => {
      return await RTMPModule.takePhoto(width, height);
    }

    render() {
        const { style, children } = this.props;
        return (
            <RTMPStreamingView children={children} style={style} />
        );
    }
}

RNLive.propTypes = {
    started: PropTypes.bool,
    cameraFronted: PropTypes.bool,
    videoEnabled: PropTypes.bool,
    audioEnabled: PropTypes.bool,
    url: PropTypes.string,
    ...View.propTypes,
};

RNLive.defaultProps = {
    cameraFronted: true
};


const styles = StyleSheet.create({

});
