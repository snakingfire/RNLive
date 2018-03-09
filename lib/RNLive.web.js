import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    Dimensions,
    Image,
    TouchableOpacity,
    Alert
} from 'react-native';
import PropTypes from 'prop-types';
import swfobject from '../NodePublisher/swfobject';

const CAMERA_REF = 'CAMERA';

const RTMPModule = {
    enableVideo() { },
    disableVideo() { },
    enableAudio() { },
    disableAudio() { },
    switchCamera() { },
    startStream() {
        return new Promise((res, rej) => {
            res();
        })
    },
    stopStream() {
        return new Promise((res, rej) => {
            res();
        })
    }
};

export default class RNLive extends Component {

    constructor(props) {
        super(props);

        this.stopPreview = this.stopPreview.bind(this);
        this.startPreview = this.startPreview.bind(this);
        this.startPublish = this.startPublish.bind(this);
        this.stopPublish = this.stopPublish.bind(this);
        this.switchCamera = this.switchCamera.bind(this);
        this.enableAudio = this.enableAudio.bind(this);
        this.disableAudio = this.disableAudio.bind(this);
        this.enableVideo = this.enableVideo.bind(this);
        this.disableVideo = this.disableVideo.bind(this);
    };

    componentDidMount = () => {
        const { onCameraShown } = this.props;
        var vidContainer = this.refs['vidContainer'];
        vidContainer.measure((x, y, w, h, yx, yy) => {
            this.Width = w;
            this.Height = h;

            const { started, videoEnabled, audioEnabled, url, cameraFronted, showPreview } = this.props;
            if (started && url) {
                this.startPublish(url)
            }
            if (videoEnabled) {
                this.enableVideo();
            } else {
                this.disableVideo();
            }

            if (audioEnabled) {
                this.enableAudio();
            } else {
                this.disableAudio();
            }
            if (!cameraFronted) {
                this.switchCamera();
            }

            if (showPreview) {
                this.startPreview().then((res) => {
                    console.log(res);
                })
            }

            var hasFlash = false;
            try {
                var fo = (navigator.mimeTypes && navigator.mimeTypes['application/x-shockwave-flash']) ? navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin : 0;
                if (fo) hasFlash = true;
            } catch (e) {
                if (navigator.mimeTypes['application/x-shockwave-flash'] != undefined) hasFlash = true;
            }

            if (hasFlash) {
                console.log('HAS FLASH');

                var swfVersionStr = "11.1.0";
                // To use express install, set to playerProductInstall.swf, otherwise the empty string. 
                var xiSwfUrlStr = "/NodePublisher/playerProductInstall.swf";
                var flashvars = {};
                var params = {
                    quality: "high",
                    bgcolor: "#ffffff",
                    allowscriptaccess: "always",
                    allowfullscreen: "true",
                };

                var attributes = {
                    id: "NodePublisher",
                    name: "NodePublisher",
                    align: "middle"
                };

                window.eventCallback = (e) => {
                    if (e.kind === "error" && e.message && e.message.name === "TypeError") { //just received ability to view cam, we think
                        if (onCameraShown) {
                            onCameraShown();
                        }
                    }
                }

                const checkLoad = (e) => {
                    if (e.success) {
                        setTimeout(this.startPreview, 2000);
                    }
                }

                swfobject.embedSWF(
                    "/NodePublisher/NodePublisher.swf",
                    "NodePublisher",
                    this.Width.toString(),
                    this.Height.toString(),
                    swfVersionStr, xiSwfUrlStr,
                    flashvars, params, attributes, checkLoad);
            } else {
                Alert.alert('Flash not enabled', 'It looks as though Flash is disabled on your browser. Please enable flash if you want to live stream.', [{ text: "Okay", onPress: () => { } }])
            }
        })
    };

    componentWillUnmount() {
        this.stopPreview();
    }

    componentDidUpdate = (prevProps, prevState) => {
        const { started, videoEnabled, audioEnabled, url, cameraFronted, showPreview } = this.props;
        if (started !== prevProps.started || url !== prevProps.url) {
            if (started) {
                this.startPublish(url).then((res) => {
                    this.props.onStart && this.props.onStart(res);
                });
            } else {
                this.stopPublish().then(() => {
                    this.props.onStop && this.props.onStop();
                });
            }
        }

        if (cameraFronted !== prevProps.cameraFronted) {
            this.switchCamera();
        }

        if (videoEnabled) {
            this.enableVideo();
        } else {
            this.disableVideo();
        }

        if (audioEnabled) {
            this.enableAudio();
        } else {
            this.disableAudio();
        }

        if (showPreview !== prevProps.showPreview) {
            if (showPreview) {
                this.startPreview(cameraFronted ? 1 : 0);
            } else {
                this.stopPreview();
            }
        }
    };

    stopPreview = () => {
        return new Promise((resolve, reject) => {
            try {
                var video = this.refs[CAMERA_REF];
                var vidContainer = this.refs['vidContainer'];
                video.setAttribute('playsinline', '');
                video.setAttribute('autoplay', '');
                video.srcObject = undefined;
                video.src = undefined;

                for (let track of this.Stream.getTracks()) {
                    track.stop()
                }

                this.Stream.stop();
                this.Stream = undefined;
                this.Blob = undefined;
                resolve();
            } catch (err) {
                reject(err);
            }
        })
    }

    startPreview = () => {
        return new Promise((resolve, reject) => {
            try {
                let np = document.getElementById("NodePublisher");
                np.setOptions({ videoWidth: this.Width, videoHeight: this.Height, videoQuality: 90 });
                np.preview();
                resolve();
            } catch (err) {
                reject(err);
            }
        })
    };

    startPublish = (rtmpUrl) => {
        return new Promise((resolve, reject) => {
            try {
                let np = document.getElementById("NodePublisher");
                np.setOptions({ streamURL: rtmpUrl });
                np.start();
                resolve();
            } catch (err) {
                reject(err);
            }
        })
    };

    stopPublish = () => {
        return new Promise((resolve, reject) => {
            try {
                let np = document.getElementById("NodePublisher");
                np.stop();
                np.setOptions({ streamURL: null });
                resolve();
            } catch (err) {
                reject(err);
            }
        })
    };

    switchCamera = () => {
        return RTMPModule.switchCamera();
    };

    enableAudio = () => {

    };

    disableAudio = () => {

    };

    enableVideo = () => {

    };

    disableVideo = () => {

    };

    render() {
        const { style, children } = this.props;
        return (
            <View ref={'vidContainer'} style={style}>
                <object style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} ref={CAMERA_REF} classID="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="100%" height="100%" id="NodePublisher">
                    <param name="movie" value="/NodePublisher/NodePublisher.swf" />
                    <param name="quality" value="high" />
                    <param name="bgcolor" value="#ffffff" />
                    <param name="allowScriptAccess" value="always" />
                    <param name="allowFullScreen" value="true" />
                </object>
            </View>
        )
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

module.exports = RNLive;