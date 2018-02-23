import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    Dimensions,
    Image,
    TouchableOpacity
} from 'react-native';
import PropTypes from 'prop-types';
import sockio from 'socket.io-client';

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
            var video = this.refs[CAMERA_REF];
            var vidContainer = this.refs['vidContainer'];
            video.setAttribute('playsinline', '');
            video.setAttribute('autoplay', '');
            // video.setAttribute('muted', '');
            const w = vidContainer._reactInternalInstance._renderedComponent._hostNode.clientWidth;
            const h = vidContainer._reactInternalInstance._renderedComponent._hostNode.clientHeight;
            video.style.width = w + 'px';
            video.style.height = h + 'px';

            /* Setting up the constraint */
            var facingMode = this.props.cameraFronted ? 'user' : 'environment'; // Can be 'user' or 'environment' to access back or front camera (NEAT!)
            var constraints = {
                audio: true,
                video: {
                    // width: { exact: w }, 
                    // height: { exact: w / 1.7777777777777777 },
                    facingMode: facingMode
                }
            };

            /* Stream it to video element */
            navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
            navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
                this.Stream = stream;
                this.Blob = window.URL.createObjectURL(this.Stream);
                video.srcObject = stream;
                resolve();
            }).catch(err => {
                Alert.alert(
                    "Camera Error",
                    "We were unable to find your Webcam, or permissions were denied. If this continues to occur, you may have to clear your cache and try again.",
                    [
                        { text: 'Okay', onPress: () => { } }
                    ]
                )
                reject(err);
            });
        })
    };

    startPublish = (rtmpUrl) => {
        return new Promise((resolve, reject) => {
            var video = this.refs[CAMERA_REF];
            let url = rtmpUrl.replace('rtmp:', 'ws:').replace('1326', '1327');

            var mediaRecorder = new MediaStreamRecorder(this.Stream);
            mediaRecorder.mimeType = 'video/webm';
            mediaRecorder.ondataavailable = function (blob) {
                // POST/PUT "Blob" using FormData/XHR2
                var blobURL = URL.createObjectURL(blob);
                // document.write('<a href="' + blobURL + '">' + blobURL + '</a>');
                var socket = new WebSocket(url + '.flv');
                socket.binaryType = 'blob';

                socket.send(this.Blob);

            };
            mediaRecorder.start(3000);


            // const socket = sockio(url, {
            //     useRegTimeout: true,
            //     reconnectionDelay: 1000,
            //     reconnection: true,
            //     reconnectionAttempts: 10,
            //     transports: ['websocket'],
            //     agent: false,
            //     upgrade: false,
            //     rejectUnauthorized: false
            // });

            // video.src = this.Blob;
            // video.play();
            // console.log(this.Blob);
            // socket.emit('data', this.Blob);
        })
    };

    stopPublish = () => {
        return RTMPModule.stopStream();
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
                <video ref={CAMERA_REF} />
                {children}
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