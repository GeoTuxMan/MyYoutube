import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, TextInput, Button, Alert, Text } from 'react-native';
import { Video, AVPlaybackStatus } from 'expo-av';
import YoutubeIframe from 'react-native-youtube-iframe';
import Slider from '@react-native-community/slider';

export default function MyVideo() {
  const [inputUrl, setInputUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | {}>({});

  const getYoutubeVideoId = (url: string) => {
    // Verificăm dacă inputul este direct un ID (11 caractere)
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
      return url;
    }
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return match[2];
    }
    return null;
  };

  const handlePlayVideo = () => {
    const videoId = getYoutubeVideoId(inputUrl);
    if (videoId) {
      setYoutubeVideoId(videoId);
      setVideoUrl(null);
    } else {
      setVideoUrl(inputUrl);
      setYoutubeVideoId(null);
    }
  };

  const onStateChange = useCallback((state: string) => {
    if (state === "ended") {
      Alert.alert("video has finished playing!");
    }
  }, []);
  
  const handleValueChange = (value: number) => {
      if (videoRef.current && 'durationMillis' in status && status.durationMillis) {
          videoRef.current.setPositionAsync(value * status.durationMillis);
      }
  }
  
  const isPlaying = 'isPlaying' in status && status.isPlaying;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MyVideo - Video Player App</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter video URL (direct or YouTube)"
          onChangeText={setInputUrl}
          value={inputUrl}
        />
        <Button title="Play Video" onPress={handlePlayVideo} />
      </View>

      {youtubeVideoId && (
        <View style={styles.videoWrapper}>
          <YoutubeIframe
            height={300}
            play={true}
            videoId={youtubeVideoId}
            onChangeState={onStateChange}
          />
        </View>
      )}

      {videoUrl && (
        <>
          <Video
            ref={videoRef}
            style={styles.video}
            source={{ uri: videoUrl }}
            useNativeControls
            resizeMode="contain"
            isLooping
            onPlaybackStatusUpdate={status => setStatus(() => status)}
          />
          <View style={styles.controls}>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={1}
                  value={'isLoaded' in status && status.isLoaded ? ('positionMillis' in status && status.positionMillis && 'durationMillis' in status && status.durationMillis ? status.positionMillis / status.durationMillis : 0) : 0}
                  onValueChange={handleValueChange}
                />
            <View style={styles.buttons}>
              <Button title={isPlaying ? 'Pause' : 'Play'} onPress={() => isPlaying ? videoRef.current?.pauseAsync() : videoRef.current?.playAsync()} />
              <Button title="Rewind" onPress={() => videoRef.current?.setPositionAsync(('positionMillis' in status && status.positionMillis ? status.positionMillis : 0) - 10000)} />
              <Button title="Forward" onPress={() => videoRef.current?.setPositionAsync(('positionMillis' in status && status.positionMillis ? status.positionMillis : 0) + 10000)} />
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    width: '90%',
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    marginRight: 10,
  },
  videoWrapper: {
    width: '100%',
  },
  video: {
    width: '100%',
    height: 300,
  },
  controls: {
      width: '90%'
  },
  buttons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 10
  },
  slider: {
      width: '100%',
      height: 40
  }
});