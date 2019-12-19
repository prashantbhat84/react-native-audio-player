import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  PermissionsAndroid,
  Button,
  Platform,
  Alert,
} from 'react-native';
import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioSet,
  AudioSourceAndroidType,
} from 'react-native-audio-recorder-player';
import RNFetchBlob from 'rn-fetch-blob';
import Firebase from './config/Firebase';
const App = () => {
  const [recordSeconds, setRecSecs] = useState(0);
  const [recordTime, setRecTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const audioRecorderPlayer = new AudioRecorderPlayer();

  useEffect(async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Permissions for write access',
          message: 'Give permission to your storage to write a file',
          buttonPositive: 'ok',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the storage');
      } else {
        console.log('permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Permissions for write access',
          message: 'Give permission to your storage to write a file',
          buttonPositive: 'ok',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the camera');
      } else {
        console.log('permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  }, []);
  const startRec = async () => {
    console.log('rec started');
    const dirs = RNFetchBlob.fs.dirs.DocumentDir;

    const path = Platform.select({
      ios: 'hello.m4a',
      android: dirs + '/sound.mp4',
    });
    const audioSet = {
      AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
      AudioSourceAndroid: AudioSourceAndroidType.MIC,
      AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
      AVNumberOfChannelsKeyIOS: 2,
      AVFormatIDKeyIOS: AVEncodingOption.aac,
    };
    console.log('audioSet', audioSet);

    setIsRecording(true);
    if (setIsRecording) {
      const result = await audioRecorderPlayer.startRecorder(path, audioSet);
      setTimeout(() => {
        console.log(`result :${result}`);
        setIsRecording(false);
        Alert.alert('Info', 'recording complete');
        stopRec();
      }, 5000);
    }
  };
  const stopRec = async () => {
    const result = await audioRecorderPlayer.stopRecorder();

    console.log(result);
    const date = new Date();
    Firebase.database()
      .ref('/audio/')
      .set({
        audioRecord: result,
        createdAt: date,
      });
  };
  const playRec = async () => {
    console.log('play started');
    let data = Firebase.database().ref('/audio');
    data.on('value', snapshot => {
      console.log(snapshot.val().audioRecord);
      audioRecorderPlayer
        .startPlayer(snapshot.val().audioRecord)
        .then(msg => {
          console.log(msg);
        })
        .catch(e => {
          console.log(e);
        });
    });
    console.log(data);
  };
  return (
    <View style={styles.container}>
      <View style={styles.button}>
        <Button title="Record" onPress={startRec} />
        {isRecording && (
          <View>
            <Text style={{color: 'red', fontSize: 20}}>LIVE</Text>
          </View>
        )}
      </View>
      <View>
        <Button title="Play" onPress={playRec} />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    marginBottom: 10,
    marginTop: 10,
  },
});

export default App;
